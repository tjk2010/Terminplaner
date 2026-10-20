// ---------------------------------------------------------
// REZEPTE: Hier steckt das "Wissen" der App.
// Du kannst jederzeit eigene Gerichte ergänzen: Kopiere einfach
// eine Zeile, ändere die Werte und lade die Datei neu hoch.
//
// diaet:   "vegan" | "vegetarisch" | "fleisch" | "fisch"
// minuten: Zubereitungszeit (bis 25 Min. gilt als "schnell")
// tags:    Wetter:  "frost" (unter 3 °C), "kalt" (3–11 °C), "mild" (12–19 °C),
//                   "warm" (20–27 °C), "heiss" (ab 28 °C),
//                   "nass" (Regen/Gewitter), "schnee"
//          Anlässe: "weihnachten", "silvester", "neujahr", "ostern", "grillen",
//                   "halloween", "nikolaus", "valentin", "einheit", "sonntag"
// ---------------------------------------------------------

const REZEPTE = [
  // ----- Kalt und nass: Suppen, Eintöpfe, Wärmendes -----
  {
    name: 'Kürbissuppe mit Brot',
    text: 'Cremig, mit Ingwer und gerösteten Kernen.',
    minuten: 35, diaet: 'vegan',
    tags: ['frost', 'kalt', 'nass', 'halloween'],
    zutaten: ['Hokkaido-Kürbis', 'Zwiebel', 'Ingwer', 'Kokosmilch', 'Gemüsebrühe', 'Kürbiskerne', 'Brot']
  },
  {
    name: 'Linseneintopf',
    text: 'Deftig und sättigend, wärmt von innen.',
    minuten: 40, diaet: 'vegan',
    tags: ['frost', 'kalt', 'nass', 'neujahr'],
    zutaten: ['Tellerlinsen', 'Karotten', 'Sellerie', 'Kartoffeln', 'Zwiebel', 'Gemüsebrühe', 'Essig', 'Lorbeerblatt']
  },
  {
    name: 'Chili sin Carne',
    text: 'Bohnen, Mais und Paprika mit ordentlich Würze.',
    minuten: 45, diaet: 'vegan',
    tags: ['frost', 'kalt', 'nass', 'halloween'],
    zutaten: ['Kidneybohnen', 'Mais', 'Paprika', 'Dosentomaten', 'Zwiebel', 'Knoblauch', 'Chilipulver', 'Reis']
  },
  {
    name: 'Thai-Curry mit Kokosmilch',
    text: 'Gemüse und Tofu in einer sämigen, scharfen Sauce.',
    minuten: 30, diaet: 'vegan',
    tags: ['kalt', 'mild', 'nass'],
    zutaten: ['Kokosmilch', 'rote Currypaste', 'Tofu', 'Paprika', 'Brokkoli', 'Reis', 'Limette']
  },
  {
    name: 'Gulasch mit Nudeln',
    text: 'Langsam geschmort, mit viel Paprika und Zwiebeln.',
    minuten: 90, diaet: 'fleisch',
    tags: ['frost', 'kalt', 'nass', 'schnee'],
    zutaten: ['Rindergulasch', 'Zwiebeln', 'Paprika', 'Tomatenmark', 'Paprikapulver', 'Rinderbrühe', 'Nudeln']
  },
  {
    name: 'Kartoffelsuppe',
    text: 'Mit Lauch und Karotten, dazu frische Petersilie.',
    minuten: 35, diaet: 'vegetarisch',
    tags: ['frost', 'kalt', 'nass'],
    zutaten: ['Kartoffeln', 'Karotten', 'Lauch', 'Gemüsebrühe', 'Sahne', 'Petersilie']
  },
  {
    name: 'Käsespätzle',
    text: 'Mit viel Bergkäse und knusprigen Zwiebeln.',
    minuten: 35, diaet: 'vegetarisch',
    tags: ['frost', 'kalt', 'schnee', 'nass'],
    zutaten: ['Spätzle', 'Emmentaler', 'Bergkäse', 'Zwiebeln', 'Schnittlauch']
  },
  {
    name: 'Tomatensuppe mit Käsetoast',
    text: 'Schnell gemacht und genau richtig für graue Tage.',
    minuten: 25, diaet: 'vegetarisch',
    tags: ['kalt', 'mild', 'nass'],
    zutaten: ['Dosentomaten', 'Zwiebel', 'Knoblauch', 'Sahne', 'Toast', 'Käse', 'Basilikum']
  },
  {
    name: 'Bratapfel mit Vanillesauce',
    text: 'Gefüllt mit Marzipan, Rosinen und Zimt.',
    minuten: 40, diaet: 'vegetarisch',
    tags: ['frost', 'schnee', 'kalt'],
    zutaten: ['Äpfel', 'Marzipan', 'Rosinen', 'Zimt', 'Milch', 'Vanillepuddingpulver']
  },
  {
    name: 'Schweinebraten mit Knödeln',
    text: 'Der klassische Sonntagsbraten mit dunkler Sauce.',
    minuten: 120, diaet: 'fleisch',
    tags: ['sonntag', 'kalt', 'frost', 'nass'],
    zutaten: ['Schweinebraten', 'Zwiebeln', 'Karotten', 'Brühe', 'Semmelknödel', 'Krautsalat']
  },
  {
    name: 'Gemüse-Lasagne',
    text: 'Mit Zucchini, Spinat und viel überbackenem Käse.',
    minuten: 70, diaet: 'vegetarisch',
    tags: ['sonntag', 'kalt', 'nass', 'mild'],
    zutaten: ['Lasagneplatten', 'Zucchini', 'Spinat', 'Dosentomaten', 'Mozzarella', 'Ricotta', 'Parmesan']
  },

  // ----- Mild und wechselhaft: Alltagsgerichte -----
  {
    name: 'Spaghetti Bolognese',
    text: 'Die Sauce darf ruhig lange köcheln.',
    minuten: 45, diaet: 'fleisch',
    tags: ['kalt', 'mild', 'nass'],
    zutaten: ['Spaghetti', 'Rinderhack', 'Dosentomaten', 'Zwiebel', 'Karotte', 'Knoblauch', 'Parmesan']
  },
  {
    name: 'Ofenkartoffeln mit Kräuterquark',
    text: 'Knusprig aus dem Ofen, dazu frischer Quark.',
    minuten: 50, diaet: 'vegetarisch',
    tags: ['kalt', 'mild', 'nass'],
    zutaten: ['Kartoffeln', 'Quark', 'Kräuter', 'Zitrone', 'Olivenöl', 'Salz']
  },
  {
    name: 'One-Pot-Pasta',
    text: 'Alles in einem Topf, kaum Abwasch.',
    minuten: 20, diaet: 'vegan',
    tags: ['kalt', 'mild', 'nass'],
    zutaten: ['Pasta', 'Cherrytomaten', 'Knoblauch', 'Spinat', 'Gemüsebrühe', 'Basilikum']
  },
  {
    name: 'Shakshuka',
    text: 'Eier in würziger Tomaten-Paprika-Sauce, dazu Brot.',
    minuten: 25, diaet: 'vegetarisch',
    tags: ['kalt', 'mild', 'nass'],
    zutaten: ['Eier', 'Dosentomaten', 'Paprika', 'Zwiebel', 'Knoblauch', 'Kreuzkümmel', 'Brot']
  },
  {
    name: 'Ofengemüse mit Kichererbsen',
    text: 'Alles auf ein Blech, der Ofen macht die Arbeit.',
    minuten: 40, diaet: 'vegan',
    tags: ['kalt', 'mild'],
    zutaten: ['Süßkartoffeln', 'Paprika', 'Zucchini', 'Kichererbsen', 'Olivenöl', 'Paprikapulver', 'Hummus']
  },
  {
    name: 'Ofengemüse mit Feta',
    text: 'Herbstgemüse mit Feta, dazu Fladenbrot.',
    minuten: 40, diaet: 'vegetarisch',
    tags: ['kalt', 'mild'],
    zutaten: ['Kürbis', 'Paprika', 'Zwiebeln', 'Feta', 'Olivenöl', 'Thymian', 'Fladenbrot']
  },
  {
    name: 'Pfannkuchen mit Apfelmus',
    text: 'Dünn gebacken, süß oder mit Käse gefüllt.',
    minuten: 25, diaet: 'vegetarisch',
    tags: ['kalt', 'mild', 'nass'],
    zutaten: ['Mehl', 'Milch', 'Eier', 'Butter', 'Apfelmus', 'Zucker']
  },
  {
    name: 'Reispfanne mit Gemüse und Ei',
    text: 'Gut für Reste: Gemüse, Reis, Ei, fertig.',
    minuten: 20, diaet: 'vegetarisch',
    tags: ['mild', 'warm'],
    zutaten: ['Reis', 'Eier', 'Paprika', 'Karotten', 'Frühlingszwiebeln', 'Sojasauce']
  },
  {
    name: 'Lachs mit Ofengemüse',
    text: 'Saftiger Lachs auf buntem Gemüse mit Zitrone.',
    minuten: 35, diaet: 'fisch',
    tags: ['mild', 'warm'],
    zutaten: ['Lachsfilet', 'Zucchini', 'Cherrytomaten', 'Zitrone', 'Olivenöl', 'Dill', 'Kartoffeln']
  },
  {
    name: 'Wraps mit Hähnchen und Salat',
    text: 'Schnell gefüllt und gut zum Mitnehmen.',
    minuten: 20, diaet: 'fleisch',
    tags: ['mild', 'warm'],
    zutaten: ['Wraps', 'Hähnchenbrust', 'Salat', 'Tomaten', 'Joghurt', 'Gurke']
  },
  {
    name: 'Veggie-Burger mit Süßkartoffelpommes',
    text: 'Bohnen-Patties im Brötchen, dazu Ofenpommes.',
    minuten: 45, diaet: 'vegan',
    tags: ['mild', 'warm', 'grillen'],
    zutaten: ['Kidneybohnen', 'Haferflocken', 'Süßkartoffeln', 'Burgerbrötchen', 'Salat', 'Tomate', 'Zwiebel']
  },

  // ----- Warm und heiß: Leichtes, Frisches, Grillen -----
  {
    name: 'Griechischer Salat',
    text: 'Knackig, mit Feta und Oliven. Dazu Fladenbrot.',
    minuten: 15, diaet: 'vegetarisch',
    tags: ['warm', 'heiss', 'grillen'],
    zutaten: ['Tomaten', 'Gurke', 'Paprika', 'rote Zwiebel', 'Feta', 'Oliven', 'Olivenöl', 'Oregano']
  },
  {
    name: 'Wassermelonen-Feta-Salat',
    text: 'Süß, salzig und eiskalt: genau richtig bei Hitze.',
    minuten: 10, diaet: 'vegetarisch',
    tags: ['heiss', 'warm'],
    zutaten: ['Wassermelone', 'Feta', 'Minze', 'Limette', 'Olivenöl']
  },
  {
    name: 'Gazpacho',
    text: 'Kalte Tomatensuppe, kommt ganz ohne Herd aus.',
    minuten: 15, diaet: 'vegan',
    tags: ['heiss'],
    zutaten: ['Tomaten', 'Gurke', 'Paprika', 'Knoblauch', 'Olivenöl', 'Sherryessig', 'Brot']
  },
  {
    name: 'Couscous-Salat mit Gemüse',
    text: 'Quillt in Minuten und schmeckt auch kalt.',
    minuten: 20, diaet: 'vegan',
    tags: ['warm', 'heiss'],
    zutaten: ['Couscous', 'Gurke', 'Tomaten', 'Paprika', 'Minze', 'Zitrone', 'Olivenöl']
  },
  {
    name: 'Nudelsalat',
    text: 'Fusilli mit Paprika, Mais und Joghurt-Dressing.',
    minuten: 25, diaet: 'vegetarisch',
    tags: ['warm', 'heiss', 'grillen'],
    zutaten: ['Fusilli', 'Paprika', 'Mais', 'Gurke', 'Joghurt', 'Essig', 'Schnittlauch']
  },
  {
    name: 'Caprese-Sandwich',
    text: 'Tomate, Mozzarella und Basilikum im Ciabatta.',
    minuten: 10, diaet: 'vegetarisch',
    tags: ['warm', 'heiss'],
    zutaten: ['Ciabatta', 'Tomaten', 'Mozzarella', 'Basilikum', 'Olivenöl']
  },
  {
    name: 'Gegrilltes Gemüse mit Dip',
    text: 'Zucchini, Paprika und Pilze vom Rost.',
    minuten: 30, diaet: 'vegan',
    tags: ['warm', 'heiss', 'grillen'],
    zutaten: ['Zucchini', 'Paprika', 'Aubergine', 'Champignons', 'Olivenöl', 'Hummus', 'Fladenbrot']
  },
  {
    name: 'Burger vom Grill',
    text: 'Saftiges Patty, Käse und frischer Salat.',
    minuten: 40, diaet: 'fleisch',
    tags: ['warm', 'heiss', 'grillen'],
    zutaten: ['Rinderhack', 'Burgerbrötchen', 'Cheddar', 'Salat', 'Tomate', 'Gurke', 'Zwiebel']
  },
  {
    name: 'Bratwurst mit Kartoffelsalat',
    text: 'Vom Grill oder aus der Pfanne, mit Senf.',
    minuten: 40, diaet: 'fleisch',
    tags: ['warm', 'mild', 'grillen', 'einheit'],
    zutaten: ['Bratwürste', 'Kartoffeln', 'Essiggurken', 'Zwiebel', 'Brühe', 'Senf']
  },

  // ----- Besondere Anlässe -----
  {
    name: 'Entenbrust mit Rotkohl und Klößen',
    text: 'Das Festessen: knusprige Haut, Rotkohl, Kartoffelklöße.',
    minuten: 120, diaet: 'fleisch',
    tags: ['weihnachten', 'kalt', 'frost'],
    zutaten: ['Entenbrust', 'Rotkohl', 'Kartoffelklöße', 'Äpfel', 'Zwiebel', 'Gewürznelken', 'Orange']
  },
  {
    name: 'Nussbraten mit Rotkohl',
    text: 'Festlich und vegan: Walnüsse, Pilze und Haferflocken.',
    minuten: 75, diaet: 'vegan',
    tags: ['weihnachten', 'kalt', 'frost'],
    zutaten: ['Walnüsse', 'Haselnüsse', 'Haferflocken', 'Zwiebel', 'Champignons', 'Rotkohl', 'Kartoffeln']
  },
  {
    name: 'Rotkohl-Apfel-Pfanne mit Klößen',
    text: 'Vegetarisch und festlich, mit Zimt und Nelken.',
    minuten: 45, diaet: 'vegetarisch',
    tags: ['weihnachten', 'kalt', 'frost'],
    zutaten: ['Rotkohl', 'Äpfel', 'Zwiebel', 'Kartoffelklöße', 'Zimt', 'Gewürznelken', 'Preiselbeeren']
  },
  {
    name: 'Kartoffelsalat mit Würstchen',
    text: 'Der Klassiker für Heiligabend: einfach und gemütlich.',
    minuten: 40, diaet: 'fleisch',
    tags: ['weihnachten', 'silvester'],
    zutaten: ['Kartoffeln', 'Wiener Würstchen', 'Essiggurken', 'Zwiebel', 'Brühe', 'Senf', 'Essig']
  },
  {
    name: 'Raclette',
    text: 'Für gesellige Abende: jeder brutzelt sein eigenes.',
    minuten: 60, diaet: 'fleisch',
    tags: ['silvester', 'weihnachten', 'frost', 'kalt'],
    zutaten: ['Raclettekäse', 'Kartoffeln', 'Champignons', 'Paprika', 'Schinken', 'Cornichons']
  },
  {
    name: 'Käsefondue',
    text: 'Brot, Kartoffeln und Gemüse in geschmolzenem Käse.',
    minuten: 40, diaet: 'vegetarisch',
    tags: ['silvester', 'frost', 'kalt'],
    zutaten: ['Fonduekäse', 'Brot', 'Kartoffeln', 'Knoblauch', 'Weißwein', 'Cornichons']
  },
  {
    name: 'Lammkeule mit Rosmarinkartoffeln',
    text: 'Zum Osterfest: zart gegart mit Knoblauch.',
    minuten: 120, diaet: 'fleisch',
    tags: ['ostern', 'sonntag'],
    zutaten: ['Lammkeule', 'Rosmarin', 'Knoblauch', 'Kartoffeln', 'grüne Bohnen', 'Olivenöl']
  },
  {
    name: 'Spargel mit Kartoffeln und Sauce Hollandaise',
    text: 'Frühlingsklassiker, am besten mit neuen Kartoffeln.',
    minuten: 40, diaet: 'vegetarisch',
    tags: ['ostern', 'mild', 'warm'],
    zutaten: ['weißer Spargel', 'Kartoffeln', 'Eier', 'Butter', 'Zitrone', 'Petersilie']
  },
  {
    name: 'Frühlingsrisotto mit grünem Spargel',
    text: 'Cremig, mit Erbsen und Zitronenabrieb.',
    minuten: 35, diaet: 'vegan',
    tags: ['ostern', 'mild'],
    zutaten: ['Risottoreis', 'grüner Spargel', 'Erbsen', 'Zwiebel', 'Gemüsebrühe', 'Zitrone', 'Hefeflocken']
  },
  {
    name: 'Pasta mit Garnelen in Knoblauch',
    text: 'Zu zweit: Linguine, Chili und frische Petersilie.',
    minuten: 25, diaet: 'fisch',
    tags: ['valentin'],
    zutaten: ['Linguine', 'Garnelen', 'Knoblauch', 'Chili', 'Petersilie', 'Zitrone', 'Olivenöl']
  },
  {
    name: 'Rote-Bete-Risotto',
    text: 'Tiefrot, cremig und mit Ziegenfrischkäse.',
    minuten: 40, diaet: 'vegetarisch',
    tags: ['valentin', 'kalt', 'frost'],
    zutaten: ['Risottoreis', 'Rote Bete', 'Zwiebel', 'Gemüsebrühe', 'Parmesan', 'Ziegenfrischkäse']
  },
  {
    name: 'Lebkuchen-Pfannkuchen',
    text: 'Zum Nikolaustag: mit Apfel und Zimt.',
    minuten: 25, diaet: 'vegetarisch',
    tags: ['nikolaus', 'kalt', 'frost'],
    zutaten: ['Mehl', 'Milch', 'Eier', 'Lebkuchengewürz', 'Äpfel', 'Zimt', 'Puderzucker']
  }
];
