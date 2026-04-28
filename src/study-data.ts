// TELC Study Materials — Vocabulary & Grammar Reference (multi-level)

import type { ExamLevel } from './levelConfig';

export interface VocabWord {
  german: string;
  article?: string; // der/die/das for nouns
  plural?: string;
  english: string;
  example?: string; // example sentence
}

export interface VocabTopic {
  id: string;
  name: string;        // German topic name
  nameEn: string;      // English topic name
  icon: string;        // lucide icon name
  level?: ExamLevel;   // undefined = A1 (backward compat)
  words: VocabWord[];
}

export interface GrammarRule {
  id: string;
  title: string;
  titleEn: string;
  explanation: string;  // in simple German
  explanationEn: string;
  level?: ExamLevel;    // undefined = A1
  tables?: { headers: string[]; rows: string[][] }[];
  examples: { german: string; english: string }[];
  tip?: string;  // learning tip
}

export interface StudyData {
  vocabulary: VocabTopic[];
  grammar: GrammarRule[];
}

// ---------------------------------------------------------------------------
//  VOCABULARY
// ---------------------------------------------------------------------------

const vocabulary: VocabTopic[] = [
  // ========================================================================
  //  1. Personal Information
  // ========================================================================
  {
    id: "personal-info",
    name: "Persönliche Informationen",
    nameEn: "Personal Information",
    icon: "user",
    words: [
      { german: "Name", article: "der", plural: "Namen", english: "name", example: "Mein Name ist Anna." },
      { german: "Vorname", article: "der", plural: "Vornamen", english: "first name", example: "Mein Vorname ist Thomas." },
      { german: "Nachname", article: "der", plural: "Nachnamen", english: "last name", example: "Mein Nachname ist Müller." },
      { german: "Alter", article: "das", english: "age", example: "Ich bin 25 Jahre alt." },
      { german: "Geburtstag", article: "der", plural: "Geburtstage", english: "birthday", example: "Mein Geburtstag ist am 3. Mai." },
      { german: "Adresse", article: "die", plural: "Adressen", english: "address", example: "Meine Adresse ist Berliner Straße 12." },
      { german: "Telefonnummer", article: "die", plural: "Telefonnummern", english: "phone number", example: "Meine Telefonnummer ist 030 12345." },
      { german: "E-Mail-Adresse", article: "die", plural: "E-Mail-Adressen", english: "email address", example: "Meine E-Mail-Adresse ist anna@web.de." },
      { german: "Beruf", article: "der", plural: "Berufe", english: "profession", example: "Mein Beruf ist Lehrerin." },
      { german: "Familie", article: "die", plural: "Familien", english: "family", example: "Meine Familie wohnt in Berlin." },
      { german: "Mutter", article: "die", plural: "Mütter", english: "mother", example: "Meine Mutter heißt Maria." },
      { german: "Vater", article: "der", plural: "Väter", english: "father", example: "Mein Vater arbeitet als Arzt." },
      { german: "Kind", article: "das", plural: "Kinder", english: "child", example: "Ich habe zwei Kinder." },
      { german: "Bruder", article: "der", plural: "Brüder", english: "brother", example: "Mein Bruder ist 20 Jahre alt." },
      { german: "Schwester", article: "die", plural: "Schwestern", english: "sister", example: "Meine Schwester studiert Medizin." },
      { german: "Frau", article: "die", plural: "Frauen", english: "woman / wife", example: "Meine Frau kommt aus Spanien." },
      { german: "Mann", article: "der", plural: "Männer", english: "man / husband", example: "Mein Mann heißt Peter." },
      { german: "Freund", article: "der", plural: "Freunde", english: "friend (m.)", example: "Mein Freund wohnt in München." },
      { german: "Freundin", article: "die", plural: "Freundinnen", english: "friend (f.)", example: "Meine Freundin kommt aus der Türkei." },
      { german: "Land", article: "das", plural: "Länder", english: "country", example: "Ich komme aus Deutschland." },
      { german: "Stadt", article: "die", plural: "Städte", english: "city", example: "Ich wohne in einer großen Stadt." },
      { german: "Sprache", article: "die", plural: "Sprachen", english: "language", example: "Ich spreche zwei Sprachen." },
      { german: "Nationalität", article: "die", plural: "Nationalitäten", english: "nationality", example: "Meine Nationalität ist deutsch." },
      { german: "heißen", english: "to be called", example: "Wie heißen Sie?" },
      { german: "kommen", english: "to come (from)", example: "Woher kommen Sie?" },
      { german: "wohnen", english: "to live (reside)", example: "Wo wohnen Sie?" },
      { german: "sprechen", english: "to speak", example: "Sprechen Sie Deutsch?" },
      { german: "verheiratet", english: "married", example: "Ich bin verheiratet." },
      { german: "ledig", english: "single", example: "Er ist ledig." },
      { german: "geschieden", english: "divorced", example: "Sie ist geschieden." },
    ],
  },

  // ========================================================================
  //  2. Daily Routines
  // ========================================================================
  {
    id: "daily-routines",
    name: "Tagesablauf",
    nameEn: "Daily Routines",
    icon: "clock",
    words: [
      { german: "aufstehen", english: "to get up", example: "Ich stehe um 7 Uhr auf." },
      { german: "aufwachen", english: "to wake up", example: "Ich wache um 6:30 Uhr auf." },
      { german: "duschen", english: "to shower", example: "Ich dusche jeden Morgen." },
      { german: "frühstücken", english: "to have breakfast", example: "Ich frühstücke um 8 Uhr." },
      { german: "Frühstück", article: "das", english: "breakfast", example: "Zum Frühstück esse ich Brot." },
      { german: "Mittagessen", article: "das", english: "lunch", example: "Das Mittagessen ist um 12 Uhr." },
      { german: "Abendessen", article: "das", english: "dinner", example: "Das Abendessen ist um 19 Uhr." },
      { german: "arbeiten", english: "to work", example: "Ich arbeite von 9 bis 17 Uhr." },
      { german: "anfangen", english: "to begin", example: "Die Arbeit fängt um 9 Uhr an." },
      { german: "aufhören", english: "to stop", example: "Ich höre um 17 Uhr auf." },
      { german: "kochen", english: "to cook", example: "Am Abend koche ich Pasta." },
      { german: "essen", english: "to eat", example: "Wir essen um 12 Uhr." },
      { german: "trinken", english: "to drink", example: "Ich trinke morgens Kaffee." },
      { german: "schlafen", english: "to sleep", example: "Ich schlafe um 23 Uhr." },
      { german: "fernsehen", english: "to watch TV", example: "Abends sehe ich fern." },
      { german: "lesen", english: "to read", example: "Ich lese ein Buch." },
      { german: "Morgen", article: "der", english: "morning", example: "Am Morgen trinke ich Tee." },
      { german: "Mittag", article: "der", english: "noon", example: "Am Mittag esse ich in der Kantine." },
      { german: "Nachmittag", article: "der", plural: "Nachmittage", english: "afternoon", example: "Am Nachmittag gehe ich spazieren." },
      { german: "Abend", article: "der", plural: "Abende", english: "evening", example: "Am Abend lese ich." },
      { german: "Nacht", article: "die", plural: "Nächte", english: "night", example: "In der Nacht schlafe ich." },
      { german: "Uhr", article: "die", plural: "Uhren", english: "clock / o'clock", example: "Es ist 10 Uhr." },
      { german: "Stunde", article: "die", plural: "Stunden", english: "hour", example: "Ich arbeite 8 Stunden." },
      { german: "Minute", article: "die", plural: "Minuten", english: "minute", example: "Warte fünf Minuten." },
      { german: "spät", english: "late", example: "Es ist schon spät." },
      { german: "früh", english: "early", example: "Ich stehe früh auf." },
      { german: "immer", english: "always", example: "Ich frühstücke immer um 8 Uhr." },
      { german: "manchmal", english: "sometimes", example: "Manchmal koche ich abends." },
      { german: "nie", english: "never", example: "Ich trinke nie Alkohol." },
      { german: "oft", english: "often", example: "Ich gehe oft spazieren." },
    ],
  },

  // ========================================================================
  //  3. Food and Drink
  // ========================================================================
  {
    id: "food-drink",
    name: "Essen und Trinken",
    nameEn: "Food and Drink",
    icon: "utensils",
    words: [
      { german: "Brot", article: "das", plural: "Brote", english: "bread", example: "Ich kaufe ein Brot." },
      { german: "Brötchen", article: "das", plural: "Brötchen", english: "bread roll", example: "Zum Frühstück esse ich Brötchen." },
      { german: "Butter", article: "die", english: "butter", example: "Ich nehme Butter aufs Brot." },
      { german: "Käse", article: "der", english: "cheese", example: "Der Käse ist aus der Schweiz." },
      { german: "Wurst", article: "die", plural: "Würste", english: "sausage", example: "Ich möchte eine Wurst, bitte." },
      { german: "Fleisch", article: "das", english: "meat", example: "Ich esse nicht viel Fleisch." },
      { german: "Hähnchen", article: "das", plural: "Hähnchen", english: "chicken", example: "Heute gibt es Hähnchen." },
      { german: "Fisch", article: "der", plural: "Fische", english: "fish", example: "Freitags esse ich Fisch." },
      { german: "Ei", article: "das", plural: "Eier", english: "egg", example: "Ich möchte zwei Eier." },
      { german: "Reis", article: "der", english: "rice", example: "Ich koche Reis mit Gemüse." },
      { german: "Nudeln", article: "die", english: "pasta / noodles", example: "Die Kinder essen gern Nudeln." },
      { german: "Kartoffel", article: "die", plural: "Kartoffeln", english: "potato", example: "Kartoffeln mit Salat, bitte." },
      { german: "Gemüse", article: "das", english: "vegetables", example: "Ich esse viel Gemüse." },
      { german: "Obst", article: "das", english: "fruit", example: "Obst ist gesund." },
      { german: "Apfel", article: "der", plural: "Äpfel", english: "apple", example: "Ich kaufe einen Apfel." },
      { german: "Banane", article: "die", plural: "Bananen", english: "banana", example: "Die Banane ist gelb." },
      { german: "Tomate", article: "die", plural: "Tomaten", english: "tomato", example: "Ich brauche drei Tomaten." },
      { german: "Salat", article: "der", plural: "Salate", english: "salad / lettuce", example: "Ich hätte gern einen Salat." },
      { german: "Suppe", article: "die", plural: "Suppen", english: "soup", example: "Die Suppe ist heiß." },
      { german: "Kuchen", article: "der", plural: "Kuchen", english: "cake", example: "Möchtest du ein Stück Kuchen?" },
      { german: "Wasser", article: "das", english: "water", example: "Ein Glas Wasser, bitte." },
      { german: "Kaffee", article: "der", english: "coffee", example: "Ich trinke morgens Kaffee." },
      { german: "Tee", article: "der", plural: "Tees", english: "tea", example: "Möchten Sie Tee oder Kaffee?" },
      { german: "Milch", article: "die", english: "milk", example: "Ich nehme Milch in den Kaffee." },
      { german: "Saft", article: "der", plural: "Säfte", english: "juice", example: "Ein Orangensaft, bitte." },
      { german: "Bier", article: "das", plural: "Biere", english: "beer", example: "Ein Bier, bitte." },
      { german: "Wein", article: "der", plural: "Weine", english: "wine", example: "Ein Glas Rotwein, bitte." },
      { german: "Zucker", article: "der", english: "sugar", example: "Kaffee mit Zucker, bitte." },
      { german: "Salz", article: "das", english: "salt", example: "Die Suppe braucht Salz." },
      { german: "lecker", english: "delicious", example: "Das Essen ist sehr lecker." },
      { german: "bestellen", english: "to order", example: "Ich möchte bestellen, bitte." },
    ],
  },

  // ========================================================================
  //  4. Shopping
  // ========================================================================
  {
    id: "shopping",
    name: "Einkaufen",
    nameEn: "Shopping",
    icon: "shopping-cart",
    words: [
      { german: "Supermarkt", article: "der", plural: "Supermärkte", english: "supermarket", example: "Ich gehe in den Supermarkt." },
      { german: "Geschäft", article: "das", plural: "Geschäfte", english: "shop / store", example: "Das Geschäft ist um die Ecke." },
      { german: "Bäckerei", article: "die", plural: "Bäckereien", english: "bakery", example: "Ich kaufe Brot in der Bäckerei." },
      { german: "Metzgerei", article: "die", plural: "Metzgereien", english: "butcher shop", example: "Fleisch kaufe ich in der Metzgerei." },
      { german: "Markt", article: "der", plural: "Märkte", english: "market", example: "Am Samstag gehe ich auf den Markt." },
      { german: "Kaufhaus", article: "das", plural: "Kaufhäuser", english: "department store", example: "Im Kaufhaus gibt es alles." },
      { german: "Kasse", article: "die", plural: "Kassen", english: "cash register / checkout", example: "Bitte zahlen Sie an der Kasse." },
      { german: "Preis", article: "der", plural: "Preise", english: "price", example: "Was ist der Preis?" },
      { german: "Angebot", article: "das", plural: "Angebote", english: "offer / deal", example: "Milch ist heute im Angebot." },
      { german: "Geld", article: "das", english: "money", example: "Ich habe nicht genug Geld." },
      { german: "Euro", article: "der", plural: "Euro", english: "euro", example: "Das kostet fünf Euro." },
      { german: "Cent", article: "der", plural: "Cent", english: "cent", example: "Das macht 3 Euro 50 Cent." },
      { german: "Tasche", article: "die", plural: "Taschen", english: "bag", example: "Brauchen Sie eine Tasche?" },
      { german: "Flasche", article: "die", plural: "Flaschen", english: "bottle", example: "Eine Flasche Wasser, bitte." },
      { german: "Stück", article: "das", plural: "Stücke", english: "piece", example: "Drei Stück, bitte." },
      { german: "Kilo", article: "das", plural: "Kilo", english: "kilogram", example: "Ein Kilo Äpfel, bitte." },
      { german: "Gramm", article: "das", english: "gram", example: "200 Gramm Käse, bitte." },
      { german: "Liter", article: "der", plural: "Liter", english: "liter", example: "Zwei Liter Milch, bitte." },
      { german: "kaufen", english: "to buy", example: "Ich kaufe Brot und Milch." },
      { german: "bezahlen", english: "to pay", example: "Ich möchte bezahlen, bitte." },
      { german: "kosten", english: "to cost", example: "Was kostet das?" },
      { german: "brauchen", english: "to need", example: "Ich brauche noch Butter." },
      { german: "billig", english: "cheap", example: "Die Tomaten sind billig." },
      { german: "teuer", english: "expensive", example: "Das Fleisch ist teuer." },
      { german: "günstig", english: "affordable", example: "Das Angebot ist günstig." },
      { german: "offen", english: "open", example: "Der Laden ist bis 20 Uhr offen." },
      { german: "geschlossen", english: "closed", example: "Am Sonntag ist das Geschäft geschlossen." },
      { german: "Quittung", article: "die", plural: "Quittungen", english: "receipt", example: "Kann ich eine Quittung haben?" },
    ],
  },

  // ========================================================================
  //  5. Housing
  // ========================================================================
  {
    id: "housing",
    name: "Wohnen",
    nameEn: "Housing",
    icon: "home",
    words: [
      { german: "Wohnung", article: "die", plural: "Wohnungen", english: "apartment", example: "Meine Wohnung hat drei Zimmer." },
      { german: "Haus", article: "das", plural: "Häuser", english: "house", example: "Wir wohnen in einem Haus." },
      { german: "Zimmer", article: "das", plural: "Zimmer", english: "room", example: "Das Zimmer ist groß." },
      { german: "Küche", article: "die", plural: "Küchen", english: "kitchen", example: "Die Küche ist klein." },
      { german: "Bad", article: "das", plural: "Bäder", english: "bathroom", example: "Das Bad hat eine Dusche." },
      { german: "Schlafzimmer", article: "das", plural: "Schlafzimmer", english: "bedroom", example: "Das Schlafzimmer ist ruhig." },
      { german: "Wohnzimmer", article: "das", plural: "Wohnzimmer", english: "living room", example: "Wir sitzen im Wohnzimmer." },
      { german: "Balkon", article: "der", plural: "Balkone", english: "balcony", example: "Der Balkon ist sonnig." },
      { german: "Garten", article: "der", plural: "Gärten", english: "garden", example: "Wir haben einen kleinen Garten." },
      { german: "Tür", article: "die", plural: "Türen", english: "door", example: "Bitte mach die Tür zu." },
      { german: "Fenster", article: "das", plural: "Fenster", english: "window", example: "Öffne bitte das Fenster." },
      { german: "Tisch", article: "der", plural: "Tische", english: "table", example: "Der Tisch steht in der Küche." },
      { german: "Stuhl", article: "der", plural: "Stühle", english: "chair", example: "Setz dich auf den Stuhl." },
      { german: "Bett", article: "das", plural: "Betten", english: "bed", example: "Das Bett ist bequem." },
      { german: "Schrank", article: "der", plural: "Schränke", english: "cupboard / wardrobe", example: "Die Kleider sind im Schrank." },
      { german: "Sofa", article: "das", plural: "Sofas", english: "sofa", example: "Ich sitze auf dem Sofa." },
      { german: "Lampe", article: "die", plural: "Lampen", english: "lamp", example: "Mach bitte die Lampe an." },
      { german: "Miete", article: "die", plural: "Mieten", english: "rent", example: "Die Miete ist 500 Euro." },
      { german: "Stock", article: "der", plural: "Stockwerke", english: "floor / story", example: "Ich wohne im dritten Stock." },
      { german: "Treppe", article: "die", plural: "Treppen", english: "stairs", example: "Gehen Sie die Treppe hoch." },
      { german: "Aufzug", article: "der", plural: "Aufzüge", english: "elevator", example: "Nehmen Sie den Aufzug." },
      { german: "Schlüssel", article: "der", plural: "Schlüssel", english: "key", example: "Wo ist mein Schlüssel?" },
      { german: "Nachbar", article: "der", plural: "Nachbarn", english: "neighbor (m.)", example: "Mein Nachbar ist sehr nett." },
      { german: "Nachbarin", article: "die", plural: "Nachbarinnen", english: "neighbor (f.)", example: "Die Nachbarin hat eine Katze." },
      { german: "Möbel", article: "die", english: "furniture (pl.)", example: "Die Möbel sind neu." },
      { german: "Kühlschrank", article: "der", plural: "Kühlschränke", english: "refrigerator", example: "Die Milch ist im Kühlschrank." },
      { german: "Waschmaschine", article: "die", plural: "Waschmaschinen", english: "washing machine", example: "Die Waschmaschine ist im Bad." },
      { german: "Herd", article: "der", plural: "Herde", english: "stove", example: "Ich koche auf dem Herd." },
    ],
  },

  // ========================================================================
  //  6. Health
  // ========================================================================
  {
    id: "health",
    name: "Gesundheit",
    nameEn: "Health",
    icon: "heart-pulse",
    words: [
      { german: "Arzt", article: "der", plural: "Ärzte", english: "doctor (m.)", example: "Ich gehe zum Arzt." },
      { german: "Ärztin", article: "die", plural: "Ärztinnen", english: "doctor (f.)", example: "Die Ärztin ist sehr freundlich." },
      { german: "Krankenhaus", article: "das", plural: "Krankenhäuser", english: "hospital", example: "Er liegt im Krankenhaus." },
      { german: "Apotheke", article: "die", plural: "Apotheken", english: "pharmacy", example: "Die Apotheke ist am Marktplatz." },
      { german: "Medikament", article: "das", plural: "Medikamente", english: "medication", example: "Nehmen Sie das Medikament dreimal täglich." },
      { german: "Tablette", article: "die", plural: "Tabletten", english: "tablet / pill", example: "Nehmen Sie eine Tablette nach dem Essen." },
      { german: "Rezept", article: "das", plural: "Rezepte", english: "prescription", example: "Der Arzt schreibt ein Rezept." },
      { german: "Termin", article: "der", plural: "Termine", english: "appointment", example: "Ich habe einen Termin um 10 Uhr." },
      { german: "Schmerz", article: "der", plural: "Schmerzen", english: "pain", example: "Ich habe Schmerzen." },
      { german: "Kopfschmerzen", article: "die", english: "headache", example: "Ich habe Kopfschmerzen." },
      { german: "Bauchschmerzen", article: "die", english: "stomachache", example: "Das Kind hat Bauchschmerzen." },
      { german: "Fieber", article: "das", english: "fever", example: "Sie hat Fieber." },
      { german: "Husten", article: "der", english: "cough", example: "Ich habe einen starken Husten." },
      { german: "Schnupfen", article: "der", english: "cold / runny nose", example: "Ich habe Schnupfen." },
      { german: "Erkältung", article: "die", plural: "Erkältungen", english: "cold (illness)", example: "Ich habe eine Erkältung." },
      { german: "krank", english: "sick / ill", example: "Ich bin krank." },
      { german: "gesund", english: "healthy", example: "Ich bin wieder gesund." },
      { german: "müde", english: "tired", example: "Ich bin sehr müde." },
      { german: "weh tun", english: "to hurt", example: "Mein Kopf tut weh." },
      { german: "Versicherungskarte", article: "die", plural: "Versicherungskarten", english: "insurance card", example: "Haben Sie Ihre Versicherungskarte?" },
      { german: "Krankschreibung", article: "die", plural: "Krankschreibungen", english: "sick note", example: "Ich brauche eine Krankschreibung." },
      { german: "Auge", article: "das", plural: "Augen", english: "eye", example: "Mein Auge ist rot." },
      { german: "Arm", article: "der", plural: "Arme", english: "arm", example: "Mein Arm tut weh." },
      { german: "Bein", article: "das", plural: "Beine", english: "leg", example: "Er hat ein gebrochenes Bein." },
      { german: "Rücken", article: "der", plural: "Rücken", english: "back", example: "Ich habe Rückenschmerzen." },
      { german: "Zahn", article: "der", plural: "Zähne", english: "tooth", example: "Ich habe Zahnschmerzen." },
      { german: "Zahnarzt", article: "der", plural: "Zahnärzte", english: "dentist", example: "Ich gehe morgen zum Zahnarzt." },
    ],
  },

  // ========================================================================
  //  7. Travel and Transport
  // ========================================================================
  {
    id: "travel-transport",
    name: "Reisen und Verkehr",
    nameEn: "Travel and Transport",
    icon: "train",
    words: [
      { german: "Bahnhof", article: "der", plural: "Bahnhöfe", english: "train station", example: "Der Bahnhof ist in der Stadtmitte." },
      { german: "Flughafen", article: "der", plural: "Flughäfen", english: "airport", example: "Der Flughafen ist weit weg." },
      { german: "Haltestelle", article: "die", plural: "Haltestellen", english: "stop (bus/tram)", example: "Die Haltestelle ist dort drüben." },
      { german: "Zug", article: "der", plural: "Züge", english: "train", example: "Der Zug fährt um 14 Uhr." },
      { german: "Bus", article: "der", plural: "Busse", english: "bus", example: "Ich fahre mit dem Bus." },
      { german: "U-Bahn", article: "die", english: "subway / metro", example: "Die U-Bahn kommt in 3 Minuten." },
      { german: "Straßenbahn", article: "die", plural: "Straßenbahnen", english: "tram", example: "Die Straßenbahn Linie 5, bitte." },
      { german: "Taxi", article: "das", plural: "Taxis", english: "taxi", example: "Rufen Sie bitte ein Taxi." },
      { german: "Auto", article: "das", plural: "Autos", english: "car", example: "Ich fahre mit dem Auto." },
      { german: "Fahrrad", article: "das", plural: "Fahrräder", english: "bicycle", example: "Ich fahre gern Fahrrad." },
      { german: "Fahrkarte", article: "die", plural: "Fahrkarten", english: "ticket", example: "Ich brauche eine Fahrkarte." },
      { german: "Fahrplan", article: "der", plural: "Fahrpläne", english: "timetable / schedule", example: "Schau auf den Fahrplan." },
      { german: "Gleis", article: "das", plural: "Gleise", english: "platform / track", example: "Der Zug fährt von Gleis 3." },
      { german: "Abfahrt", article: "die", plural: "Abfahrten", english: "departure", example: "Die Abfahrt ist um 10:15 Uhr." },
      { german: "Ankunft", article: "die", plural: "Ankünfte", english: "arrival", example: "Die Ankunft ist um 12:30 Uhr." },
      { german: "Verspätung", article: "die", plural: "Verspätungen", english: "delay", example: "Der Zug hat 10 Minuten Verspätung." },
      { german: "Richtung", article: "die", plural: "Richtungen", english: "direction", example: "In welche Richtung muss ich gehen?" },
      { german: "fahren", english: "to drive / to go (by vehicle)", example: "Ich fahre nach Berlin." },
      { german: "fliegen", english: "to fly", example: "Wir fliegen nach Spanien." },
      { german: "umsteigen", english: "to transfer / change", example: "Sie müssen in Hamburg umsteigen." },
      { german: "einsteigen", english: "to board / get on", example: "Bitte einsteigen!" },
      { german: "aussteigen", english: "to get off", example: "Ich steige an der nächsten Haltestelle aus." },
      { german: "links", english: "left", example: "Gehen Sie nach links." },
      { german: "rechts", english: "right", example: "Das Kino ist rechts." },
      { german: "geradeaus", english: "straight ahead", example: "Gehen Sie geradeaus." },
      { german: "Straße", article: "die", plural: "Straßen", english: "street", example: "Die Straße ist lang." },
      { german: "Kreuzung", article: "die", plural: "Kreuzungen", english: "intersection", example: "An der Kreuzung links abbiegen." },
      { german: "Brücke", article: "die", plural: "Brücken", english: "bridge", example: "Gehen Sie über die Brücke." },
    ],
  },

  // ========================================================================
  //  8. Weather
  // ========================================================================
  {
    id: "weather",
    name: "Wetter",
    nameEn: "Weather",
    icon: "cloud-sun",
    words: [
      { german: "Wetter", article: "das", english: "weather", example: "Das Wetter ist heute schön." },
      { german: "Sonne", article: "die", english: "sun", example: "Die Sonne scheint." },
      { german: "Regen", article: "der", english: "rain", example: "Es gibt heute Regen." },
      { german: "Schnee", article: "der", english: "snow", example: "Im Winter gibt es Schnee." },
      { german: "Wind", article: "der", plural: "Winde", english: "wind", example: "Heute weht ein starker Wind." },
      { german: "Wolke", article: "die", plural: "Wolken", english: "cloud", example: "Am Himmel sind viele Wolken." },
      { german: "Gewitter", article: "das", plural: "Gewitter", english: "thunderstorm", example: "Heute Abend kommt ein Gewitter." },
      { german: "Nebel", article: "der", english: "fog", example: "Am Morgen gibt es oft Nebel." },
      { german: "Grad", article: "der", english: "degree", example: "Es sind 20 Grad." },
      { german: "Temperatur", article: "die", plural: "Temperaturen", english: "temperature", example: "Die Temperatur ist 15 Grad." },
      { german: "sonnig", english: "sunny", example: "Morgen wird es sonnig." },
      { german: "regnerisch", english: "rainy", example: "Es ist regnerisch." },
      { german: "bewölkt", english: "cloudy", example: "Heute ist es bewölkt." },
      { german: "windig", english: "windy", example: "Es ist sehr windig." },
      { german: "kalt", english: "cold", example: "Im Winter ist es kalt." },
      { german: "warm", english: "warm", example: "Im Sommer ist es warm." },
      { german: "heiß", english: "hot", example: "Heute ist es sehr heiß." },
      { german: "kühl", english: "cool", example: "Am Abend wird es kühl." },
      { german: "Frühling", article: "der", english: "spring", example: "Im Frühling blühen die Blumen." },
      { german: "Sommer", article: "der", english: "summer", example: "Im Sommer fahre ich ans Meer." },
      { german: "Herbst", article: "der", english: "autumn / fall", example: "Im Herbst fallen die Blätter." },
      { german: "Winter", article: "der", english: "winter", example: "Im Winter schneit es." },
      { german: "Himmel", article: "der", english: "sky", example: "Der Himmel ist blau." },
      { german: "regnen", english: "to rain", example: "Es regnet den ganzen Tag." },
      { german: "schneien", english: "to snow", example: "Es schneit draußen." },
      { german: "scheinen", english: "to shine", example: "Die Sonne scheint." },
    ],
  },

  // ========================================================================
  //  9. Hobbies and Free Time
  // ========================================================================
  {
    id: "hobbies",
    name: "Freizeit und Hobbys",
    nameEn: "Hobbies and Free Time",
    icon: "palette",
    words: [
      { german: "Hobby", article: "das", plural: "Hobbys", english: "hobby", example: "Mein Hobby ist Schwimmen." },
      { german: "Sport", article: "der", english: "sport", example: "Ich mache gern Sport." },
      { german: "Fußball", article: "der", english: "soccer / football", example: "Ich spiele gern Fußball." },
      { german: "schwimmen", english: "to swim", example: "Im Sommer gehe ich schwimmen." },
      { german: "laufen", english: "to run", example: "Ich laufe jeden Morgen." },
      { german: "Fahrrad fahren", english: "to ride a bicycle", example: "Am Wochenende fahre ich Fahrrad." },
      { german: "Musik", article: "die", english: "music", example: "Ich höre gern Musik." },
      { german: "Gitarre", article: "die", plural: "Gitarren", english: "guitar", example: "Ich spiele Gitarre." },
      { german: "Klavier", article: "das", plural: "Klaviere", english: "piano", example: "Mein Sohn lernt Klavier." },
      { german: "Kino", article: "das", plural: "Kinos", english: "cinema", example: "Gehen wir heute ins Kino?" },
      { german: "Film", article: "der", plural: "Filme", english: "film / movie", example: "Der Film war sehr gut." },
      { german: "Theater", article: "das", plural: "Theater", english: "theater", example: "Wir gehen ins Theater." },
      { german: "Museum", article: "das", plural: "Museen", english: "museum", example: "Das Museum ist am Sonntag geöffnet." },
      { german: "Buch", article: "das", plural: "Bücher", english: "book", example: "Ich lese ein Buch." },
      { german: "Zeitung", article: "die", plural: "Zeitungen", english: "newspaper", example: "Mein Vater liest die Zeitung." },
      { german: "Foto", article: "das", plural: "Fotos", english: "photo", example: "Ich mache gern Fotos." },
      { german: "Garten", article: "der", plural: "Gärten", english: "garden", example: "Ich arbeite gern im Garten." },
      { german: "Spaziergang", article: "der", plural: "Spaziergänge", english: "walk / stroll", example: "Ich mache einen Spaziergang." },
      { german: "kochen", english: "to cook", example: "Ich koche gern italienisch." },
      { german: "tanzen", english: "to dance", example: "Am Wochenende gehe ich tanzen." },
      { german: "singen", english: "to sing", example: "Sie singt sehr schön." },
      { german: "malen", english: "to paint / draw", example: "Das Kind malt ein Bild." },
      { german: "spielen", english: "to play", example: "Die Kinder spielen im Park." },
      { german: "Konzert", article: "das", plural: "Konzerte", english: "concert", example: "Wir gehen zum Konzert." },
      { german: "Park", article: "der", plural: "Parks", english: "park", example: "Der Park ist sehr schön." },
      { german: "Strand", article: "der", plural: "Strände", english: "beach", example: "Wir gehen an den Strand." },
      { german: "Verein", article: "der", plural: "Vereine", english: "club / association", example: "Ich bin im Sportverein." },
      { german: "Mannschaft", article: "die", plural: "Mannschaften", english: "team", example: "Unsere Mannschaft hat gewonnen." },
    ],
  },

  // ========================================================================
  //  10. School and Work
  // ========================================================================
  {
    id: "school-work",
    name: "Schule und Arbeit",
    nameEn: "School and Work",
    icon: "briefcase",
    words: [
      { german: "Schule", article: "die", plural: "Schulen", english: "school", example: "Die Kinder gehen in die Schule." },
      { german: "Universität", article: "die", plural: "Universitäten", english: "university", example: "Sie studiert an der Universität." },
      { german: "Kurs", article: "der", plural: "Kurse", english: "course", example: "Ich besuche einen Deutschkurs." },
      { german: "Klasse", article: "die", plural: "Klassen", english: "class", example: "In meiner Klasse sind 20 Schüler." },
      { german: "Lehrer", article: "der", plural: "Lehrer", english: "teacher (m.)", example: "Der Lehrer erklärt die Grammatik." },
      { german: "Lehrerin", article: "die", plural: "Lehrerinnen", english: "teacher (f.)", example: "Die Lehrerin ist sehr nett." },
      { german: "Schüler", article: "der", plural: "Schüler", english: "student (m., school)", example: "Der Schüler lernt Deutsch." },
      { german: "Schülerin", article: "die", plural: "Schülerinnen", english: "student (f., school)", example: "Die Schülerin macht ihre Hausaufgaben." },
      { german: "Hausaufgabe", article: "die", plural: "Hausaufgaben", english: "homework", example: "Ich mache meine Hausaufgaben." },
      { german: "Prüfung", article: "die", plural: "Prüfungen", english: "exam", example: "Die Prüfung ist am Freitag." },
      { german: "lernen", english: "to learn / study", example: "Ich lerne jeden Tag Deutsch." },
      { german: "studieren", english: "to study (university)", example: "Sie studiert Medizin." },
      { german: "Arbeit", article: "die", plural: "Arbeiten", english: "work", example: "Die Arbeit macht mir Spaß." },
      { german: "Büro", article: "das", plural: "Büros", english: "office", example: "Ich arbeite im Büro." },
      { german: "Firma", article: "die", plural: "Firmen", english: "company", example: "Die Firma hat 200 Mitarbeiter." },
      { german: "Chef", article: "der", plural: "Chefs", english: "boss (m.)", example: "Mein Chef ist streng." },
      { german: "Chefin", article: "die", plural: "Chefinnen", english: "boss (f.)", example: "Die Chefin hat eine Besprechung." },
      { german: "Kollege", article: "der", plural: "Kollegen", english: "colleague (m.)", example: "Mein Kollege hilft mir." },
      { german: "Kollegin", article: "die", plural: "Kolleginnen", english: "colleague (f.)", example: "Meine Kollegin kommt aus Italien." },
      { german: "Gehalt", article: "das", plural: "Gehälter", english: "salary", example: "Das Gehalt kommt am Ende des Monats." },
      { german: "Urlaub", article: "der", plural: "Urlaube", english: "vacation / holiday", example: "Ich habe zwei Wochen Urlaub." },
      { german: "Pause", article: "die", plural: "Pausen", english: "break", example: "Die Pause ist um 12 Uhr." },
      { german: "Computer", article: "der", plural: "Computer", english: "computer", example: "Ich arbeite am Computer." },
      { german: "Besprechung", article: "die", plural: "Besprechungen", english: "meeting", example: "Die Besprechung ist um 14 Uhr." },
      { german: "Praktikum", article: "das", plural: "Praktika", english: "internship", example: "Ich mache ein Praktikum." },
      { german: "Bewerbung", article: "die", plural: "Bewerbungen", english: "application (job)", example: "Ich schreibe eine Bewerbung." },
      { german: "Stelle", article: "die", plural: "Stellen", english: "position / job", example: "Ich suche eine neue Stelle." },
      { german: "verdienen", english: "to earn", example: "Wie viel verdienen Sie?" },
    ],
  },

  // ========================================================================
  //  11. Numbers, Days, Months
  // ========================================================================
  {
    id: "numbers-dates",
    name: "Zahlen und Datum",
    nameEn: "Numbers and Dates",
    icon: "calendar",
    words: [
      { german: "null", english: "zero" },
      { german: "eins", english: "one", example: "Ich habe ein Kind." },
      { german: "zwei", english: "two", example: "Ich habe zwei Brüder." },
      { german: "drei", english: "three" },
      { german: "vier", english: "four" },
      { german: "fünf", english: "five" },
      { german: "sechs", english: "six" },
      { german: "sieben", english: "seven" },
      { german: "acht", english: "eight" },
      { german: "neun", english: "nine" },
      { german: "zehn", english: "ten" },
      { german: "zwanzig", english: "twenty" },
      { german: "dreißig", english: "thirty" },
      { german: "hundert", english: "one hundred" },
      { german: "tausend", english: "one thousand" },
      { german: "Montag", article: "der", english: "Monday", example: "Am Montag arbeite ich." },
      { german: "Dienstag", article: "der", english: "Tuesday", example: "Am Dienstag habe ich einen Kurs." },
      { german: "Mittwoch", article: "der", english: "Wednesday", example: "Mittwoch ist mein freier Tag." },
      { german: "Donnerstag", article: "der", english: "Thursday" },
      { german: "Freitag", article: "der", english: "Friday", example: "Am Freitag gehe ich ins Kino." },
      { german: "Samstag", article: "der", english: "Saturday", example: "Samstag gehe ich einkaufen." },
      { german: "Sonntag", article: "der", english: "Sunday", example: "Am Sonntag schlafe ich lange." },
      { german: "Januar", article: "der", english: "January" },
      { german: "Februar", article: "der", english: "February" },
      { german: "März", article: "der", english: "March" },
      { german: "April", article: "der", english: "April" },
      { german: "Mai", article: "der", english: "May" },
      { german: "Juni", article: "der", english: "June" },
      { german: "Juli", article: "der", english: "July" },
      { german: "August", article: "der", english: "August" },
      { german: "September", article: "der", english: "September" },
      { german: "Oktober", article: "der", english: "October" },
      { german: "November", article: "der", english: "November" },
      { german: "Dezember", article: "der", english: "December" },
      { german: "heute", english: "today", example: "Heute ist Montag." },
      { german: "morgen", english: "tomorrow", example: "Morgen gehe ich zum Arzt." },
      { german: "gestern", english: "yesterday", example: "Gestern war ich im Kino." },
      { german: "Woche", article: "die", plural: "Wochen", english: "week", example: "Nächste Woche habe ich Urlaub." },
      { german: "Monat", article: "der", plural: "Monate", english: "month", example: "In einem Monat komme ich zurück." },
      { german: "Jahr", article: "das", plural: "Jahre", english: "year", example: "Ich bin 30 Jahre alt." },
      { german: "Wochenende", article: "das", plural: "Wochenenden", english: "weekend", example: "Am Wochenende fahre ich nach Hamburg." },
    ],
  },

  // ========================================================================
  //  12. Clothing and Colors
  // ========================================================================
  {
    id: "clothing-colors",
    name: "Kleidung und Farben",
    nameEn: "Clothing and Colors",
    icon: "shirt",
    words: [
      { german: "Kleidung", article: "die", english: "clothing", example: "Ich kaufe neue Kleidung." },
      { german: "Hose", article: "die", plural: "Hosen", english: "trousers / pants", example: "Die Hose ist zu lang." },
      { german: "Hemd", article: "das", plural: "Hemden", english: "shirt", example: "Das Hemd ist weiß." },
      { german: "T-Shirt", article: "das", plural: "T-Shirts", english: "T-shirt", example: "Im Sommer trage ich ein T-Shirt." },
      { german: "Kleid", article: "das", plural: "Kleider", english: "dress", example: "Das Kleid ist sehr schön." },
      { german: "Rock", article: "der", plural: "Röcke", english: "skirt", example: "Der Rock ist blau." },
      { german: "Jacke", article: "die", plural: "Jacken", english: "jacket", example: "Es ist kalt. Nimm eine Jacke." },
      { german: "Mantel", article: "der", plural: "Mäntel", english: "coat", example: "Im Winter trage ich einen Mantel." },
      { german: "Pullover", article: "der", plural: "Pullover", english: "sweater / pullover", example: "Der Pullover ist warm." },
      { german: "Schuh", article: "der", plural: "Schuhe", english: "shoe", example: "Ich brauche neue Schuhe." },
      { german: "Stiefel", article: "der", plural: "Stiefel", english: "boot", example: "Im Winter trage ich Stiefel." },
      { german: "Mütze", article: "die", plural: "Mützen", english: "cap / beanie", example: "Es ist kalt, setz eine Mütze auf." },
      { german: "Socke", article: "die", plural: "Socken", english: "sock", example: "Ich brauche neue Socken." },
      { german: "Größe", article: "die", plural: "Größen", english: "size", example: "Welche Größe haben Sie?" },
      { german: "anziehen", english: "to put on (clothes)", example: "Ich ziehe meine Jacke an." },
      { german: "tragen", english: "to wear / carry", example: "Sie trägt ein rotes Kleid." },
      { german: "rot", english: "red", example: "Das Auto ist rot." },
      { german: "blau", english: "blue", example: "Der Himmel ist blau." },
      { german: "grün", english: "green", example: "Das Gras ist grün." },
      { german: "gelb", english: "yellow", example: "Die Banane ist gelb." },
      { german: "weiß", english: "white", example: "Das Hemd ist weiß." },
      { german: "schwarz", english: "black", example: "Die Schuhe sind schwarz." },
      { german: "grau", english: "gray", example: "Der Mantel ist grau." },
      { german: "braun", english: "brown", example: "Die Tasche ist braun." },
      { german: "groß", english: "big / tall", example: "Die Jacke ist zu groß." },
      { german: "klein", english: "small / short", example: "Die Hose ist zu klein." },
    ],
  },
];

// ---------------------------------------------------------------------------
//  GRAMMAR RULES
// ---------------------------------------------------------------------------

const grammar: GrammarRule[] = [
  // ========================================================================
  //  1. Definite & Indefinite Articles
  // ========================================================================
  {
    id: "articles",
    title: "Artikel: der, die, das / ein, eine",
    titleEn: "Articles: the / a, an",
    explanation: "Alle Nomen auf Deutsch haben ein Geschlecht: maskulin (der), feminin (die) oder neutral (das). Der unbestimmte Artikel ist \"ein\" (maskulin/neutral) oder \"eine\" (feminin). Pluralformen haben immer \"die\".",
    explanationEn: "Every German noun has a gender: masculine (der), feminine (die), or neuter (das). The indefinite article is \"ein\" (masculine/neuter) or \"eine\" (feminine). Plural always uses \"die\".",
    tables: [
      {
        headers: ["", "Maskulin", "Feminin", "Neutrum", "Plural"],
        rows: [
          ["bestimmt (the)", "der Mann", "die Frau", "das Kind", "die Kinder"],
          ["unbestimmt (a/an)", "ein Mann", "eine Frau", "ein Kind", "— Kinder"],
        ],
      },
    ],
    examples: [
      { german: "Der Tisch ist groß.", english: "The table is big." },
      { german: "Die Lampe ist neu.", english: "The lamp is new." },
      { german: "Das Buch ist interessant.", english: "The book is interesting." },
      { german: "Ich habe einen Hund.", english: "I have a dog." },
      { german: "Sie hat eine Katze.", english: "She has a cat." },
      { german: "Er kauft ein Auto.", english: "He is buying a car." },
    ],
    tip: "Lerne jedes Nomen immer mit dem Artikel zusammen! z.B. \"der Tisch\" — nicht nur \"Tisch\".",
  },

  // ========================================================================
  //  2. Personal Pronouns
  // ========================================================================
  {
    id: "personal-pronouns",
    title: "Personalpronomen",
    titleEn: "Personal Pronouns",
    explanation: "Die Personalpronomen im Deutschen sind: ich, du, er/sie/es, wir, ihr, sie/Sie. \"Sie\" (mit großem S) ist die höfliche Form.",
    explanationEn: "German personal pronouns are: ich (I), du (you informal), er/sie/es (he/she/it), wir (we), ihr (you plural), sie (they), Sie (you formal). \"Sie\" with a capital S is the polite form.",
    tables: [
      {
        headers: ["Deutsch", "English", "Verwendung"],
        rows: [
          ["ich", "I", "1. Person Singular"],
          ["du", "you (informal)", "2. Person Singular — Freunde, Familie"],
          ["er", "he", "3. Person Singular maskulin"],
          ["sie", "she", "3. Person Singular feminin"],
          ["es", "it", "3. Person Singular neutral"],
          ["wir", "we", "1. Person Plural"],
          ["ihr", "you (plural informal)", "2. Person Plural — mehrere Freunde"],
          ["sie", "they", "3. Person Plural"],
          ["Sie", "you (formal)", "Höfliche Form — Erwachsene, Fremde"],
        ],
      },
    ],
    examples: [
      { german: "Ich bin Studentin.", english: "I am a (female) student." },
      { german: "Du bist mein Freund.", english: "You are my friend." },
      { german: "Er kommt aus Deutschland.", english: "He comes from Germany." },
      { german: "Sie spricht Englisch.", english: "She speaks English." },
      { german: "Wir lernen Deutsch.", english: "We are learning German." },
      { german: "Woher kommen Sie?", english: "Where do you come from? (formal)" },
    ],
    tip: "Im Deutschkurs benutzt man \"du\" mit anderen Schülern und \"Sie\" mit dem Lehrer.",
  },

  // ========================================================================
  //  3. Present Tense — Regular Verbs
  // ========================================================================
  {
    id: "present-tense-regular",
    title: "Präsens: regelmäßige Verben",
    titleEn: "Present Tense: Regular Verbs",
    explanation: "Regelmäßige Verben folgen einem einfachen Muster. Man nimmt den Stamm (Infinitiv ohne \"-en\") und fügt die Endung hinzu: -e, -st, -t, -en, -t, -en. Bei Verben mit Stamm auf -t/-d kommt ein extra -e- dazu (z.B. arbeiten).",
    explanationEn: "Regular verbs follow a simple pattern. Take the stem (infinitive minus \"-en\") and add the ending: -e, -st, -t, -en, -t, -en. Verbs with stems ending in -t/-d add an extra -e- (e.g., arbeiten).",
    tables: [
      {
        headers: ["Pronomen", "machen (to do)", "arbeiten (to work)", "wohnen (to live)"],
        rows: [
          ["ich", "mache", "arbeite", "wohne"],
          ["du", "machst", "arbeitest", "wohnst"],
          ["er/sie/es", "macht", "arbeitet", "wohnt"],
          ["wir", "machen", "arbeiten", "wohnen"],
          ["ihr", "macht", "arbeitet", "wohnt"],
          ["sie/Sie", "machen", "arbeiten", "wohnen"],
        ],
      },
    ],
    examples: [
      { german: "Ich mache Hausaufgaben.", english: "I do homework." },
      { german: "Du wohnst in Berlin.", english: "You live in Berlin." },
      { german: "Sie arbeitet im Büro.", english: "She works in the office." },
      { german: "Wir lernen Deutsch.", english: "We learn German." },
      { german: "Ihr spielt Fußball.", english: "You (all) play soccer." },
    ],
    tip: "Die Endungen für \"wir\" und \"sie/Sie\" sind IMMER gleich wie der Infinitiv: -en.",
  },

  // ========================================================================
  //  4. Present Tense — Irregular Verbs (sein, haben, fahren, sprechen)
  // ========================================================================
  {
    id: "present-tense-irregular",
    title: "Präsens: unregelmäßige Verben",
    titleEn: "Present Tense: Irregular Verbs",
    explanation: "Die wichtigsten unregelmäßigen Verben sind \"sein\" (to be) und \"haben\" (to have). Andere unregelmäßige Verben ändern den Vokal bei \"du\" und \"er/sie/es\": a→ä (fahren), e→i (sprechen), e→ie (lesen).",
    explanationEn: "The most important irregular verbs are \"sein\" (to be) and \"haben\" (to have). Other irregular verbs change their vowel in the du/er/sie/es forms: a→ä (fahren), e→i (sprechen), e→ie (lesen).",
    tables: [
      {
        headers: ["Pronomen", "sein (to be)", "haben (to have)", "fahren (to drive)", "sprechen (to speak)"],
        rows: [
          ["ich", "bin", "habe", "fahre", "spreche"],
          ["du", "bist", "hast", "fährst", "sprichst"],
          ["er/sie/es", "ist", "hat", "fährt", "spricht"],
          ["wir", "sind", "haben", "fahren", "sprechen"],
          ["ihr", "seid", "habt", "fahrt", "sprecht"],
          ["sie/Sie", "sind", "haben", "fahren", "sprechen"],
        ],
      },
      {
        headers: ["Pronomen", "lesen (to read)", "essen (to eat)", "nehmen (to take)", "sehen (to see)"],
        rows: [
          ["ich", "lese", "esse", "nehme", "sehe"],
          ["du", "liest", "isst", "nimmst", "siehst"],
          ["er/sie/es", "liest", "isst", "nimmt", "sieht"],
          ["wir", "lesen", "essen", "nehmen", "sehen"],
          ["ihr", "lest", "esst", "nehmt", "seht"],
          ["sie/Sie", "lesen", "essen", "nehmen", "sehen"],
        ],
      },
    ],
    examples: [
      { german: "Ich bin müde.", english: "I am tired." },
      { german: "Du hast ein Buch.", english: "You have a book." },
      { german: "Er fährt nach München.", english: "He drives to Munich." },
      { german: "Sie spricht drei Sprachen.", english: "She speaks three languages." },
      { german: "Wir sind Studenten.", english: "We are students." },
      { german: "Er liest die Zeitung.", english: "He reads the newspaper." },
    ],
    tip: "\"sein\" und \"haben\" sind die zwei wichtigsten Verben — lerne sie zuerst auswendig!",
  },

  // ========================================================================
  //  5. Accusative Case
  // ========================================================================
  {
    id: "accusative-case",
    title: "Akkusativ",
    titleEn: "Accusative Case",
    explanation: "Der Akkusativ zeigt das direkte Objekt (wen? was?). Nur der maskuline Artikel ändert sich: \"der\" → \"den\", \"ein\" → \"einen\". Feminin, neutral und Plural bleiben gleich.",
    explanationEn: "The accusative shows the direct object (whom? what?). Only the masculine article changes: \"der\" → \"den\", \"ein\" → \"einen\". Feminine, neuter, and plural stay the same.",
    tables: [
      {
        headers: ["", "Maskulin", "Feminin", "Neutrum", "Plural"],
        rows: [
          ["Nominativ (Subjekt)", "der / ein", "die / eine", "das / ein", "die / —"],
          ["Akkusativ (Objekt)", "den / einen", "die / eine", "das / ein", "die / —"],
        ],
      },
    ],
    examples: [
      { german: "Ich kaufe einen Apfel. (der Apfel)", english: "I buy an apple." },
      { german: "Sie trinkt einen Kaffee. (der Kaffee)", english: "She drinks a coffee." },
      { german: "Ich sehe den Mann. (der Mann)", english: "I see the man." },
      { german: "Er hat eine Katze. (die Katze)", english: "He has a cat." },
      { german: "Wir lesen das Buch. (das Buch)", english: "We read the book." },
      { german: "Ich habe keinen Bruder.", english: "I don't have a brother." },
    ],
    tip: "Nur MASKULIN ändert sich im Akkusativ! Alle anderen bleiben gleich. Merke: der → den, ein → einen, kein → keinen.",
  },

  // ========================================================================
  //  6. Negation
  // ========================================================================
  {
    id: "negation",
    title: "Verneinung: nicht und kein",
    titleEn: "Negation: nicht and kein",
    explanation: "\"Nicht\" verneint Verben, Adjektive und Adverbien. \"Kein\" verneint Nomen (ersetzt \"ein/eine\"). \"Kein\" hat die gleichen Endungen wie \"ein\".",
    explanationEn: "\"Nicht\" negates verbs, adjectives, and adverbs. \"Kein\" negates nouns (replaces \"ein/eine\"). \"Kein\" takes the same endings as \"ein\".",
    tables: [
      {
        headers: ["", "Maskulin", "Feminin", "Neutrum", "Plural"],
        rows: [
          ["Nominativ", "kein", "keine", "kein", "keine"],
          ["Akkusativ", "keinen", "keine", "kein", "keine"],
        ],
      },
    ],
    examples: [
      { german: "Ich trinke nicht.", english: "I don't drink." },
      { german: "Das ist nicht gut.", english: "That is not good." },
      { german: "Er kommt heute nicht.", english: "He is not coming today." },
      { german: "Ich habe kein Auto.", english: "I don't have a car." },
      { german: "Sie hat keine Kinder.", english: "She doesn't have children." },
      { german: "Wir haben keinen Hund.", english: "We don't have a dog." },
      { german: "Das ist kein Problem.", english: "That is not a problem." },
    ],
    tip: "Faustregel: Benutze \"kein\" vor Nomen (kein Buch, keine Zeit). Benutze \"nicht\" bei allem anderen (nicht gut, nicht hier).",
  },

  // ========================================================================
  //  7. Word Order
  // ========================================================================
  {
    id: "word-order",
    title: "Wortstellung: Verb auf Position 2",
    titleEn: "Word Order: Verb in Position 2",
    explanation: "Im deutschen Hauptsatz steht das Verb IMMER auf Position 2. Bei W-Fragen (wer, was, wo, wann, wie, warum, woher) steht das Fragewort auf Position 1, das Verb auf Position 2. Bei Ja/Nein-Fragen steht das Verb auf Position 1.",
    explanationEn: "In German main clauses, the verb is ALWAYS in position 2. In W-questions (who, what, where, when, how, why), the question word is in position 1, verb in position 2. In yes/no questions, the verb comes first.",
    tables: [
      {
        headers: ["Typ", "Position 1", "Position 2 (Verb)", "Rest"],
        rows: [
          ["Aussage", "Ich", "lerne", "Deutsch."],
          ["Aussage", "Morgen", "gehe", "ich zum Arzt."],
          ["Aussage", "Am Montag", "arbeite", "ich nicht."],
          ["W-Frage", "Wo", "wohnst", "du?"],
          ["W-Frage", "Wie", "heißen", "Sie?"],
          ["W-Frage", "Wann", "kommst", "du?"],
          ["Ja/Nein-Frage", "Sprichst", "du", "Deutsch?"],
          ["Ja/Nein-Frage", "Haben", "Sie", "Kinder?"],
        ],
      },
    ],
    examples: [
      { german: "Ich spiele Fußball.", english: "I play soccer." },
      { german: "Am Wochenende fahre ich nach Berlin.", english: "On the weekend I go to Berlin." },
      { german: "Wo ist der Bahnhof?", english: "Where is the train station?" },
      { german: "Wie heißen Sie?", english: "What is your name?" },
      { german: "Sprechen Sie Deutsch?", english: "Do you speak German?" },
      { german: "Hast du Zeit?", english: "Do you have time?" },
    ],
    tip: "Wichtig: Wenn etwas anderes als das Subjekt auf Position 1 steht (z.B. \"Morgen\"), kommt das Subjekt NACH dem Verb. Das Verb bleibt immer auf Position 2!",
  },

  // ========================================================================
  //  8. Modal Verbs
  // ========================================================================
  {
    id: "modal-verbs",
    title: "Modalverben: können, müssen, möchten, wollen",
    titleEn: "Modal Verbs: can, must, would like, want",
    explanation: "Modalverben stehen auf Position 2 und das Hauptverb steht am Ende im Infinitiv. Die wichtigsten A1-Modalverben sind: können (can), müssen (must), möchten (would like), wollen (want), dürfen (may).",
    explanationEn: "Modal verbs go in position 2, and the main verb goes to the end in infinitive form. The key A1 modal verbs are: können (can), müssen (must), möchten (would like), wollen (want), dürfen (may).",
    tables: [
      {
        headers: ["Pronomen", "können", "müssen", "möchten", "wollen", "dürfen"],
        rows: [
          ["ich", "kann", "muss", "möchte", "will", "darf"],
          ["du", "kannst", "musst", "möchtest", "willst", "darfst"],
          ["er/sie/es", "kann", "muss", "möchte", "will", "darf"],
          ["wir", "können", "müssen", "möchten", "wollen", "dürfen"],
          ["ihr", "könnt", "müsst", "möchtet", "wollt", "dürft"],
          ["sie/Sie", "können", "müssen", "möchten", "wollen", "dürfen"],
        ],
      },
    ],
    examples: [
      { german: "Ich kann Deutsch sprechen.", english: "I can speak German." },
      { german: "Du musst um 8 Uhr kommen.", english: "You must come at 8 o'clock." },
      { german: "Ich möchte einen Kaffee bestellen.", english: "I would like to order a coffee." },
      { german: "Wir wollen nach Berlin fahren.", english: "We want to go to Berlin." },
      { german: "Hier darf man nicht rauchen.", english: "You may not smoke here." },
      { german: "Kannst du mir helfen?", english: "Can you help me?" },
    ],
    tip: "Merke die Satzstruktur: Modalverb auf Position 2, Infinitiv am ENDE. Beispiel: Ich | möchte | heute Abend | ins Kino | gehen.",
  },

  // ========================================================================
  //  9. Separable Verbs
  // ========================================================================
  {
    id: "separable-verbs",
    title: "Trennbare Verben",
    titleEn: "Separable Verbs",
    explanation: "Trennbare Verben haben ein Präfix (an-, auf-, aus-, ein-, mit-, zu-, ab-, vor-, zurück-), das im Hauptsatz ans Ende geht. Das konjugierte Verb bleibt auf Position 2, das Präfix wandert ans Satzende.",
    explanationEn: "Separable verbs have a prefix (an-, auf-, aus-, ein-, mit-, zu-, ab-, vor-, zurück-) that goes to the end of the sentence. The conjugated verb stays in position 2, the prefix moves to the end.",
    tables: [
      {
        headers: ["Infinitiv", "Bedeutung", "Beispielsatz"],
        rows: [
          ["aufstehen", "to get up", "Ich stehe um 7 Uhr auf."],
          ["anfangen", "to begin", "Der Kurs fängt um 9 Uhr an."],
          ["einkaufen", "to shop", "Ich kaufe im Supermarkt ein."],
          ["anrufen", "to call (phone)", "Ich rufe dich morgen an."],
          ["aufhören", "to stop", "Wir hören um 17 Uhr auf."],
          ["mitkommen", "to come along", "Kommst du mit?"],
          ["zurückkommen", "to come back", "Wann kommst du zurück?"],
          ["aufmachen", "to open", "Mach bitte die Tür auf."],
          ["zumachen", "to close", "Mach bitte das Fenster zu."],
          ["fernsehen", "to watch TV", "Abends sehe ich fern."],
          ["ausgehen", "to go out", "Am Samstag gehe ich aus."],
          ["einladen", "to invite", "Ich lade dich zum Essen ein."],
        ],
      },
    ],
    examples: [
      { german: "Ich stehe jeden Tag um 6 Uhr auf.", english: "I get up at 6 o'clock every day." },
      { german: "Der Film fängt um 20 Uhr an.", english: "The movie starts at 8 PM." },
      { german: "Rufst du mich heute Abend an?", english: "Will you call me this evening?" },
      { german: "Wir kaufen am Samstag ein.", english: "We shop on Saturday." },
      { german: "Mach bitte das Licht an.", english: "Please turn on the light." },
    ],
    tip: "Bei Modalverben bleibt das trennbare Verb zusammen: \"Ich muss um 6 Uhr aufstehen.\" — das Präfix trennt sich NUR im Hauptsatz ohne Modalverb.",
  },

  // ========================================================================
  //  10. Time Expressions
  // ========================================================================
  {
    id: "time-expressions",
    title: "Zeitangaben",
    titleEn: "Time Expressions",
    explanation: "Zeitangaben stehen oft auf Position 1 oder nach dem Verb. \"Um\" + Uhrzeit, \"am\" + Tag, \"im\" + Monat/Jahreszeit, \"von ... bis ...\" für Zeiträume.",
    explanationEn: "Time expressions often go in position 1 or after the verb. \"Um\" + clock time, \"am\" + day, \"im\" + month/season, \"von ... bis ...\" for periods.",
    tables: [
      {
        headers: ["Ausdruck", "Bedeutung", "Beispiel"],
        rows: [
          ["um 8 Uhr", "at 8 o'clock", "Ich stehe um 8 Uhr auf."],
          ["am Montag", "on Monday", "Am Montag habe ich Deutsch."],
          ["am Morgen", "in the morning", "Am Morgen trinke ich Kaffee."],
          ["am Abend", "in the evening", "Am Abend sehe ich fern."],
          ["im Januar", "in January", "Im Januar ist es kalt."],
          ["im Sommer", "in summer", "Im Sommer fahre ich ans Meer."],
          ["von 9 bis 17 Uhr", "from 9 to 5", "Ich arbeite von 9 bis 17 Uhr."],
          ["heute", "today", "Heute gehe ich einkaufen."],
          ["morgen", "tomorrow", "Morgen habe ich frei."],
          ["gestern", "yesterday", "Gestern war ich müde."],
          ["jetzt", "now", "Ich muss jetzt gehen."],
          ["später", "later", "Bis später!"],
          ["bald", "soon", "Er kommt bald."],
          ["immer", "always", "Ich trinke immer Kaffee."],
          ["oft", "often", "Ich gehe oft ins Kino."],
          ["manchmal", "sometimes", "Manchmal koche ich."],
          ["nie / niemals", "never", "Ich komme nie zu spät."],
          ["nächste Woche", "next week", "Nächste Woche fliege ich."],
          ["letzte Woche", "last week", "Letzte Woche war ich krank."],
        ],
      },
    ],
    examples: [
      { german: "Um wie viel Uhr beginnt der Kurs?", english: "What time does the course start?" },
      { german: "Am Samstag gehe ich einkaufen.", english: "On Saturday I go shopping." },
      { german: "Im Winter schneit es oft.", english: "In winter it often snows." },
      { german: "Von Montag bis Freitag arbeite ich.", english: "From Monday to Friday I work." },
      { german: "Ich frühstücke jeden Morgen um halb acht.", english: "I have breakfast every morning at half past seven." },
    ],
    tip: "Uhrzeit: \"halb acht\" = 7:30 (eine halbe Stunde VOR 8). \"Viertel vor acht\" = 7:45. \"Viertel nach acht\" = 8:15.",
  },

  // ========================================================================
  //  11. Prepositions
  // ========================================================================
  {
    id: "prepositions",
    title: "Präpositionen: in, an, auf, nach, zu, von, mit",
    titleEn: "Prepositions: in, at, on, to, from, with",
    explanation: "Präpositionen verbinden Wörter und zeigen Beziehungen (Ort, Richtung, Zeit). \"Mit\", \"von\", \"zu\", \"nach\" brauchen immer den Dativ. Verschmelzungen: in+dem=im, zu+dem=zum, zu+der=zur, an+dem=am.",
    explanationEn: "Prepositions connect words and show relationships (place, direction, time). \"Mit\", \"von\", \"zu\", \"nach\" always take the dative case. Contractions: in+dem=im, zu+dem=zum, zu+der=zur, an+dem=am.",
    tables: [
      {
        headers: ["Präposition", "Bedeutung", "Beispiel"],
        rows: [
          ["in", "in, into", "Ich bin in der Schule. / Ich gehe in die Schule."],
          ["an", "at, on (vertical)", "Ich bin am Bahnhof. / Das Bild ist an der Wand."],
          ["auf", "on (horizontal)", "Das Buch liegt auf dem Tisch."],
          ["nach", "to (cities/countries), after", "Ich fahre nach Berlin. / Nach dem Essen gehe ich."],
          ["zu", "to (people/places)", "Ich gehe zum Arzt. / Ich gehe zur Schule."],
          ["von", "from, of", "Ich komme von der Arbeit."],
          ["mit", "with, by (transport)", "Ich fahre mit dem Bus. / Ich gehe mit meiner Freundin."],
          ["aus", "from (origin), out of", "Ich komme aus der Türkei."],
          ["bei", "at (someone's place)", "Ich wohne bei meinen Eltern."],
          ["für", "for", "Das Geschenk ist für dich."],
        ],
      },
    ],
    examples: [
      { german: "Ich wohne in Berlin.", english: "I live in Berlin." },
      { german: "Ich gehe zum Supermarkt.", english: "I go to the supermarket." },
      { german: "Ich fahre mit dem Zug.", english: "I go by train." },
      { german: "Er kommt aus Spanien.", english: "He comes from Spain." },
      { german: "Wir fahren nach Hamburg.", english: "We drive to Hamburg." },
      { german: "Das Geschenk ist für meine Mutter.", english: "The gift is for my mother." },
    ],
    tip: "\"nach\" für Städte und Länder ohne Artikel: nach Berlin, nach Deutschland. \"in die\" für Länder mit Artikel: in die Schweiz, in die Türkei.",
  },

  // ========================================================================
  //  12. Possessive Articles
  // ========================================================================
  {
    id: "possessive-articles",
    title: "Possessivartikel: mein, dein, sein, ihr",
    titleEn: "Possessive Articles: my, your, his, her",
    explanation: "Possessivartikel zeigen, wem etwas gehört. Sie haben die gleichen Endungen wie \"ein/kein\". Maskulin und Neutrum: mein, dein, sein. Feminin und Plural: meine, deine, seine.",
    explanationEn: "Possessive articles show ownership. They take the same endings as \"ein/kein\". Masculine and neuter: mein, dein, sein. Feminine and plural: meine, deine, seine.",
    tables: [
      {
        headers: ["Pronomen", "Possessivartikel", "Beispiel"],
        rows: [
          ["ich", "mein/meine", "mein Buch, meine Tasche"],
          ["du", "dein/deine", "dein Haus, deine Mutter"],
          ["er/es", "sein/seine", "sein Auto, seine Schwester"],
          ["sie", "ihr/ihre", "ihr Mann, ihre Kinder"],
          ["wir", "unser/unsere", "unser Haus, unsere Schule"],
          ["ihr", "euer/eure", "euer Lehrer, eure Bücher"],
          ["sie/Sie", "ihr/ihre — Ihr/Ihre", "ihr Hund — Ihr Name"],
        ],
      },
      {
        headers: ["", "Maskulin (Nom.)", "Feminin (Nom.)", "Neutrum (Nom.)", "Plural (Nom.)"],
        rows: [
          ["mein", "mein Bruder", "meine Schwester", "mein Kind", "meine Kinder"],
          ["Akkusativ", "meinen Bruder", "meine Schwester", "mein Kind", "meine Kinder"],
        ],
      },
    ],
    examples: [
      { german: "Mein Name ist Thomas.", english: "My name is Thomas." },
      { german: "Wo ist deine Tasche?", english: "Where is your bag?" },
      { german: "Seine Mutter wohnt in Hamburg.", english: "His mother lives in Hamburg." },
      { german: "Ihre Kinder sind in der Schule.", english: "Her children are in school." },
      { german: "Unser Haus ist groß.", english: "Our house is big." },
      { german: "Wie ist Ihr Name?", english: "What is your name? (formal)" },
    ],
    tip: "\"ihr\" (klein) = her/their. \"Ihr\" (groß) = your (formal). Im Kontext wird es klar!",
  },

  // ========================================================================
  //  13. Imperative
  // ========================================================================
  {
    id: "imperative",
    title: "Imperativ: Bitten und Anweisungen",
    titleEn: "Imperative: Requests and Instructions",
    explanation: "Der Imperativ gibt Befehle, Bitten oder Anweisungen. Bei \"du\": Verb ohne -st. Bei \"ihr\": normale ihr-Form. Bei \"Sie\": Verb + Sie. \"Bitte\" macht es höflicher.",
    explanationEn: "The imperative gives commands, requests, or instructions. For \"du\": verb without -st. For \"ihr\": normal ihr-form. For \"Sie\": verb + Sie. Adding \"bitte\" makes it polite.",
    tables: [
      {
        headers: ["Infinitiv", "du", "ihr", "Sie"],
        rows: [
          ["kommen", "Komm!", "Kommt!", "Kommen Sie!"],
          ["gehen", "Geh!", "Geht!", "Gehen Sie!"],
          ["machen", "Mach!", "Macht!", "Machen Sie!"],
          ["lesen", "Lies!", "Lest!", "Lesen Sie!"],
          ["sprechen", "Sprich!", "Sprecht!", "Sprechen Sie!"],
          ["nehmen", "Nimm!", "Nehmt!", "Nehmen Sie!"],
          ["sein", "Sei!", "Seid!", "Seien Sie!"],
          ["aufstehen", "Steh auf!", "Steht auf!", "Stehen Sie auf!"],
        ],
      },
    ],
    examples: [
      { german: "Komm bitte her!", english: "Come here, please!" },
      { german: "Öffnen Sie bitte das Buch.", english: "Please open the book." },
      { german: "Schreib deinen Namen.", english: "Write your name." },
      { german: "Sprecht bitte Deutsch.", english: "Please speak German. (to a group)" },
      { german: "Sei leise!", english: "Be quiet!" },
      { german: "Stehen Sie bitte auf.", english: "Please stand up. (formal)" },
    ],
    tip: "Im Alltag benutzt man oft \"bitte\" + Modalverb statt Imperativ: \"Können Sie bitte das Fenster öffnen?\" klingt höflicher als \"Öffnen Sie das Fenster!\"",
  },

  // ========================================================================
  //  14. Common Phrases and Expressions
  // ========================================================================
  {
    id: "common-phrases",
    title: "Wichtige Redewendungen",
    titleEn: "Important Phrases and Expressions",
    explanation: "Diese Sätze und Ausdrücke hört und benutzt man jeden Tag. Sie sind besonders wichtig für die mündliche TELC-Prüfung.",
    explanationEn: "These sentences and expressions are used every day. They are especially important for the oral TELC exam.",
    tables: [
      {
        headers: ["Situation", "Deutsch", "English"],
        rows: [
          ["Begrüßung", "Guten Morgen / Guten Tag / Guten Abend", "Good morning / Good day / Good evening"],
          ["Abschied", "Auf Wiedersehen / Tschüss / Bis morgen", "Goodbye / Bye / See you tomorrow"],
          ["Danke", "Danke schön / Vielen Dank", "Thank you / Many thanks"],
          ["Bitte", "Bitte schön / Gern geschehen", "You're welcome"],
          ["Entschuldigung", "Entschuldigung / Tut mir leid", "Excuse me / I'm sorry"],
          ["Nicht verstanden", "Können Sie das bitte wiederholen?", "Can you repeat that please?"],
          ["Nicht verstanden", "Wie bitte?", "Pardon?"],
          ["Nicht verstanden", "Können Sie bitte langsamer sprechen?", "Can you please speak more slowly?"],
          ["Hilfe", "Können Sie mir bitte helfen?", "Can you help me please?"],
          ["Vorstellung", "Freut mich / Freut mich, Sie kennenzulernen", "Pleased to meet you"],
          ["Zustimmung", "Ja, genau / Das stimmt / Einverstanden", "Yes exactly / That's right / Agreed"],
          ["Ablehnung", "Nein, danke / Leider nicht", "No, thanks / Unfortunately not"],
          ["Meinung", "Ich finde ... / Ich glaube ...", "I think ... / I believe ..."],
          ["Wunsch", "Ich hätte gern ... / Ich möchte ...", "I would like ..."],
        ],
      },
    ],
    examples: [
      { german: "Entschuldigung, wo ist die Toilette?", english: "Excuse me, where is the toilet?" },
      { german: "Ich hätte gern ein Wasser, bitte.", english: "I would like a water, please." },
      { german: "Das verstehe ich nicht.", english: "I don't understand that." },
      { german: "Wie schreibt man das?", english: "How do you spell that?" },
      { german: "Was bedeutet das?", english: "What does that mean?" },
      { german: "Alles klar!", english: "All clear! / Got it!" },
      { german: "Kein Problem.", english: "No problem." },
      { german: "Es tut mir leid, ich bin zu spät.", english: "I'm sorry, I'm late." },
    ],
    tip: "In der TELC-Prüfung ist \"Können Sie bitte ...?\" die sicherste höfliche Form. Benutze sie immer, wenn du jemanden um etwas bittest.",
  },
];

// ---------------------------------------------------------------------------
//  EXPORT
// ---------------------------------------------------------------------------

import { vocabularyA2, grammarA2 } from './study-data-a2';
import { vocabularyB1, grammarB1 } from './study-data-b1';

// A1 base data (backward compat — no level field = A1)
export const studyData: StudyData = {
  vocabulary,
  grammar,
};

/** Get study data filtered by level */
export function getStudyDataForLevel(level: ExamLevel): StudyData {
  if (level === 'A2') return { vocabulary: vocabularyA2, grammar: grammarA2 };
  if (level === 'B1') return { vocabulary: vocabularyB1, grammar: grammarB1 };
  // A1 default (A1 data has no level field; B2 falls back to B1 content for now)
  if (level === 'B2') return { vocabulary: vocabularyB1, grammar: grammarB1 };
  return studyData;
}

export default studyData;
