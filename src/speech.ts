/**
 * Speech — TTS and STT with multi-backend support.
 *
 * TTS priority:
 *   1. OpenAI-compatible TTS  (VITE_OPENAI_BASE_URL + VITE_OPENAI_API_KEY)
 *      POST /audio/speech  →  { model: "tts-1", voice: "alloy", input }  →  mp3
 *   2. Azure Neural TTS       (VITE_AZURE_SPEECH_KEY + VITE_AZURE_SPEECH_ENDPOINT)
 *      POST /text_to_speech (SSML)  →  mp3
 *   3. Browser SpeechSynthesis (fallback, always available)
 *
 * STT priority:
 *   1. OpenAI Whisper         (VITE_OPENAI_BASE_URL + VITE_OPENAI_API_KEY)
 *      MediaRecorder → POST /audio/transcriptions (Whisper)
 *   2. Browser SpeechRecognition (Chrome/Edge only)
 */

// ── Config ────────────────────────────────────────────────────────

const OPENAI_BASE = (import.meta.env.VITE_OPENAI_BASE_URL as string | undefined)?.replace(/\/$/, '');
const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
const OPENAI_TTS_VOICE = (import.meta.env.VITE_OPENAI_TTS_VOICE as string | undefined) || 'alloy';
const OPENAI_TTS_MODEL = (import.meta.env.VITE_OPENAI_TTS_MODEL as string | undefined) || 'tts-1';

const AZURE_SPEECH_KEY = import.meta.env.VITE_AZURE_SPEECH_KEY as string | undefined;
const AZURE_SPEECH_BASE = import.meta.env.DEV
  ? '/api/speech'
  : (import.meta.env.VITE_AZURE_SPEECH_ENDPOINT as string | undefined);

function hasOpenAITTS(): boolean {
  return !!(OPENAI_BASE && OPENAI_KEY);
}
function hasOpenAISTT(): boolean {
  return !!(OPENAI_BASE && OPENAI_KEY);
}
function hasAzureTTS(): boolean {
  return !!(AZURE_SPEECH_KEY && AZURE_SPEECH_BASE);
}

// ── Audio cache + state ───────────────────────────────────────────

const AUDIO_CACHE_MAX = 30;
const audioCache = new Map<string, string>(); // cacheKey → objectURL (LRU, capped at AUDIO_CACHE_MAX)

function setCacheEntry(key: string, url: string): void {
  if (audioCache.has(key)) {
    audioCache.delete(key); // re-insert to refresh LRU position
  } else if (audioCache.size >= AUDIO_CACHE_MAX) {
    // Evict oldest entry and revoke its object URL to free memory
    const oldest = audioCache.keys().next().value;
    if (oldest !== undefined) {
      URL.revokeObjectURL(audioCache.get(oldest)!);
      audioCache.delete(oldest);
    }
  }
  audioCache.set(key, url);
}
let currentAudio: HTMLAudioElement | null = null;
let usingFallback = false;

// ── TTS entry point ───────────────────────────────────────────────

export type Voice = 'de-DE-KatjaNeural' | 'de-DE-ConradNeural';

export async function speak(
  text: string,
  _voice: Voice = 'de-DE-KatjaNeural',
  rate: 'slow' | 'medium' | 'fast' = 'medium',
): Promise<void> {
  stopSpeaking();

  const cacheKey = `${rate}:${text}`;
  let objectUrl = audioCache.get(cacheKey);

  if (!objectUrl) {
    try {
      if (hasOpenAITTS()) {
        objectUrl = await fetchOpenAITTS(text, rate);
      } else if (hasAzureTTS()) {
        objectUrl = await fetchAzureTTS(text, _voice, rate);
      } else {
        throw new Error('no API TTS configured');
      }
      setCacheEntry(cacheKey, objectUrl);
    } catch (err) {
      console.warn('API TTS failed, falling back to browser:', err);
      usingFallback = true;
      return speakBrowserFallback(text, rate);
    }
  }

  return playObjectUrl(objectUrl);
}

// ── OpenAI-compatible TTS ────────────────────────────────────────

async function fetchOpenAITTS(text: string, rate: 'slow' | 'medium' | 'fast'): Promise<string> {
  // OpenAI TTS doesn't support SSML rate control; use speed parameter
  const speedMap = { slow: 0.8, medium: 1.0, fast: 1.15 };

  const res = await fetch(`${OPENAI_BASE}/audio/speech`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_TTS_MODEL,
      voice: OPENAI_TTS_VOICE,
      input: text,
      speed: speedMap[rate],
    }),
  });

  if (!res.ok) throw new Error(`OpenAI TTS ${res.status}: ${res.statusText}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

// ── Azure Neural TTS ─────────────────────────────────────────────

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

  const res = await fetch(`${AZURE_SPEECH_BASE}/text_to_speech`, {
    method: 'POST',
    headers: {
      'x-api-key': AZURE_SPEECH_KEY!,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!res.ok) throw new Error(`Azure TTS ${res.status}: ${res.statusText}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

function playObjectUrl(objectUrl: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const audio = new Audio(objectUrl);
    currentAudio = audio;
    audio.onended = () => { currentAudio = null; resolve(); };
    audio.onerror = () => { currentAudio = null; reject(new Error('Audio playback failed')); };
    audio.play().catch(reject);
  });
}

// ── Browser TTS fallback ──────────────────────────────────────────

function pickBestGermanVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  const german = voices.filter(v => v.lang.startsWith('de'));
  if (german.length === 0) return null;
  const neural = german.find(v => /online|neural|natural/i.test(v.name));
  if (neural) return neural;
  const katja = german.find(v => /katja/i.test(v.name));
  if (katja) return katja;
  return german.find(v => v.lang === 'de-DE') || german[0];
}

let cachedVoice: SpeechSynthesisVoice | null | undefined;
function getGermanVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice !== undefined) return cachedVoice;
  cachedVoice = pickBestGermanVoice();
  return cachedVoice;
}
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => { cachedVoice = pickBestGermanVoice(); };
}

function speakBrowserFallback(text: string, rate: 'slow' | 'medium' | 'fast'): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (!window.speechSynthesis) { reject(new Error('No TTS available')); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = rate === 'slow' ? 0.8 : rate === 'fast' ? 1.15 : 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    const voice = getGermanVoice();
    if (voice) utterance.voice = voice;

    const resolveOrReject = (err?: string) => {
      if (err && err !== 'interrupted' && err !== 'canceled') reject(new Error(`Browser TTS: ${err}`));
      else resolve();
    };
    utterance.onend = () => resolve();
    utterance.onerror = (e) => resolveOrReject(e.error);

    window.speechSynthesis.speak(utterance);

    if (text.length > 100) {
      const keepAlive = setInterval(() => {
        if (!window.speechSynthesis.speaking) { clearInterval(keepAlive); return; }
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }, 10000);
      utterance.onend = () => { clearInterval(keepAlive); resolve(); };
      utterance.onerror = (e) => { clearInterval(keepAlive); resolveOrReject(e.error); };
    }
  });
}

export function stopSpeaking(): void {
  if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; currentAudio = null; }
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

export function isTTSAvailable(): boolean {
  return hasOpenAITTS() || hasAzureTTS() || Boolean(window.speechSynthesis);
}

export function isUsingFallbackTTS(): boolean { return usingFallback; }

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

// ── STT ───────────────────────────────────────────────────────────

function getBrowserSpeechRecognition(): any {
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}

/**
 * Record audio via MediaRecorder and transcribe via OpenAI Whisper.
 * Returns when the user stops (silence / maxDuration exceeded).
 */
async function listenWhisper(lang = 'de-DE', maxDurationMs = 20000): Promise<string> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const chunks: Blob[] = [];

  // Prefer webm/opus (Firefox), fall back to default
  const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : undefined;

  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

  return new Promise<string>((resolve, reject) => {
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

    recorder.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });

      try {
        const form = new FormData();
        form.append('file', blob, 'recording.webm');
        form.append('model', import.meta.env.VITE_OPENAI_STT_MODEL || 'whisper-1');
        form.append('language', lang.split('-')[0]); // 'de'

        const res = await fetch(`${OPENAI_BASE}/audio/transcriptions`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${OPENAI_KEY}` },
          body: form,
        });

        if (!res.ok) throw new Error(`Whisper ${res.status}`);
        const data = await res.json();
        resolve(data.text?.trim() || '');
      } catch (err) {
        reject(err);
      }
    };

    recorder.start();
    setTimeout(() => { if (recorder.state !== 'inactive') recorder.stop(); }, maxDurationMs);
  });
}

/**
 * Browser SpeechRecognition STT (Chrome/Edge).
 */
function listenBrowser(lang = 'de-DE', timeoutMs = 20000): Promise<string> {
  return new Promise((resolve, reject) => {
    const SR = getBrowserSpeechRecognition();
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
        if (event.results[i].isFinal) transcript += event.results[i][0].transcript + ' ';
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

/**
 * Main listen entry point — tries Whisper if configured, falls back to browser STT.
 */
export async function listen(lang = 'de-DE', timeoutMs = 20000): Promise<string> {
  if (hasOpenAISTT()) {
    try {
      return await listenWhisper(lang, timeoutMs);
    } catch (err) {
      console.warn('Whisper STT failed, falling back to browser STT:', err);
    }
  }
  return listenBrowser(lang, timeoutMs);
}

export function isSTTAvailable(): boolean {
  return hasOpenAISTT() || getBrowserSpeechRecognition() !== null;
}
