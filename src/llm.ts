/**
 * LLM integration — supports two backends:
 *   1. Generic OpenAI-compatible endpoint (VITE_OPENAI_BASE_URL + VITE_OPENAI_API_KEY + VITE_OPENAI_MODEL)
 *   2. Azure OpenAI / Merck NLP gateway (VITE_AZURE_OPENAI_* vars)
 * The OpenAI-compatible backend takes priority when both are configured.
 *
 * Used for:
 *  - Sprechen examiner conversation
 *  - Schreiben Teil 2 evaluation (strict grammar + declension assessment)
 *  - Sprechen final grading
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// ── Backend detection ─────────────────────────────────────────────

function hasOpenAI(): boolean {
  return !!(import.meta.env.VITE_OPENAI_BASE_URL && import.meta.env.VITE_OPENAI_API_KEY);
}

function hasAzure(): boolean {
  return !!(import.meta.env.VITE_AZURE_OPENAI_ENDPOINT && import.meta.env.VITE_AZURE_OPENAI_API_KEY);
}

export function isLLMConfigured(): boolean {
  return hasOpenAI() || hasAzure();
}

// ── Core chat completion ──────────────────────────────────────────

export async function chatCompletion(messages: ChatMessage[]): Promise<string> {
  if (hasOpenAI()) {
    return chatOpenAI(messages);
  }
  if (hasAzure()) {
    return chatAzure(messages);
  }
  throw new Error('No LLM configured — set VITE_OPENAI_BASE_URL + VITE_OPENAI_API_KEY or VITE_AZURE_OPENAI_* in .env');
}

async function chatOpenAI(messages: ChatMessage[]): Promise<string> {
  const base = import.meta.env.VITE_OPENAI_BASE_URL.replace(/\/$/, '');
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';

  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, max_tokens: 1200, temperature: 0.4 }),
  });

  if (!res.ok) throw new Error(`OpenAI error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

async function chatAzure(messages: ChatMessage[]): Promise<string> {
  const apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY;
  const deployment = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = import.meta.env.VITE_AZURE_OPENAI_API_VERSION;

  const base = import.meta.env.DEV
    ? '/api/openai'
    : `${import.meta.env.VITE_AZURE_OPENAI_ENDPOINT}/openai`;

  const url = `${base}/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify({ messages, max_tokens: 1200, temperature: 0.4 }),
  });

  if (!res.ok) throw new Error(`Azure LLM error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

// ── Sprechen evaluation ───────────────────────────────────────────

export async function evaluateSprechen(
  conversation: ChatMessage[],
): Promise<{ score: number; feedback: string }> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `Du bist ein strenger telc A1 Deutsch Prüfer für die mündliche Prüfung (Sprechen).
Bewerte die Antworten des Kandidaten auf einer Skala von 0-15 Punkten.
Sei realistisch und streng. Viele Fehler = niedrige Punktzahl.

Kriterien (je 0-5 Punkte pro Kategorie bis zu 15 gesamt):
1. Aufgabenerfüllung — Hat der Kandidat die Aufgabe verstanden und vollständig beantwortet?
2. Wortschatz und Grammatik — Korrekte A1-Formen (Verbkonjugation, Artikel, Kasus)?
3. Aussprache und Flüssigkeit — Verständlich? Sinnvolle Pausen?

Antworte GENAU in diesem Format:
PUNKTE: [0-15]
FEEDBACK: [3-4 Sätze auf Deutsch. Nenne konkrete Fehler und Verbesserungsvorschläge.]`,
    },
    ...conversation,
    {
      role: 'user',
      content: 'Bitte bewerte jetzt die gesamte mündliche Leistung des Kandidaten.',
    },
  ];

  try {
    const response = await chatCompletion(messages);
    const scoreMatch = response.match(/PUNKTE:\s*(\d+)/);
    const feedbackMatch = response.match(/FEEDBACK:\s*([\s\S]+)/);
    return {
      score: scoreMatch ? Math.min(15, parseInt(scoreMatch[1])) : 8,
      feedback: feedbackMatch ? feedbackMatch[1].trim() : response,
    };
  } catch {
    return { score: 8, feedback: 'Automatische Bewertung nicht verfügbar (LLM-Fehler). Standardpunktzahl vergeben.' };
  }
}

// ── Schreiben Teil 2 evaluation ───────────────────────────────────

export async function evaluateSchreiben(
  situation: string,
  bullets: string[],
  userText: string,
  minWords: number,
): Promise<{ score: number; feedback: string }> {
  const wordCount = userText.trim().split(/\s+/).filter(Boolean).length;

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `Du bist ein strenger telc A1 Deutsch Korrektor für Schreiben Teil 2.
Bewerte die Nachricht auf einer Skala von 0-10 Punkten.
Sei realistisch: ein Text mit vielen Fehlern darf NICHT mehr als 5/10 bekommen.

Aufgabe: ${situation}
Geforderte Punkte: ${bullets.join(', ')}
Mindestwortzahl: ${minWords} Wörter (aktuell: ${wordCount})

BEWERTUNGSSCHEMA:
A) Aufgabenerfüllung (0-3 Punkte):
   - Alle geforderten Punkte angesprochen? (0-2 Pt.)
   - Anrede und Abschiedsformel vorhanden? (0-1 Pt.)

B) Sprachliche Korrektheit (0-4 Punkte — Abzüge summieren sich):
   - Falscher Artikel (der/die/das): -0,5 pro Fehler
   - Falscher Kasus (Nom./Akk./Dat.): -0,5 pro Fehler, z.B. "Ich habe einen Hunger" statt "Ich habe Hunger"
   - Falsche Verbkonjugation: -0,5 pro Fehler, z.B. "ich geht" statt "ich gehe"
   - Falsche Wortstellung (Verb-Zweit-Regel): -0,5 pro Verletzung
   - Rechtschreibfehler (Großschreibung Substantive, Umlaute, Doppelkonsonanten): -0,25 pro Fehler
   Startpunkte: 4, zieht bei jedem Fehler ab. Mindestens 0.

C) Textzusammenhang und Umfang (0-3 Punkte):
   - Zusammenhängende, verständliche Sätze? (0-2 Pt.)
   - Mindestwortzahl erreicht? Sonst -1 Pt.

Liste alle gefundenen Fehler auf. Zähle die Abzüge transparent durch.

Antworte GENAU in diesem Format:
PUNKTE: [0-10]
FEHLER: [stichpunktartige Liste konkreter Fehler, z.B. "• 'ich geht' → 'ich gehe' (Verb)", "• 'den Mann' als Subjekt → Nominativ 'der Mann'"]
FEEDBACK: [2-3 motivierende Sätze mit den wichtigsten Verbesserungshinweisen]`,
    },
    { role: 'user', content: userText || '(Keine Antwort geschrieben)' },
  ];

  try {
    const response = await chatCompletion(messages);
    const scoreMatch = response.match(/PUNKTE:\s*(\d+(?:[.,]\d+)?)/);
    const feedbackMatch = response.match(/FEEDBACK:\s*([\s\S]+?)(?:\n\n|$)/);
    const fehlerMatch = response.match(/FEHLER:\s*([\s\S]+?)(?:FEEDBACK:|$)/);

    const rawScore = scoreMatch ? parseFloat(scoreMatch[1].replace(',', '.')) : 5;
    const feedback = [
      fehlerMatch ? fehlerMatch[1].trim() : '',
      feedbackMatch ? feedbackMatch[1].trim() : response,
    ].filter(Boolean).join('\n\n');

    return {
      score: Math.min(10, Math.max(0, rawScore)),
      feedback,
    };
  } catch {
    // Fallback: word-count scoring (conservative)
    const ratio = Math.min(1, wordCount / Math.max(1, minWords));
    return {
      score: Math.round(ratio * 6), // max 6 without LLM (can't assess quality)
      feedback: `Automatische Bewertung (LLM nicht verfügbar): ${wordCount} Wörter geschrieben (Minimum: ${minWords}). Ohne Sprachprüfung werden max. 6/10 vergeben.`,
    };
  }
}

// ── Sprechen examiner follow-up ───────────────────────────────────

export async function examinerFollowUp(
  teil: number,
  prompt: string,
  candidateResponse: string,
): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `Du bist ein freundlicher telc A1 Deutsch Prüfer in der mündlichen Prüfung (Teil ${teil}).
Du sprichst einfaches, klares Deutsch auf A1-Niveau.
Stelle eine kurze Nachfrage oder reagiere natürlich auf die Antwort des Kandidaten.
Maximal 1-2 kurze Sätze. Sei ermutigend.`,
    },
    { role: 'user', content: `Aufgabe: ${prompt}\nKandidat sagt: "${candidateResponse}"` },
  ];

  try {
    return await chatCompletion(messages);
  } catch {
    return 'Sehr gut, danke.';
  }
}
