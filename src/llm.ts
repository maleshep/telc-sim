/**
 * LLM integration via Azure OpenAI (Merck NLP gateway).
 * Used for:
 *  - Sprechen examiner conversation
 *  - Schreiben Teil 2 evaluation
 *  - Sprechen final grading
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// ── Core chat completion ──────────────────────────────────────────

export async function chatCompletion(messages: ChatMessage[]): Promise<string> {
  const apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY;
  const deployment = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = import.meta.env.VITE_AZURE_OPENAI_API_VERSION;

  if (!apiKey) {
    throw new Error('LLM not configured — set VITE_AZURE_OPENAI_* in .env');
  }

  // In dev, use Vite proxy to avoid CORS. In production, use the full URL.
  const base = import.meta.env.DEV
    ? '/api/openai'
    : `${import.meta.env.VITE_AZURE_OPENAI_ENDPOINT}/openai`;

  const url = `${base}/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify({ messages, max_tokens: 1000, temperature: 0.7 }),
  });

  if (!res.ok) throw new Error(`LLM error ${res.status}: ${await res.text()}`);

  const data = await res.json();
  return data.choices[0].message.content;
}

export function isLLMConfigured(): boolean {
  return !!(import.meta.env.VITE_AZURE_OPENAI_ENDPOINT && import.meta.env.VITE_AZURE_OPENAI_API_KEY);
}

// ── Sprechen evaluation ───────────────────────────────────────────

export async function evaluateSprechen(
  conversation: ChatMessage[],
): Promise<{ score: number; feedback: string }> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `Du bist ein telc A1 Deutsch Prüfer für die mündliche Prüfung (Sprechen).
Bewerte die Antworten des Kandidaten auf einer Skala von 0-25 Punkten.
Kriterien:
1. Aufgabenerfüllung (Hat der Kandidat die Aufgabe verstanden und beantwortet?)
2. Wortschatz (A1-angemessen?)
3. Grammatik (Einfache Sätze, Präsens, Grundstruktur?)
4. Interaktion (Reagiert auf Fragen? Stellt eigene Fragen?)

Antworte GENAU in diesem Format:
PUNKTE: [0-25]
FEEDBACK: [3-4 Sätze auf Deutsch, ermutigend aber ehrlich. Nenne konkrete Stärken und Verbesserungsvorschläge.]`,
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
      score: scoreMatch ? Math.min(25, parseInt(scoreMatch[1])) : 15,
      feedback: feedbackMatch ? feedbackMatch[1].trim() : response,
    };
  } catch {
    return { score: 15, feedback: 'Automatische Bewertung nicht verfügbar (LLM-Fehler). Standardpunktzahl vergeben.' };
  }
}

// ── Schreiben Teil 2 evaluation ───────────────────────────────────

export async function evaluateSchreiben(
  situation: string,
  bullets: string[],
  userText: string,
  minWords: number,
): Promise<{ score: number; feedback: string }> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `Du bist ein telc A1 Deutsch Prüfer für den schriftlichen Teil (Schreiben Teil 2).
Bewerte die Nachricht des Kandidaten auf einer Skala von 0-15 Punkten.
Kriterien:
1. Aufgabenerfüllung — Sind alle Punkte behandelt? (${bullets.join(', ')})
2. Wortschatz — A1-angemessen?
3. Grammatik — Einfache Sätze, wenig Fehler?
4. Textaufbau — Anrede, Schluss, zusammenhängend?

Mindestwortzahl: ${minWords} Wörter.
Die Aufgabe: ${situation}

Antworte GENAU in diesem Format:
PUNKTE: [0-15]
FEEDBACK: [2-3 Sätze auf Deutsch, ermutigend aber ehrlich.]`,
    },
    { role: 'user', content: userText || '(Keine Antwort geschrieben)' },
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
    // Fallback: word-count scoring
    const wordCount = userText.trim().split(/\s+/).filter(Boolean).length;
    const ratio = Math.min(1, wordCount / Math.max(1, minWords));
    return {
      score: Math.round(ratio * 10),
      feedback: `Automatische Bewertung (LLM nicht verfügbar): ${wordCount} Wörter geschrieben (Minimum: ${minWords}).`,
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
