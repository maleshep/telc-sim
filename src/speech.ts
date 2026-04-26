/**
 * Azure Neural TTS + browser STT for German speech.
 *
 * TTS: POST to Azure Speech Services via Vite proxy → Merck NLP gateway.
 *   - Voices: de-DE-KatjaNeural (female), de-DE-ConradNeural (male)
 *   - Returns MP3 audio bytes, played via <audio>.
 *   - Falls back to browser SpeechSynthesis if API unreachable.
 *
 * STT: Browser SpeechRecognition API (Chrome/Edge only).
 */

const SPEECH_KEY = import.meta.env.VITE_AZURE_SPEECH_KEY as string;

// In dev, use Vite proxy to avoid CORS. In production, use the full URL.
const SPEECH_BASE = import.meta.env.DEV
  ? '/api/speech'
  : (import.meta.env.VITE_AZURE_SPEECH_ENDPOINT as string);

// ── Audio cache to avoid re-requesting the same text ────────────
const audioCache = new Map<string, string>(); // text → objectURL
let currentAudio: HTMLAudioElement | null = null;

// ── TTS (Azure Neural) ──────────────────────────────────────────

export type Voice = 'de-DE-KatjaNeural' | 'de-DE-ConradNeural';

export async function speak(
  text: string,
  voice: Voice = 'de-DE-KatjaNeural',
  rate: 'slow' | 'medium' | 'fast' = 'medium',
): Promise<void> {
  // Stop any currently playing audio
  stopSpeaking();

  const cacheKey = `${voice}:${rate}:${text}`;

  let objectUrl = audioCache.get(cacheKey);

  if (!objectUrl) {
    try {
      objectUrl = await fetchAzureTTS(text, voice, rate);
      audioCache.set(cacheKey, objectUrl);
    } catch (err) {
      console.warn('Azure TTS failed, falling back to browser:', err);
      usingFallback = true;
      return speakBrowserFallback(text, rate);
    }
  }

  return playObjectUrl(objectUrl);
}

async function fetchAzureTTS(text: string, voice: Voice, rate: 'slow' | 'medium' | 'fast'): Promise<string> {
  const rateMap = { slow: '-20%', medium: '+0%', fast: '+15%' };
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="de-DE">
  <voice name="${voice}">
    <prosody rate="${rateMap[rate]}">${escapeXml(text)}</prosody>
  </voice>
</speak>`;

  const body = new URLSearchParams({
    text: ssml,
    azure_voice: voice,
    output_format: 'audio-24khz-48kbitrate-mono-mp3',
  });

  const res = await fetch(`${SPEECH_BASE}/text_to_speech`, {
    method: 'POST',
    headers: {
      'x-api-key': SPEECH_KEY,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!res.ok) {
    throw new Error(`TTS failed: ${res.status} ${res.statusText}`);
  }

  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

function playObjectUrl(objectUrl: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const audio = new Audio(objectUrl);
    currentAudio = audio;
    audio.onended = () => {
      currentAudio = null;
      resolve();
    };
    audio.onerror = () => {
      currentAudio = null;
      reject(new Error('Audio playback failed'));
    };
    audio.play().catch(reject);
  });
}

// ── Browser TTS fallback ──────────────────────────────────────────

/**
 * Pick the best German voice available in the browser.
 * Prefer neural / "Online" voices (Edge/Chrome ship high-quality ones).
 */
function pickBestGermanVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  const german = voices.filter(v => v.lang.startsWith('de'));
  if (german.length === 0) return null;

  // Rank: "Online" or "Neural" voices are dramatically better
  const neural = german.find(v =>
    /online|neural|natural/i.test(v.name),
  );
  if (neural) return neural;

  // Prefer female voice named Katja (matches Azure) or any de-DE
  const katja = german.find(v => /katja/i.test(v.name));
  if (katja) return katja;

  // Prefer de-DE over de-AT/de-CH
  const deDE = german.find(v => v.lang === 'de-DE');
  return deDE || german[0];
}

// Cache the voice lookup (voices load asynchronously in some browsers)
let cachedVoice: SpeechSynthesisVoice | null | undefined;
function getGermanVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice !== undefined) return cachedVoice;
  cachedVoice = pickBestGermanVoice();
  return cachedVoice;
}

// Re-cache when voices load asynchronously (Chrome fires this event)
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = pickBestGermanVoice();
  };
}

function speakBrowserFallback(text: string, rate: 'slow' | 'medium' | 'fast'): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error('No TTS available'));
      return;
    }

    // Chrome bug: speechSynthesis can get stuck. Cancel any prior utterances.
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = rate === 'slow' ? 0.8 : rate === 'fast' ? 1.15 : 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voice = getGermanVoice();
    if (voice) utterance.voice = voice;

    utterance.onend = () => resolve();
    utterance.onerror = (e) => {
      // "interrupted" and "canceled" are not real errors
      if (e.error === 'interrupted' || e.error === 'canceled') {
        resolve();
      } else {
        reject(new Error(`Browser TTS failed: ${e.error}`));
      }
    };

    window.speechSynthesis.speak(utterance);

    // Chrome bug workaround: long utterances silently stop after ~15s.
    // Pause/resume keeps the synth alive.
    if (text.length > 100) {
      const keepAlive = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          clearInterval(keepAlive);
          return;
        }
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }, 10000);
      utterance.onend = () => { clearInterval(keepAlive); resolve(); };
      utterance.onerror = (e) => {
        clearInterval(keepAlive);
        if (e.error === 'interrupted' || e.error === 'canceled') resolve();
        else reject(new Error(`Browser TTS failed: ${e.error}`));
      };
    }
  });
}

export function stopSpeaking(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function isTTSAvailable(): boolean {
  // Azure configured OR browser has speechSynthesis
  return Boolean(SPEECH_KEY && SPEECH_BASE) || Boolean(window.speechSynthesis);
}

/** True if Azure Neural TTS failed and we're using browser fallback */
let usingFallback = false;
export function isUsingFallbackTTS(): boolean { return usingFallback; }

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ── STT (Browser SpeechRecognition) ─────────────────────────────

function getSpeechRecognition(): any {
  return (window as any).SpeechRecognition
    || (window as any).webkitSpeechRecognition
    || null;
}

export function listen(lang = 'de-DE', timeoutMs = 20000): Promise<string> {
  return new Promise((resolve, reject) => {
    const SR = getSpeechRecognition();
    if (!SR) { reject(new Error('Speech recognition not supported')); return; }

    const recognition = new SR();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let settled = false;
    let transcript = '';

    const timer = setTimeout(() => {
      if (!settled) { settled = true; recognition.stop(); resolve(transcript); }
    }, timeoutMs);

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript + ' ';
        }
      }
    };

    recognition.onerror = (event: any) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        if (event.error === 'no-speech' || event.error === 'aborted') resolve(transcript);
        else reject(new Error(`STT error: ${event.error}`));
      }
    };

    recognition.onend = () => {
      if (!settled) { settled = true; clearTimeout(timer); resolve(transcript.trim()); }
    };

    recognition.start();
  });
}

export function isSTTAvailable(): boolean {
  return getSpeechRecognition() !== null;
}
