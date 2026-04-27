// TELC A1 Exam data types

export interface HoerenItem {
  id: number;
  audio: string;        // Text for TTS to read aloud (the "audio" script)
  context?: string;     // Scene context shown before audio plays
  question: string;
  options: string[];    // ["a) ...", "b) ...", "c) ..."]
  correct: string;      // "a", "b", "c" or "richtig"/"falsch"
}

export interface HoerenTeil {
  instruction: string;
  items: HoerenItem[];
  replays: number;      // How many times audio can be replayed (typically 2)
}

export interface LesenItem {
  id: number;
  text: string;         // The reading text
  question: string;
  options: string[];
  correct: string;
}

export interface LesenTeil {
  instruction: string;
  items: LesenItem[];
}

export interface SchreibenTeil1 {
  instruction: string;
  formTitle: string;
  personCard: string[];   // Fictional person's data shown to the user
  fields: { label: string; answer: string; hint?: string }[];
}

export interface SchreibenTeil2 {
  instruction: string;
  situation: string;
  bullets: string[];    // Points to address
  minWords: number;
}

export interface SprechenTeil {
  teil: number;
  instruction: string;
  prompts: string[];    // Examiner prompts / word cards
  exampleResponse?: string;
}

export interface TelcTest {
  id: number;
  name: string;
  hoeren: { teil1: HoerenTeil; teil2: HoerenTeil; teil3: HoerenTeil };
  lesen: { teil1: LesenTeil; teil2: LesenTeil; teil3: LesenTeil };
  schreiben: { teil1: SchreibenTeil1; teil2: SchreibenTeil2 };
  sprechen: { teil1: SprechenTeil; teil2: SprechenTeil; teil3: SprechenTeil };
}

export type Section = 'hoeren' | 'lesen' | 'schreiben' | 'sprechen';
export type Teil = 'teil1' | 'teil2' | 'teil3';

export interface Answer {
  section: Section;
  teil: Teil;
  itemId: number;
  value: string;
}

export interface SectionScore {
  section: Section;
  correct: number;
  total: number;
  points: number;
  maxPoints: number;
  passed: boolean;
}

export interface ExamResult {
  testId: number;
  sections: SectionScore[];
  totalPoints: number;
  maxPoints: number;
  passed: boolean;
  sprechenFeedback?: string;
  schreibenFeedback?: string;
}
