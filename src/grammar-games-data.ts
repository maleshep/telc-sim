// TELC A1 Grammar Games Data
// Fill-in questions + Sentence Builder exercises

export type GrammarCategory =
  | 'conjugation'
  | 'modal'
  | 'accusative'
  | 'possessive'
  | 'negation'
  | 'separable'
  | 'imperative';

export const CATEGORY_LABELS: Record<GrammarCategory, string> = {
  conjugation: 'Konjugation',
  modal: 'Modalverben',
  accusative: 'Akkusativ',
  possessive: 'Possessivartikel',
  negation: 'Verneinung',
  separable: 'Trennbare Verben',
  imperative: 'Imperativ',
};

export const CATEGORY_COLORS: Record<GrammarCategory, string> = {
  conjugation: 'bg-section-hoeren text-white',
  modal: 'bg-telc text-white',
  accusative: 'bg-section-schreiben text-white',
  possessive: 'bg-section-lesen-dark text-white',
  negation: 'bg-wrong text-white',
  separable: 'bg-correct text-white',
  imperative: 'bg-gray-600 text-white',
};

export interface FillInQuestion {
  sentence: string;          // Use ___ for the blank
  options: string[];         // exactly 4
  correct: string;
  category: GrammarCategory;
  explanation: string;
}

export interface SentenceExercise {
  words: string[];           // correct order — shuffled in component
  focus: string;             // short grammar label shown on card
  tip: string;               // explanation shown after wrong answer
}

// ── Fill-in Questions ─────────────────────────────────────────────

export const fillInQuestions: FillInQuestion[] = [
  // ── Conjugation ───────────────────────────────────────────────
  {
    sentence: 'Ich ___ in München.',
    options: ['wohne', 'wohnst', 'wohnt', 'wohnen'],
    correct: 'wohne',
    category: 'conjugation',
    explanation: 'ich → wohne (1. Person Singular: Stamm + -e)',
  },
  {
    sentence: 'Er ___ jeden Morgen Kaffee.',
    options: ['trinkt', 'trinkst', 'trinken', 'trinke'],
    correct: 'trinkt',
    category: 'conjugation',
    explanation: 'er/sie/es → trinkt (3. Person Singular: Stamm + -t)',
  },
  {
    sentence: 'Wir ___ aus der Schweiz.',
    options: ['kommen', 'kommt', 'kommst', 'komme'],
    correct: 'kommen',
    category: 'conjugation',
    explanation: 'wir → kommen (1. Person Plural = Infinitiv)',
  },
  {
    sentence: 'Du ___ sehr gut Deutsch.',
    options: ['sprichst', 'spricht', 'sprechen', 'spreche'],
    correct: 'sprichst',
    category: 'conjugation',
    explanation: 'sprechen: du → sprichst (Vokalwechsel e→i)',
  },
  {
    sentence: 'Sie (sie, 3. Person) ___ Ärztin von Beruf.',
    options: ['ist', 'bin', 'sind', 'seid'],
    correct: 'ist',
    category: 'conjugation',
    explanation: 'sein: er/sie/es → ist',
  },
  {
    sentence: 'Ich ___ zwei Kinder.',
    options: ['habe', 'hat', 'haben', 'hast'],
    correct: 'habe',
    category: 'conjugation',
    explanation: 'haben: ich → habe',
  },
  {
    sentence: 'Ihr ___ heute in der Schule.',
    options: ['seid', 'bin', 'sind', 'ist'],
    correct: 'seid',
    category: 'conjugation',
    explanation: 'sein: ihr → seid',
  },
  {
    sentence: 'Er ___ gerne mit dem Fahrrad.',
    options: ['fährt', 'fahre', 'fahren', 'fährst'],
    correct: 'fährt',
    category: 'conjugation',
    explanation: 'fahren: er → fährt (Vokalwechsel a→ä)',
  },
  {
    sentence: 'Wie ___ du? (heißen)',
    options: ['heißt', 'heiße', 'heißen', 'heißt'],
    correct: 'heißt',
    category: 'conjugation',
    explanation: 'heißen: du → heißt',
  },
  {
    sentence: 'Das Kind ___ gerade Hausaufgaben.',
    options: ['macht', 'mache', 'machen', 'machst'],
    correct: 'macht',
    category: 'conjugation',
    explanation: 'er/sie/es → Stamm + -t: macht',
  },
  {
    sentence: 'Woher ___ Sie? (formal)',
    options: ['kommen', 'kommt', 'kommst', 'komme'],
    correct: 'kommen',
    category: 'conjugation',
    explanation: 'Sie (formal) → kommen (wie Infinitiv)',
  },
  {
    sentence: 'Ihr ___ heute sehr fleißig.',
    options: ['arbeitet', 'arbeite', 'arbeiten', 'arbeitest'],
    correct: 'arbeitet',
    category: 'conjugation',
    explanation: 'ihr → Stamm + -t: arbeitet (Stamm endet auf -t: +et)',
  },

  // ── Modal Verbs ───────────────────────────────────────────────
  {
    sentence: 'Ich ___ ein Eis essen.',
    options: ['möchte', 'möchtest', 'möchten', 'möcht'],
    correct: 'möchte',
    category: 'modal',
    explanation: 'möchten: ich → möchte',
  },
  {
    sentence: 'Du ___ das nicht anfassen.',
    options: ['darfst', 'darf', 'dürfen', 'dürft'],
    correct: 'darfst',
    category: 'modal',
    explanation: 'dürfen: du → darfst',
  },
  {
    sentence: 'Wir ___ morgen früh aufstehen.',
    options: ['müssen', 'muss', 'musst', 'müsst'],
    correct: 'müssen',
    category: 'modal',
    explanation: 'müssen: wir → müssen (= Infinitiv)',
  },
  {
    sentence: 'Er ___ sehr gut schwimmen.',
    options: ['kann', 'kannst', 'können', 'könnt'],
    correct: 'kann',
    category: 'modal',
    explanation: 'können: er/sie/es → kann',
  },
  {
    sentence: 'Sie (formal) ___ hier nicht parken.',
    options: ['dürfen', 'darf', 'darfst', 'dürft'],
    correct: 'dürfen',
    category: 'modal',
    explanation: 'dürfen: Sie (formal) → dürfen (= Infinitiv)',
  },
  {
    sentence: 'Ich ___ heute Abend nicht ausgehen.',
    options: ['will', 'willst', 'wollen', 'wollt'],
    correct: 'will',
    category: 'modal',
    explanation: 'wollen: ich → will',
  },
  {
    sentence: 'Was ___ ich für Sie tun?',
    options: ['kann', 'kannst', 'können', 'könnt'],
    correct: 'kann',
    category: 'modal',
    explanation: 'können: ich → kann',
  },
  {
    sentence: '___ du mir bitte helfen?',
    options: ['Kannst', 'Kann', 'Können', 'Könnt'],
    correct: 'Kannst',
    category: 'modal',
    explanation: 'können: du → kannst (Verb steht bei Frage an 1. Stelle)',
  },
  {
    sentence: 'Sie ___ sehr gut tanzen. (sie, 3. Pers. Pl.)',
    options: ['können', 'kann', 'kannst', 'könnt'],
    correct: 'können',
    category: 'modal',
    explanation: 'können: sie (Plural) → können',
  },

  // ── Accusative ────────────────────────────────────────────────
  {
    sentence: 'Ich kaufe ___ Apfel. (ein)',
    options: ['einen', 'ein', 'eine', 'einem'],
    correct: 'einen',
    category: 'accusative',
    explanation: 'Apfel = maskulin → Akkusativ: ein → einen',
  },
  {
    sentence: 'Er sieht ___ Frau. (die)',
    options: ['die', 'der', 'dem', 'den'],
    correct: 'die',
    category: 'accusative',
    explanation: 'Frau = feminin → Akkusativ: die (unverändert)',
  },
  {
    sentence: 'Wir haben ___ Hund. (ein)',
    options: ['einen', 'ein', 'eine', 'einem'],
    correct: 'einen',
    category: 'accusative',
    explanation: 'Hund = maskulin → Akkusativ: ein → einen',
  },
  {
    sentence: 'Ich nehme ___ Buch. (das)',
    options: ['das', 'den', 'dem', 'die'],
    correct: 'das',
    category: 'accusative',
    explanation: 'Buch = neutral → Akkusativ: das (unverändert)',
  },
  {
    sentence: 'Er braucht ___ Hilfe. (keine)',
    options: ['keine', 'kein', 'keinen', 'keiner'],
    correct: 'keine',
    category: 'accusative',
    explanation: 'Hilfe = feminin → Akkusativ: keine (unverändert)',
  },
  {
    sentence: 'Hast du ___ Bruder? (ein)',
    options: ['einen', 'ein', 'eine', 'einem'],
    correct: 'einen',
    category: 'accusative',
    explanation: 'Bruder = maskulin → Akkusativ: ein → einen',
  },
  {
    sentence: 'Ich sehe ___ Mann dort. (der)',
    options: ['den', 'der', 'dem', 'die'],
    correct: 'den',
    category: 'accusative',
    explanation: 'Mann = maskulin, bestimmter Artikel → Akkusativ: der → den',
  },
  {
    sentence: 'Sie kauft ___ neues Auto. (ein)',
    options: ['ein', 'einen', 'eine', 'einem'],
    correct: 'ein',
    category: 'accusative',
    explanation: 'Auto = neutral → Akkusativ: ein (unverändert)',
  },

  // ── Possessive Articles ────────────────────────────────────────
  {
    sentence: 'Das ist ___ Buch. (mein, das Buch)',
    options: ['mein', 'meine', 'meinen', 'meiner'],
    correct: 'mein',
    category: 'possessive',
    explanation: 'Buch = neutral, Nominativ → mein (kein Endung)',
  },
  {
    sentence: 'Ich liebe ___ Mutter. (mein)',
    options: ['meine', 'mein', 'meinen', 'meiner'],
    correct: 'meine',
    category: 'possessive',
    explanation: 'Mutter = feminin, Akkusativ → meine',
  },
  {
    sentence: 'Er sucht ___ Schlüssel. (sein)',
    options: ['seinen', 'sein', 'seine', 'seiner'],
    correct: 'seinen',
    category: 'possessive',
    explanation: 'Schlüssel = maskulin, Akkusativ → seinen',
  },
  {
    sentence: 'Das ist ___ Auto. (ihr, von ihr)',
    options: ['ihr', 'ihre', 'ihren', 'ihrem'],
    correct: 'ihr',
    category: 'possessive',
    explanation: 'Auto = neutral, Nominativ → ihr (keine Endung)',
  },
  {
    sentence: 'Wir besuchen ___ Großeltern. (unser)',
    options: ['unsere', 'unser', 'unseren', 'unserem'],
    correct: 'unsere',
    category: 'possessive',
    explanation: 'Großeltern = Plural, Akkusativ → unsere',
  },
  {
    sentence: 'Ist das ___ Tasche? (dein)',
    options: ['deine', 'dein', 'deinen', 'deiner'],
    correct: 'deine',
    category: 'possessive',
    explanation: 'Tasche = feminin, Nominativ → deine',
  },
  {
    sentence: 'Er zeigt mir ___ Pass. (sein)',
    options: ['seinen', 'sein', 'seine', 'seiner'],
    correct: 'seinen',
    category: 'possessive',
    explanation: 'Pass = maskulin, Akkusativ → seinen',
  },

  // ── Negation ──────────────────────────────────────────────────
  {
    sentence: 'Ich spreche ___ Englisch.',
    options: ['kein', 'nicht', 'keine', 'keinen'],
    correct: 'kein',
    category: 'negation',
    explanation: 'Englisch = Nomen ohne Artikel → kein (neutral)',
  },
  {
    sentence: 'Er ist ___ müde.',
    options: ['nicht', 'kein', 'keine', 'keinen'],
    correct: 'nicht',
    category: 'negation',
    explanation: 'Adjektiv/Verb negieren → nicht',
  },
  {
    sentence: 'Wir haben ___ Zeit.',
    options: ['keine', 'kein', 'keinen', 'nicht'],
    correct: 'keine',
    category: 'negation',
    explanation: 'Zeit = feminin → keine Zeit (kein + -e)',
  },
  {
    sentence: 'Das stimmt ___.',
    options: ['nicht', 'kein', 'keine', 'keinen'],
    correct: 'nicht',
    category: 'negation',
    explanation: 'stimmt = Verb → nicht (meist am Satzende)',
  },
  {
    sentence: 'Ich habe ___ Auto.',
    options: ['kein', 'keine', 'keinen', 'nicht'],
    correct: 'kein',
    category: 'negation',
    explanation: 'Auto = neutral → kein Auto',
  },
  {
    sentence: 'Sie kommt heute ___.',
    options: ['nicht', 'kein', 'keine', 'keinen'],
    correct: 'nicht',
    category: 'negation',
    explanation: 'kommen = Verb → nicht (am Satzende)',
  },
  {
    sentence: 'Das ist ___ Problem.',
    options: ['kein', 'keine', 'keinen', 'nicht'],
    correct: 'kein',
    category: 'negation',
    explanation: 'Problem = neutral → kein Problem',
  },
  {
    sentence: 'Ich mag ___ Spinat.',
    options: ['keinen', 'kein', 'keine', 'nicht'],
    correct: 'keinen',
    category: 'negation',
    explanation: 'Spinat = maskulin, Akkusativ → keinen',
  },

  // ── Separable Verbs ───────────────────────────────────────────
  {
    sentence: 'Der Unterricht fängt um 9 Uhr ___.',
    options: ['an', 'auf', 'aus', 'ab'],
    correct: 'an',
    category: 'separable',
    explanation: 'anfangen → Präfix „an" geht ans Satzende',
  },
  {
    sentence: 'Wir rufen euch morgen ___.',
    options: ['an', 'auf', 'aus', 'ab'],
    correct: 'an',
    category: 'separable',
    explanation: 'anrufen → Präfix „an" geht ans Satzende',
  },
  {
    sentence: 'Mach bitte das Licht ___!',
    options: ['aus', 'an', 'auf', 'ab'],
    correct: 'aus',
    category: 'separable',
    explanation: 'ausmachen → Imperativ du: Präfix „aus" ans Ende',
  },
  {
    sentence: 'Er steht jeden Morgen um 6 Uhr ___.',
    options: ['auf', 'an', 'aus', 'ab'],
    correct: 'auf',
    category: 'separable',
    explanation: 'aufstehen → Präfix „auf" ans Satzende',
  },
  {
    sentence: 'Der Zug fährt in 5 Minuten ___.',
    options: ['ab', 'an', 'auf', 'aus'],
    correct: 'ab',
    category: 'separable',
    explanation: 'abfahren → Präfix „ab" ans Satzende',
  },
  {
    sentence: 'Sie macht die Tür ___.',
    options: ['auf', 'an', 'aus', 'ab'],
    correct: 'auf',
    category: 'separable',
    explanation: 'aufmachen → Präfix „auf" ans Satzende',
  },

  // ── Imperative ────────────────────────────────────────────────
  {
    sentence: '___ Sie bitte langsamer! (sprechen, formal)',
    options: ['Sprechen', 'Spreche', 'Sprich', 'Sprecht'],
    correct: 'Sprechen',
    category: 'imperative',
    explanation: 'Imperativ formell: Infinitiv + Sie → Sprechen Sie',
  },
  {
    sentence: '___ das Buch! (nehmen, du)',
    options: ['Nimm', 'Nehmen', 'Nehmt', 'Nimmt'],
    correct: 'Nimm',
    category: 'imperative',
    explanation: 'nehmen: du-Imperativ → Nimm (unregelmäßig, Vokalwechsel)',
  },
  {
    sentence: '___ Sie Platz! (nehmen, formal)',
    options: ['Nehmen', 'Nimm', 'Nehmt', 'Nehme'],
    correct: 'Nehmen',
    category: 'imperative',
    explanation: 'Imperativ formell: Nehmen Sie (Infinitiv + Sie)',
  },
  {
    sentence: '___ bitte leise! (sein, du)',
    options: ['Sei', 'Bist', 'Seid', 'Sind'],
    correct: 'Sei',
    category: 'imperative',
    explanation: 'sein: du-Imperativ → Sei (unregelmäßig)',
  },
  {
    sentence: '___ Sie mir bitte! (helfen, formal)',
    options: ['Helfen', 'Hilf', 'Helft', 'Helf'],
    correct: 'Helfen',
    category: 'imperative',
    explanation: 'Imperativ formell: Helfen Sie',
  },
  {
    sentence: '___ schnell! (laufen, du)',
    options: ['Lauf', 'Laufen', 'Läufst', 'Läuft'],
    correct: 'Lauf',
    category: 'imperative',
    explanation: 'laufen: du-Imperativ → Lauf (Stamm ohne -e)',
  },
  {
    sentence: '___ Sie die E-Mail! (schreiben, formal)',
    options: ['Schreiben', 'Schreib', 'Schreibt', 'Schreibe'],
    correct: 'Schreiben',
    category: 'imperative',
    explanation: 'Imperativ formell: Schreiben Sie',
  },
];

// ── Sentence Builder Exercises ────────────────────────────────────

export const sentenceExercises: SentenceExercise[] = [
  // V2 — time adverb first
  {
    words: ['Heute', 'gehe', 'ich', 'ins', 'Kino'],
    focus: 'V2-Wortstellung',
    tip: 'Nach einer Zeitangabe steht das Verb an Position 2: Zeitangabe – Verb – Subjekt.',
  },
  {
    words: ['Morgen', 'arbeitet', 'er', 'nicht'],
    focus: 'V2 nach Zeitangabe',
    tip: 'Zeitangabe vorne → Inversion: Verb vor Subjekt.',
  },
  {
    words: ['Jeden', 'Tag', 'lerne', 'ich', 'Deutsch'],
    focus: 'V2-Wortstellung',
    tip: 'Zeitangabe an Position 1 → Verb an Position 2.',
  },
  {
    words: ['Leider', 'habe', 'ich', 'keine', 'Zeit'],
    focus: 'V2 nach Adverb',
    tip: 'Adverb vorne → Inversion: Verb – Subjekt.',
  },
  {
    words: ['Jetzt', 'gehen', 'wir', 'nach', 'Hause'],
    focus: 'V2 nach Zeitangabe',
    tip: 'Zeitangabe zuerst → Verb an zweiter Stelle.',
  },

  // Yes/No questions (V1)
  {
    words: ['Sprichst', 'du', 'Deutsch'],
    focus: 'Ja/Nein-Frage',
    tip: 'Ja/Nein-Fragen beginnen mit dem konjugierten Verb.',
  },
  {
    words: ['Haben', 'Sie', 'einen', 'Termin'],
    focus: 'Ja/Nein-Frage',
    tip: 'Verb an erste Stelle bei Ja/Nein-Fragen.',
  },
  {
    words: ['Ist', 'das', 'Ihr', 'Buch'],
    focus: 'Ja/Nein-Frage',
    tip: 'sein an erster Stelle: Ist das...?',
  },
  {
    words: ['Kommt', 'er', 'heute', 'auch'],
    focus: 'Ja/Nein-Frage',
    tip: 'Verb an Position 1 bei Entscheidungsfragen.',
  },

  // W-questions
  {
    words: ['Woher', 'kommen', 'Sie'],
    focus: 'W-Frage',
    tip: 'W-Wort + Verb + Subjekt.',
  },
  {
    words: ['Was', 'möchten', 'Sie', 'trinken'],
    focus: 'W-Frage + Modalverb',
    tip: 'Modal an Position 2, Infinitiv ans Ende.',
  },
  {
    words: ['Wie', 'heißt', 'du'],
    focus: 'W-Frage',
    tip: 'W-Wort + konjugiertes Verb + Subjekt.',
  },
  {
    words: ['Wo', 'wohnen', 'Sie'],
    focus: 'W-Frage',
    tip: 'W-Wort + Verb + Subjekt.',
  },
  {
    words: ['Wann', 'beginnt', 'der', 'Kurs'],
    focus: 'W-Frage',
    tip: 'W-Wort + Verb + Subjekt.',
  },

  // Modal verb sentences
  {
    words: ['Ich', 'muss', 'heute', 'arbeiten'],
    focus: 'Modalverb',
    tip: 'Modal an Position 2, Infinitiv ans Satzende.',
  },
  {
    words: ['Er', 'kann', 'sehr', 'gut', 'kochen'],
    focus: 'Modalverb',
    tip: 'Modal an Position 2, Infinitiv ans Ende.',
  },
  {
    words: ['Wir', 'möchten', 'einen', 'Tisch', 'reservieren'],
    focus: 'Modalverb',
    tip: 'Modalverb + Infinitiv am Satzende.',
  },
  {
    words: ['Darf', 'ich', 'hier', 'rauchen'],
    focus: 'Modalverb + Frage',
    tip: 'Ja/Nein-Frage: Modal an Position 1.',
  },
  {
    words: ['Du', 'musst', 'Deutsch', 'lernen'],
    focus: 'Modalverb',
    tip: 'musst an Position 2, Infinitiv ans Ende.',
  },
  {
    words: ['Sie', 'dürfen', 'hier', 'nicht', 'parken'],
    focus: 'Modalverb + Verneinung',
    tip: 'nicht vor dem Infinitiv bei Modalverben.',
  },

  // Separable verbs
  {
    words: ['Ich', 'stehe', 'um', '7', 'Uhr', 'auf'],
    focus: 'Trennbares Verb',
    tip: 'aufstehen: „auf" geht ans Satzende.',
  },
  {
    words: ['Er', 'ruft', 'seine', 'Mutter', 'an'],
    focus: 'Trennbares Verb',
    tip: 'anrufen: „an" geht ans Satzende.',
  },
  {
    words: ['Wann', 'fährt', 'der', 'Zug', 'ab'],
    focus: 'Trennbares Verb + Frage',
    tip: 'abfahren: „ab" ans Ende.',
  },
  {
    words: ['Mach', 'bitte', 'das', 'Licht', 'an'],
    focus: 'Trennbares Verb + Imperativ',
    tip: 'anmachen, Imperativ du: Präfix ans Ende.',
  },
  {
    words: ['Sie', 'macht', 'das', 'Fenster', 'auf'],
    focus: 'Trennbares Verb',
    tip: 'aufmachen: „auf" ans Satzende.',
  },
  {
    words: ['Um', '9', 'Uhr', 'fängt', 'der', 'Kurs', 'an'],
    focus: 'Trennbares Verb + V2',
    tip: 'anfangen: „an" ans Ende. Zeitangabe vorne → Inversion.',
  },

  // Negation placement
  {
    words: ['Ich', 'spreche', 'kein', 'Englisch'],
    focus: 'Verneinung: kein',
    tip: '„kein" kommt direkt vor das Nomen ohne Artikel.',
  },
  {
    words: ['Er', 'kommt', 'heute', 'nicht'],
    focus: 'Verneinung: nicht',
    tip: '„nicht" steht meist am Satzende (wenn das ganze Verb negiert wird).',
  },
  {
    words: ['Sie', 'hat', 'kein', 'Auto'],
    focus: 'Verneinung: kein',
    tip: 'Auto = neutral → kein Auto (Akkusativ).',
  },
  {
    words: ['Heute', 'kann', 'ich', 'nicht', 'kommen'],
    focus: 'Verneinung + Modalverb',
    tip: '„nicht" steht vor dem Infinitiv bei Modalverben.',
  },
  {
    words: ['Das', 'ist', 'kein', 'Problem'],
    focus: 'Verneinung: kein',
    tip: 'Problem = neutral → kein Problem.',
  },

  // Accusative in context
  {
    words: ['Er', 'kauft', 'einen', 'Apfel'],
    focus: 'Akkusativ maskulin',
    tip: 'maskulin, unbestimmter Artikel → Akkusativ: einen.',
  },
  {
    words: ['Ich', 'sehe', 'die', 'Frau'],
    focus: 'Akkusativ feminin',
    tip: 'feminin Akkusativ: die bleibt die.',
  },
  {
    words: ['Wir', 'haben', 'einen', 'Hund'],
    focus: 'Akkusativ maskulin',
    tip: 'maskulin → Akkusativ: ein → einen.',
  },

  // Word order with adverbs
  {
    words: ['Sie', 'spricht', 'sehr', 'gut', 'Deutsch'],
    focus: 'Adverbien',
    tip: 'Gradpartikel (sehr) direkt vor dem Adverb (gut).',
  },
  {
    words: ['Wir', 'essen', 'immer', 'zusammen'],
    focus: 'Häufigkeitsadverb',
    tip: 'Häufigkeitsadverb steht nach dem Verb.',
  },
  {
    words: ['Ich', 'fahre', 'heute', 'mit', 'dem', 'Bus'],
    focus: 'Zeit + Mittel',
    tip: 'Reihenfolge: Zeitangabe vor Mittel/Weg.',
  },
  {
    words: ['Der', 'Kurs', 'beginnt', 'um', '10', 'Uhr'],
    focus: 'Grundwortstellung',
    tip: 'Subjekt – Verb – Zeitangabe.',
  },
  {
    words: ['Die', 'Kinder', 'schlafen', 'schon'],
    focus: 'Partikel',
    tip: 'Partikel „schon" steht nach dem Verb.',
  },
  {
    words: ['Ich', 'höre', 'gern', 'Musik'],
    focus: 'Grundwortstellung',
    tip: 'Subjekt – Verb – Adverb – Objekt.',
  },
];
