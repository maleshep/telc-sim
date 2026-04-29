import type { ExamLevel } from './levelConfig';

export interface DiktatSentence {
  text: string;
  level: ExamLevel;
  tip?: string;
}

export const diktatSentences: DiktatSentence[] = [
  // ── A1 ────────────────────────────────────────────────
  { level: 'A1', text: 'Ich wohne in München und arbeite als Lehrer.' },
  { level: 'A1', text: 'Meine Mutter heißt Maria und kommt aus Italien.' },
  { level: 'A1', text: 'Der Zug fährt um neun Uhr von Gleis sieben ab.' },
  { level: 'A1', text: 'Hast du heute Abend Zeit? Wir können ins Kino gehen.' },
  { level: 'A1', text: 'Ich habe zwei Kinder und einen Hund.' },
  { level: 'A1', text: 'Das Buch liegt auf dem Tisch neben dem Fenster.' },
  { level: 'A1', text: 'Bitte machen Sie das Licht aus! Es ist schon spät.' },
  { level: 'A1', text: 'Wir kaufen jeden Tag frisches Brot beim Bäcker.' },
  { level: 'A1', text: 'Er kann sehr gut kochen und backt jeden Sonntag.' },
  { level: 'A1', text: 'Die Kinder stehen um sieben Uhr auf und frühstücken.' },
  { level: 'A1', text: 'Sprechen Sie bitte langsamer! Ich verstehe nicht alles.' },
  { level: 'A1', text: 'Mein Geburtstag ist am fünfzehnten März.' },

  // ── A2 ────────────────────────────────────────────────
  { level: 'A2', text: 'Gestern habe ich meinen alten Freund in der Stadt getroffen.' },
  { level: 'A2', text: 'Weil es regnet, nehme ich heute den Bus zur Arbeit.' },
  { level: 'A2', text: 'Sie hat sich sehr über das Geburtstagsgeschenk gefreut.' },
  { level: 'A2', text: 'Obwohl er müde war, hat er die ganze Nacht gelernt.' },
  { level: 'A2', text: 'Ich habe mir ein neues Fahrrad gekauft, weil das alte kaputt ist.' },
  { level: 'A2', text: 'München ist größer als Nürnberg, aber kleiner als Berlin.' },
  { level: 'A2', text: 'Könntest du mir bitte helfen? Ich finde meinen Schlüssel nicht.' },
  { level: 'A2', text: 'Seit einem Jahr lerne ich Deutsch und es macht mir sehr viel Spaß.' },
  { level: 'A2', text: 'Er zieht sich jeden Morgen schnell an und fährt dann mit dem Rad.' },
  { level: 'A2', text: 'Das Paket wird morgen von der Post geliefert.' },
  { level: 'A2', text: 'Wir treffen uns um achtzehn Uhr vor dem Kino in der Stadtmitte.' },
  { level: 'A2', text: 'Ich musste früh aufstehen, weil mein Zug um sechs Uhr fuhr.' },

  // ── B1 ────────────────────────────────────────────────
  { level: 'B1', text: 'Wenn ich mehr Zeit hätte, würde ich gerne eine neue Sprache lernen.' },
  { level: 'B1', text: 'Das Gesetz wurde gestern vom Bundestag verabschiedet.' },
  { level: 'B1', text: 'Trotz des schlechten Wetters gingen wir spazieren.' },
  { level: 'B1', text: 'Das ist der Mann, der mir letzte Woche geholfen hat.' },
  { level: 'B1', text: 'Ich hätte gerne einen Kaffee und ein Stück Kuchen, bitte.' },
  { level: 'B1', text: 'Die Studie zeigt, dass Schlafmangel die Gesundheit stark beeinträchtigt.' },
  { level: 'B1', text: 'Er sagt, dass er nächste Woche in Urlaub fahren will.' },
  { level: 'B1', text: 'Wegen des Klimawandels werden Überschwemmungen immer häufiger.' },
  { level: 'B1', text: 'An deiner Stelle würde ich sofort zum Arzt gehen.' },
  { level: 'B1', text: 'Das Buch, das ich gerade lese, wurde von einer deutschen Autorin geschrieben.' },
  { level: 'B1', text: 'Lebenslanges Lernen ist heute wichtiger denn je.' },
  { level: 'B1', text: 'Die Digitalisierung verändert die Arbeitswelt grundlegend.' },
];

export function getDiktatForLevel(level: ExamLevel): DiktatSentence[] {
  return diktatSentences.filter(s => s.level === level);
}
