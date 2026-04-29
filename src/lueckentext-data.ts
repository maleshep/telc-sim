import type { ExamLevel } from './levelConfig';

export interface LueckentextBlank {
  index: number;       // which blank (0-based)
  options: string[];   // 3 options
  correct: string;
  explanation: string;
  explanationEn: string;
}

export interface LueckentextPassage {
  id: string;
  title: string;
  level: ExamLevel;
  // Text with {0}, {1}, {2}... markers for blanks
  text: string;
  blanks: LueckentextBlank[];
}

export const passages: LueckentextPassage[] = [
  // ── A1 ────────────────────────────────────────────────
  {
    id: 'a1-alltag',
    title: 'Ein typischer Tag',
    level: 'A1',
    text: 'Ich {0} Anna und ich komme aus Deutschland. Jeden Morgen {1} ich um sieben Uhr auf. Ich frühstücke und dann fahre ich {2} dem Bus zur Arbeit. Mein Chef {3} sehr nett. Nach der Arbeit {4} ich gerne Musik.',
    blanks: [
      { index: 0, options: ['heiße', 'heiß', 'heißt'], correct: 'heiße', explanation: 'ich → heiße (1. Person Singular)', explanationEn: 'ich → heiße (1st person singular)' },
      { index: 1, options: ['stehe', 'stehst', 'steht'], correct: 'stehe', explanation: 'aufstehen: ich → stehe auf', explanationEn: 'aufstehen: ich → stehe auf (separable verb)' },
      { index: 2, options: ['mit', 'in', 'auf'], correct: 'mit', explanation: 'mit + Dativ für Transportmittel', explanationEn: 'mit + dative for means of transport' },
      { index: 3, options: ['ist', 'bin', 'sind'], correct: 'ist', explanation: 'sein: er/sie/es → ist', explanationEn: 'sein: he/she/it → ist' },
      { index: 4, options: ['höre', 'hörst', 'hört'], correct: 'höre', explanation: 'hören: ich → höre', explanationEn: 'hören: ich → höre' },
    ],
  },
  {
    id: 'a1-einkauf',
    title: 'Im Supermarkt',
    level: 'A1',
    text: 'Ich gehe heute {0} den Supermarkt. Ich {1} Brot, Milch und Äpfel kaufen. Die Äpfel {2} sehr frisch aus. Ein Kilo kostet {3} Euro fünfzig. Ich {4} kein Kleingeld dabei und bezahle mit Karte.',
    blanks: [
      { index: 0, options: ['in', 'zu', 'nach'], correct: 'in', explanation: 'gehen + in + Akkusativ: in den Supermarkt', explanationEn: 'gehen + in + accusative: into the supermarket' },
      { index: 1, options: ['möchte', 'möchtest', 'möchten'], correct: 'möchte', explanation: 'möchten: ich → möchte', explanationEn: 'möchten (would like): ich → möchte' },
      { index: 2, options: ['sehen', 'sieht', 'siehst'], correct: 'sehen', explanation: 'aussehen: Die Äpfel sehen...aus', explanationEn: 'aussehen (to look): Die Äpfel sehen...aus' },
      { index: 3, options: ['einen', 'ein', 'eine'], correct: 'einen', explanation: 'einen Euro (maskulin Akkusativ)', explanationEn: 'einen Euro (masculine accusative)' },
      { index: 4, options: ['habe', 'hat', 'haben'], correct: 'habe', explanation: 'haben: ich → habe', explanationEn: 'haben: ich → habe' },
    ],
  },
  {
    id: 'a1-familie',
    title: 'Meine Familie',
    level: 'A1',
    text: 'Meine Familie {0} sehr groß. Ich habe zwei Schwestern {1} einen Bruder. Mein Vater {2} als Arzt. Meine Mutter {3} zu Hause. Wir wohnen {4} einem Haus in der Nähe von Frankfurt.',
    blanks: [
      { index: 0, options: ['ist', 'bin', 'sind'], correct: 'ist', explanation: 'sein: meine Familie → ist (3. Person Singular)', explanationEn: 'sein: meine Familie → ist' },
      { index: 1, options: ['und', 'aber', 'oder'], correct: 'und', explanation: 'und verbindet gleichwertige Satzteile', explanationEn: 'und (and) connects equivalent parts' },
      { index: 2, options: ['arbeitet', 'arbeite', 'arbeitest'], correct: 'arbeitet', explanation: 'arbeiten: er → arbeitet', explanationEn: 'arbeiten: er → arbeitet' },
      { index: 3, options: ['bleibt', 'bleibe', 'bleibst'], correct: 'bleibt', explanation: 'bleiben: sie → bleibt', explanationEn: 'bleiben: sie → bleibt' },
      { index: 4, options: ['in', 'an', 'auf'], correct: 'in', explanation: 'wohnen in + Dativ: in einem Haus', explanationEn: 'wohnen in + dative: in einem Haus' },
    ],
  },

  // ── A2 ────────────────────────────────────────────────
  {
    id: 'a2-urlaub',
    title: 'Unser Urlaub',
    level: 'A2',
    text: 'Letzten Sommer {0} wir nach Italien gefahren. Wir {1} in einem kleinen Hotel am Meer gewohnt. Das Wetter {2} wunderschön und wir {3} täglich geschwommen. Nächstes Jahr {4} wir gerne nach Spanien fahren.',
    blanks: [
      { index: 0, options: ['sind', 'haben', 'waren'], correct: 'sind', explanation: 'fahren → Perfekt mit sein: sind gefahren', explanationEn: 'fahren → Perfekt with sein: sind gefahren' },
      { index: 1, options: ['haben', 'sind', 'waren'], correct: 'haben', explanation: 'wohnen → Perfekt mit haben: haben gewohnt', explanationEn: 'wohnen → Perfekt with haben: haben gewohnt' },
      { index: 2, options: ['war', 'ist', 'hatte'], correct: 'war', explanation: 'sein Präteritum: es war (Beschreibung in der Vergangenheit)', explanationEn: 'sein simple past: es war (past description)' },
      { index: 3, options: ['sind', 'haben', 'hatten'], correct: 'sind', explanation: 'schwimmen → Perfekt mit sein: sind geschwommen', explanationEn: 'schwimmen → Perfekt with sein: sind geschwommen' },
      { index: 4, options: ['würden', 'werden', 'wollen'], correct: 'würden', explanation: 'würden + Infinitiv = Konjunktiv II (Wunsch)', explanationEn: 'würden + infinitive = subjunctive II (wish)' },
    ],
  },
  {
    id: 'a2-brief',
    title: 'Eine Einladung',
    level: 'A2',
    text: 'Liebe Anna, ich {0} dich herzlich zu meiner Geburtstagsfeier einladen. Die Party findet {1} Samstag um achtzehn Uhr statt. Ich freue {2} sehr auf dich. Bitte {3} mir, ob du kommen kannst. Mit {4} Grüßen, Lisa',
    blanks: [
      { index: 0, options: ['möchte', 'möchtest', 'möchten'], correct: 'möchte', explanation: 'möchten: ich → möchte', explanationEn: 'möchten: ich → möchte' },
      { index: 1, options: ['am', 'im', 'am'], correct: 'am', explanation: 'am + Wochentag: am Samstag', explanationEn: 'am + day of the week: am Samstag' },
      { index: 2, options: ['mich', 'mir', 'sich'], correct: 'mich', explanation: 'sich freuen: ich freue mich (Reflexivpronomen)', explanationEn: 'sich freuen: ich freue mich (reflexive pronoun)' },
      { index: 3, options: ['schreib', 'schreibe', 'schreibst'], correct: 'schreib', explanation: 'Imperativ du ohne -e: schreib!', explanationEn: 'du-imperative without -e: schreib!' },
      { index: 4, options: ['herzlichen', 'herzliche', 'herzlichem'], correct: 'herzlichen', explanation: 'mit herzlichen Grüßen (Dativ nach mit)', explanationEn: 'mit herzlichen Grüßen (dative after mit)' },
    ],
  },

  // ── B1 ────────────────────────────────────────────────
  {
    id: 'b1-klimawandel',
    title: 'Klimawandel und wir',
    level: 'B1',
    text: 'Der Klimawandel {0} eine der größten Herausforderungen unserer Zeit. Wenn wir nichts {1}, werden die Folgen katastrophal sein. Viele Experten fordern, dass die CO2-Emissionen schnell {2} werden müssen. Jeder kann {3} Beitrag leisten, indem er weniger fliegt und mehr öffentliche Verkehrsmittel {4}.',
    blanks: [
      { index: 0, options: ['ist', 'sei', 'wäre'], correct: 'ist', explanation: 'Indikativ Präsens: der Klimawandel ist', explanationEn: 'indicative present: der Klimawandel ist' },
      { index: 1, options: ['unternehmen', 'unternehmt', 'unternimmt'], correct: 'unternehmen', explanation: 'wenn + Infinitiv Nebensatz: wenn wir nichts unternehmen', explanationEn: 'wenn + verb to end: wenn wir nichts unternehmen' },
      { index: 2, options: ['reduziert', 'reduzieren', 'reduzierte'], correct: 'reduziert', explanation: 'Passiv Infinitiv: müssen + reduziert werden', explanationEn: 'passive infinitive: müssen + reduziert werden' },
      { index: 3, options: ['seinen', 'sein', 'seine'], correct: 'seinen', explanation: 'sein Beitrag → Akkusativ: seinen Beitrag', explanationEn: 'sein Beitrag → accusative: seinen Beitrag' },
      { index: 4, options: ['benutzt', 'benutzen', 'benutzt'], correct: 'benutzt', explanation: 'indem er...benutzt (Nebensatz, Verb am Ende)', explanationEn: 'indem er...benutzt (subordinate clause, verb at end)' },
    ],
  },
  {
    id: 'b1-arbeit',
    title: 'Die moderne Arbeitswelt',
    level: 'B1',
    text: 'Immer mehr Menschen arbeiten im Homeoffice. Das hat Vorteile, {0} es auch Nachteile gibt. Wer von zu Hause aus arbeitet, spart Zeit, {1} er nicht pendeln muss. Allerdings {2} viele, dass sie ihre Kollegen vermissen. Eine gute Work-Life-Balance {3} schwieriger, wenn Arbeit und Privatleben am gleichen Ort {4}.',
    blanks: [
      { index: 0, options: ['aber', 'weil', 'obwohl'], correct: 'obwohl', explanation: 'obwohl = although (Einschränkung)', explanationEn: 'obwohl = although (concessive)' },
      { index: 1, options: ['weil', 'dass', 'wenn'], correct: 'weil', explanation: 'weil er nicht pendeln muss (Grund)', explanationEn: 'weil = because (reason)' },
      { index: 2, options: ['sagen', 'sagt', 'sagten'], correct: 'sagen', explanation: 'viele sagen (3. Person Plural)', explanationEn: 'viele sagen (3rd person plural)' },
      { index: 3, options: ['wird', 'ist', 'wäre'], correct: 'wird', explanation: 'wird + Komparativ = Werden-Passiv... nein: wird schwieriger (Komparativ)', explanationEn: 'wird schwieriger = becomes more difficult' },
      { index: 4, options: ['stattfinden', 'stattfindet', 'stattfinden'], correct: 'stattfinden', explanation: 'wenn...stattfinden (Infinitiv im Nebensatz nach wenn)', explanationEn: 'wenn...stattfinden (verb at end in wenn-clause)' },
    ],
  },
];

export function getPassagesForLevel(level: ExamLevel): LueckentextPassage[] {
  return passages.filter(p => p.level === level);
}
