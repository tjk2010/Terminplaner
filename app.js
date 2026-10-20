'use strict';

/* =========================================================
   SCHLAUER KALENDER
   Alles läuft im Browser. Termine und Einkaufsliste bleiben
   auf dem Gerät, nur Wetter und Feiertage werden abgefragt.

   Aufbau dieser Datei:
   1) Kleine Helfer        5) Wetter und Feiertage
   2) Daten und Speicher   6) Rezept-Logik (der "schlaue" Teil)
   3) Hinweise, Unterseiten 7) Die vier Bildschirme
   4) Datum und Zeit       8) Start
   ========================================================= */


/* ---------- 1) Kleine Helfer ---------- */

const $ = (auswahl, wurzel = document) => wurzel.querySelector(auswahl);

// h() baut HTML-Elemente: h('p', { class: 'x' }, 'Text').
// Texte werden immer als Text eingefügt, nie als HTML. So kann
// niemand über einen Termintitel Code einschleusen.
function h(tag, eigenschaften, ...kinder) {
  const el = document.createElement(tag);
  for (const [name, wert] of Object.entries(eigenschaften || {})) {
    if (wert === false || wert == null) continue;
    if (name === 'class') el.className = wert;
    else if (name.startsWith('on')) el.addEventListener(name.slice(2).toLowerCase(), wert);
    else if (name in el) el[name] = wert;
    else el.setAttribute(name, wert === true ? '' : wert);
  }
  for (const kind of kinder.flat(Infinity)) {
    if (kind == null || kind === false) continue;
    el.append(kind.nodeType ? kind : document.createTextNode(String(kind)));
  }
  return el;
}

// Einfache Symbole (feste Texte, deshalb ist innerHTML hier unbedenklich)
const SYMBOLE = {
  heute: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  kalender: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  einkauf: '<path d="M5 8h14l-1.2 11a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
  einstellungen: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  haken: '<path d="M5 12.5l4.5 4.5L19 7.5"/>'
};

function symbol(name) {
  const huelle = document.createElement('span');
  huelle.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SYMBOLE[name]}</svg>`;
  return huelle.firstChild;
}

// Das große Wetterbild im Kopfbereich
const WOLKE = '<circle cx="45" cy="70" r="20"/><circle cx="68" cy="55" r="28"/><circle cx="92" cy="72" r="18"/><rect x="45" y="70" width="47" height="20"/>';
const WETTERBILDER = {
  sonne: '<circle cx="65" cy="65" r="26"/><path d="M103 65h14M91.9 91.9l9.9 9.9M65 103v14M38.1 91.9l-9.9 9.9M27 65H13M38.1 38.1l-9.9-9.9M65 27V13M91.9 38.1l9.9-9.9" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round"/>',
  nacht: '<path d="M90 90A40 40 0 1 1 52 26 31 31 0 0 0 90 90z"/>',
  wolken: WOLKE,
  regen: WOLKE + '<path d="M48 100l-6 14M68 100l-6 14M88 100l-6 14" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>',
  schnee: WOLKE + '<circle cx="50" cy="104" r="4.5"/><circle cx="70" cy="113" r="4.5"/><circle cx="90" cy="104" r="4.5"/>',
  gewitter: WOLKE + '<path d="M72 88L56 112h12l-6 18 24-30H74l8-12z"/>',
  nebel: '<path d="M25 55h80M35 75h80M25 95h80" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round"/>',
  teller: '<circle cx="65" cy="65" r="46" fill="none" stroke="currentColor" stroke-width="7"/><circle cx="65" cy="65" r="28" fill="none" stroke="currentColor" stroke-width="5"/>'
};

function wetterBild(typ) {
  const huelle = document.createElement('span');
  huelle.innerHTML = `<svg class="hero-bild" viewBox="0 0 130 135" fill="currentColor" aria-hidden="true">${WETTERBILDER[typ] || WETTERBILDER.teller}</svg>`;
  return huelle.firstChild;
}

function neueId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}


/* ---------- 2) Daten und Speicher ---------- */

const SPEICHER = 'schlauer-kalender-v1';
const WETTER_SPEICHER = 'schlauer-kalender-wetter-v1';
const TIPP_SPEICHER = 'schlauer-kalender-tipp-v1';

const BUNDESLAENDER = [
  { code: 'BW', name: 'Baden-Württemberg' }, { code: 'BY', name: 'Bayern' },
  { code: 'BE', name: 'Berlin' }, { code: 'BB', name: 'Brandenburg' },
  { code: 'HB', name: 'Bremen' }, { code: 'HH', name: 'Hamburg' },
  { code: 'HE', name: 'Hessen' }, { code: 'MV', name: 'Mecklenburg-Vorpommern' },
  { code: 'NI', name: 'Niedersachsen' }, { code: 'NW', name: 'Nordrhein-Westfalen' },
  { code: 'RP', name: 'Rheinland-Pfalz' }, { code: 'SL', name: 'Saarland' },
  { code: 'SN', name: 'Sachsen' }, { code: 'ST', name: 'Sachsen-Anhalt' },
  { code: 'SH', name: 'Schleswig-Holstein' }, { code: 'TH', name: 'Thüringen' }
];

// localStorage kann fehlen oder blockiert sein (z. B. im privaten Modus).
// Deshalb steckt jeder Zugriff in try/catch.
function lesen(schluessel) {
  try {
    const roh = localStorage.getItem(schluessel);
    return roh ? JSON.parse(roh) : null;
  } catch (fehler) {
    return null;
  }
}

function schreiben(schluessel, wert) {
  try {
    localStorage.setItem(schluessel, JSON.stringify(wert));
    return true;
  } catch (fehler) {
    return false;
  }
}

function bereinigeTermine(liste) {
  if (!Array.isArray(liste)) return [];
  return liste
    .filter((t) => t && typeof t.titel === 'string' && t.titel.trim()
      && /^\d{4}-\d{2}-\d{2}$/.test(t.datum) && (!t.zeit || /^\d{2}:\d{2}$/.test(t.zeit)))
    .map((t) => ({
      id: typeof t.id === 'string' && t.id ? t.id : neueId(),
      titel: t.titel.trim().slice(0, 80),
      datum: t.datum,
      zeit: t.zeit || ''
    }));
}

function bereinigeEinkauf(liste) {
  if (!Array.isArray(liste)) return [];
  return liste
    .filter((e) => e && typeof e.name === 'string' && e.name.trim())
    .map((e) => ({
      id: typeof e.id === 'string' && e.id ? e.id : neueId(),
      name: e.name.trim().slice(0, 60),
      erledigt: Boolean(e.erledigt)
    }));
}

function ortGueltig(ort) {
  return Boolean(ort) && typeof ort.name === 'string'
    && Number.isFinite(ort.lat) && Number.isFinite(ort.lon);
}

function zustandLaden() {
  const roh = lesen(SPEICHER) || {};
  const e = roh.einstellungen || {};
  return {
    termine: bereinigeTermine(roh.termine),
    einkauf: bereinigeEinkauf(roh.einkauf),
    einstellungen: {
      stadt: typeof e.stadt === 'string' ? e.stadt : '',
      ort: ortGueltig(e.ort) ? e.ort : null,
      bundesland: BUNDESLAENDER.some((b) => b.code === e.bundesland) ? e.bundesland : '',
      ernaehrung: ['alles', 'vegetarisch', 'vegan'].includes(e.ernaehrung) ? e.ernaehrung : 'alles'
    }
  };
}

let state = zustandLaden();
let speicherWarnungGezeigt = false;

function speichern() {
  const ok = schreiben(SPEICHER, state);
  if (!ok && !speicherWarnungGezeigt) {
    speicherWarnungGezeigt = true;
    zeigeHinweis('Speichern nicht möglich. Ist der private Modus an? Deine Eingaben gehen sonst beim Schließen verloren.');
  }
}


/* ---------- 3) Hinweise und Unterseiten ---------- */

let hinweisTimer;

// Kurze Meldung unten, optional mit einer Aktion ("Rückgängig")
function zeigeHinweis(text, aktion) {
  const box = $('#hinweis');
  box.replaceChildren();
  const el = h('div', { class: 'hinweis' }, h('span', {}, text));
  if (aktion) {
    el.append(h('button', {
      type: 'button',
      onclick: () => { box.replaceChildren(); aktion.tun(); }
    }, aktion.text));
  }
  box.append(el);
  clearTimeout(hinweisTimer);
  hinweisTimer = setTimeout(() => box.replaceChildren(), aktion ? 7000 : 4500);
}

// Die Unterseite, die von unten hereinfährt
const blatt = $('#blatt');
blatt.setAttribute('aria-labelledby', 'blatt-titel');
blatt.addEventListener('click', (ereignis) => { if (ereignis.target === blatt) schliesseBlatt(); });
blatt.addEventListener('close', () => blatt.replaceChildren());

function oeffneBlatt(...inhalt) {
  blatt.replaceChildren(h('div', { class: 'blatt' }, ...inhalt));
  if (!blatt.open) blatt.showModal();
}

function schliesseBlatt() {
  if (blatt.open) blatt.close();
}


/* ---------- 4) Datum und Zeit ---------- */

const zweistellig = (n) => String(n).padStart(2, '0');

// Ein Tag als Text "2026-10-14". Damit lässt sich gut vergleichen und sortieren.
function tagesschluessel(datum) {
  return `${datum.getFullYear()}-${zweistellig(datum.getMonth() + 1)}-${zweistellig(datum.getDate())}`;
}

function schluesselZuDatum(schluessel) {
  const [jahr, monat, tag] = schluessel.split('-').map(Number);
  return new Date(jahr, monat - 1, tag);
}

const heute = () => tagesschluessel(new Date());

function tagVersetzt(schluessel, tage) {
  const datum = schluesselZuDatum(schluessel);
  datum.setDate(datum.getDate() + tage);
  return tagesschluessel(datum);
}

const FORMAT_LANG = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });

function tagName(schluessel) {
  const jetzt = heute();
  if (schluessel === jetzt) return 'Heute';
  if (schluessel === tagVersetzt(jetzt, 1)) return 'Morgen';
  if (schluessel === tagVersetzt(jetzt, -1)) return 'Gestern';
  return FORMAT_LANG.format(schluesselZuDatum(schluessel));
}

function uhrzeit(millisekunden) {
  return new Date(millisekunden).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

const grad = (zahl) => String(Math.round(zahl)).replace('-', '−');

function vergleiche(a, b) {
  return (a.datum + (a.zeit || '')).localeCompare(b.datum + (b.zeit || ''));
}

function termineAm(schluessel) {
  return state.termine.filter((t) => t.datum === schluessel).sort(vergleiche);
}


/* ---------- 5) Wetter und Feiertage ---------- */

// status: 'leer' (kein Ort gewählt), 'laedt', 'ok', 'alt' (ohne Verbindung), 'fehler'
const wetter = { status: 'leer', daten: null, anfrage: 0 };

(function wetterAusSpeicher() {
  const gespeichert = lesen(WETTER_SPEICHER);
  const ort = state.einstellungen.ort;
  if (ort && gespeichert && gespeichert.ortName === ort.name && gespeichert.tag === heute()
      && Number.isFinite(gespeichert.temp)) {
    wetter.daten = gespeichert;
    wetter.status = 'ok';
  } else if (ort) {
    wetter.status = 'laedt';
  }
})();

// Aus einem Städtenamen Koordinaten machen (Open-Meteo, kostenlos, ohne Schlüssel)
async function ladeOrt(stadt) {
  const adresse = 'https://geocoding-api.open-meteo.com/v1/search?'
    + new URLSearchParams({ name: stadt, count: '1', language: 'de', format: 'json' });
  const antwort = await fetch(adresse);
  if (!antwort.ok) throw new Error('Ortssuche fehlgeschlagen');
  const daten = await antwort.json();
  const treffer = daten.results && daten.results[0];
  if (!treffer) return null;
  return { name: treffer.name, lat: treffer.latitude, lon: treffer.longitude };
}

// Die Schnittstelle liefert Wettercodes. Hier übersetzen wir sie.
function beschreibung(code) {
  if (code === 0) return 'klar';
  if (code === 1) return 'überwiegend klar';
  if (code === 2) return 'wolkig';
  if (code === 3) return 'bedeckt';
  if (code === 45 || code === 48) return 'Nebel';
  if (code >= 51 && code <= 57) return 'Nieselregen';
  if (code >= 61 && code <= 67) return 'Regen';
  if (code >= 71 && code <= 77) return 'Schnee';
  if (code >= 80 && code <= 82) return 'Regenschauer';
  if (code === 85 || code === 86) return 'Schneeschauer';
  if (code >= 95) return 'Gewitter';
  return 'wechselhaft';
}

// Welche Farbwelt passt zum Wetter?
function himmelTyp(w) {
  const code = w.code;
  if (code <= 1) return w.istTag === false ? 'nacht' : 'sonne';
  if (code <= 3) return 'wolken';
  if (code === 45 || code === 48) return 'nebel';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'schnee';
  if (code >= 95) return 'gewitter';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'regen';
  return 'wolken';
}

async function ladeWetter() {
  const ort = state.einstellungen.ort;
  if (!ort) {
    wetter.status = 'leer';
    wetter.daten = null;
    zeichneWennAktiv('heute');
    return;
  }

  const nummer = ++wetter.anfrage;
  if (!wetter.daten) {
    wetter.status = 'laedt';
    zeichneWennAktiv('heute');
  }

  try {
    const adresse = 'https://api.open-meteo.com/v1/forecast?' + new URLSearchParams({
      latitude: ort.lat,
      longitude: ort.lon,
      current: 'temperature_2m,weather_code,is_day',
      daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
      timezone: 'auto',
      forecast_days: '1'
    });
    const antwort = await fetch(adresse);
    if (!antwort.ok) throw new Error('Wetter: Status ' + antwort.status);
    const j = await antwort.json();

    const daten = {
      ortName: ort.name,
      tag: heute(),
      stand: Date.now(),
      temp: Number(j.current.temperature_2m),
      code: Number(j.current.weather_code),
      istTag: j.current.is_day !== 0,
      min: Number(j.daily.temperature_2m_min[0]),
      max: Number(j.daily.temperature_2m_max[0]),
      regen: Number(j.daily.precipitation_sum[0]) || 0
    };
    if (![daten.temp, daten.code, daten.min, daten.max].every(Number.isFinite)) {
      throw new Error('Unerwartete Antwort');
    }
    if (nummer !== wetter.anfrage) return;   // inzwischen wurde ein anderer Ort gewählt
    wetter.daten = daten;
    wetter.status = 'ok';
    schreiben(WETTER_SPEICHER, daten);
  } catch (fehler) {
    if (nummer !== wetter.anfrage) return;
    const alt = lesen(WETTER_SPEICHER);
    if (wetter.daten) {
      wetter.status = 'alt';
    } else if (alt && alt.ortName === ort.name && alt.tag === heute() && Number.isFinite(alt.temp)) {
      wetter.daten = alt;
      wetter.status = 'alt';
    } else {
      wetter.daten = null;
      wetter.status = 'fehler';
    }
  }
  vorschlagIndex = 0;
  zeichneWennAktiv('heute');
}

// Feiertage (Nager.Date, kostenlos, ohne Schlüssel). Pro Jahr einmal laden und merken.
const feiertagsListen = {};
const NEUN_TAGE_MAL_10 = 90 * 24 * 3600 * 1000;

async function ladeFeiertage(jahr) {
  if (feiertagsListen[jahr]) return;
  const schluessel = 'schlauer-kalender-feiertage-' + jahr;
  const gespeichert = lesen(schluessel);
  if (gespeichert && Array.isArray(gespeichert.liste) && gespeichert.liste.length
      && Date.now() - gespeichert.stand < NEUN_TAGE_MAL_10) {
    feiertagsListen[jahr] = gespeichert.liste;
    return;
  }
  try {
    const antwort = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${jahr}/DE`);
    if (!antwort.ok) throw new Error('Feiertage: Status ' + antwort.status);
    const roh = await antwort.json();
    const liste = roh
      .filter((f) => typeof f.date === 'string' && typeof f.localName === 'string')
      .map((f) => ({
        date: f.date,
        name: f.localName,
        global: f.global !== false,
        counties: Array.isArray(f.counties) ? f.counties : null
      }));
    if (!liste.length) return;
    feiertagsListen[jahr] = liste;
    schreiben(schluessel, { stand: Date.now(), liste });
  } catch (fehler) {
    // Ohne Verbindung klappt es beim nächsten Start wieder.
    if (gespeichert && Array.isArray(gespeichert.liste)) feiertagsListen[jahr] = gespeichert.liste;
  }
}

async function ladeAlleFeiertage() {
  const jahr = new Date().getFullYear();
  await Promise.all([ladeFeiertage(jahr), ladeFeiertage(jahr + 1)]);
  zeichneWennAktiv('heute');
  zeichneWennAktiv('kalender');
}

// Namen der Feiertage an einem Tag (bundesweite plus die des gewählten Bundeslands)
function feiertagsNamen(schluessel) {
  const liste = feiertagsListen[Number(schluessel.slice(0, 4))] || [];
  const land = state.einstellungen.bundesland;
  return liste
    .filter((f) => f.date === schluessel
      && (f.global || (land && f.counties && f.counties.includes('DE-' + land))))
    .map((f) => f.name)
    .join(' / ');
}

async function setzeStadt(eingabe) {
  const name = eingabe.trim();
  if (!name) {
    zeigeHinweis('Bitte gib eine Stadt ein.');
    return;
  }
  try {
    const ort = await ladeOrt(name);
    if (!ort) {
      zeigeHinweis('Diese Stadt habe ich nicht gefunden. Prüfe die Schreibweise.');
      return;
    }
    state.einstellungen.stadt = ort.name;
    state.einstellungen.ort = ort;
    speichern();
    wetter.daten = null;
    vorschlagIndex = 0;
    ladeWetter();
    zeichne();
    zeigeHinweis(`Ort gespeichert: ${ort.name}.`);
  } catch (fehler) {
    zeigeHinweis('Keine Verbindung. Versuche es gleich noch einmal.');
  }
}

function nutzeStandort() {
  if (!('geolocation' in navigator)) {
    zeigeHinweis('Dein Gerät kann den Standort nicht bestimmen. Gib stattdessen deine Stadt ein.');
    return;
  }
  zeigeHinweis('Standort wird ermittelt …');
  navigator.geolocation.getCurrentPosition((position) => {
    // Auf etwa einen Kilometer gerundet, mehr braucht das Wetter nicht.
    const runden = (x) => Math.round(x * 100) / 100;
    state.einstellungen.ort = { name: 'Dein Standort', lat: runden(position.coords.latitude), lon: runden(position.coords.longitude) };
    state.einstellungen.stadt = '';
    speichern();
    wetter.daten = null;
    vorschlagIndex = 0;
    ladeWetter();
    zeichne();
    zeigeHinweis('Standort gespeichert.');
  }, () => {
    zeigeHinweis('Standort nicht verfügbar. Erlaube den Zugriff oder gib deine Stadt ein.');
  }, { timeout: 10000, maximumAge: 600000 });
}


/* ---------- 6) Rezept-Logik (der "schlaue" Teil) ---------- */

// Welcher Vorschlag aus der Rangliste gerade oben steht
let vorschlagIndex = 0;

function tempKlasse(temperatur) {
  if (temperatur < 3) return 'frost';
  if (temperatur < 12) return 'kalt';
  if (temperatur < 20) return 'mild';
  if (temperatur < 28) return 'warm';
  return 'heiss';
}

// Wie ist das Wetter? Ohne Wetterdaten schätzen wir nach der Jahreszeit.
function kontextWetter() {
  const w = wetter.daten;
  if (w) {
    const typ = himmelTyp(w);
    return {
      klasse: tempKlasse((w.min + w.max) / 2),
      nass: typ === 'regen' || typ === 'gewitter' || w.regen >= 1,
      schnee: typ === 'schnee'
    };
  }
  const monat = new Date().getMonth();   // 0 = Januar
  let klasse = 'mild';
  if ([10, 11, 0, 1].includes(monat)) klasse = 'kalt';
  if ([5, 6, 7].includes(monat)) klasse = 'warm';
  return { klasse, nass: false, schnee: false };
}

function anlassName(schluessel) {
  const feiertag = feiertagsNamen(schluessel);
  if (feiertag) return feiertag;
  const datum = schluesselZuDatum(schluessel);
  const monatTag = `${zweistellig(datum.getMonth() + 1)}-${zweistellig(datum.getDate())}`;
  return { '12-24': 'Heiligabend', '12-31': 'Silvester', '12-06': 'Nikolaus', '02-14': 'Valentinstag', '10-31': 'Halloween' }[monatTag] || '';
}

// Welche besonderen Anlässe sind heute? (siehe Tags in rezepte.js)
function anlaesseFuer(schluessel) {
  const datum = schluesselZuDatum(schluessel);
  const monat = datum.getMonth() + 1;
  const tag = datum.getDate();
  const anlaesse = new Set();

  if (monat === 12 && tag >= 24 && tag <= 26) anlaesse.add('weihnachten');
  if (monat === 12 && tag === 6) anlaesse.add('nikolaus');
  if (monat === 12 && tag === 31) anlaesse.add('silvester');
  if (monat === 1 && tag === 1) anlaesse.add('neujahr');
  if (monat === 2 && tag === 14) anlaesse.add('valentin');
  if (monat === 10 && tag === 31) anlaesse.add('halloween');
  if (datum.getDay() === 0) anlaesse.add('sonntag');

  const feiertag = feiertagsNamen(schluessel).toLowerCase();
  if (feiertag) {
    anlaesse.add('sonntag');   // Feiertage behandeln wir wie Sonntage: gern etwas Aufwendigeres
    if (/weihnacht/.test(feiertag)) anlaesse.add('weihnachten');
    if (/ostern|karfreitag/.test(feiertag)) anlaesse.add('ostern');
    if (/neujahr/.test(feiertag)) anlaesse.add('neujahr');
    if (/einheit/.test(feiertag)) anlaesse.add('einheit');
    if (/arbeit|himmelfahrt|pfingst|fronleichnam/.test(feiertag)) anlaesse.add('grillen');
  }
  return anlaesse;
}

function passtZurErnaehrung(rezept) {
  const wunsch = state.einstellungen.ernaehrung;
  if (wunsch === 'vegan') return rezept.diaet === 'vegan';
  if (wunsch === 'vegetarisch') return rezept.diaet === 'vegan' || rezept.diaet === 'vegetarisch';
  return true;
}

// Ein kleiner Zufallsgenerator, der bei gleichem Startwert immer dieselben Zahlen liefert.
// So bleibt der Vorschlag am selben Tag stabil, statt bei jedem Öffnen zu wechseln.
function zufallsgenerator(startwert) {
  let a = startwert >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Alle passenden Gerichte, das beste zuerst
function rangliste() {
  const tag = heute();
  const kontext = kontextWetter();
  const anlaesse = anlaesseFuer(tag);
  const abendTermin = termineAm(tag).some((t) => t.zeit >= '16:00' && t.zeit <= '20:30');
  const zufall = zufallsgenerator(Number(tag.replace(/-/g, '')));

  return REZEPTE
    .filter(passtZurErnaehrung)
    .map((rezept) => {
      let punkte = 0;
      if (rezept.tags.includes(kontext.klasse)) punkte += 3;                   // passt zur Temperatur
      if (kontext.nass && rezept.tags.includes('nass')) punkte += 2;           // passt zu Regen
      if (kontext.schnee && rezept.tags.includes('schnee')) punkte += 3;       // passt zu Schnee
      for (const anlass of anlaesse) {
        if (rezept.tags.includes(anlass)) punkte += anlass === 'sonntag' ? 2 : 10;   // besondere Anlässe zählen am meisten
      }
      if (abendTermin && rezept.minuten <= 25) punkte += 4;                    // Termin am Abend: lieber schnell
      return { rezept, punkte: punkte + zufall() * 2.5 };                      // etwas Zufall für Abwechslung
    })
    .sort((a, b) => b.punkte - a.punkte)
    .map((eintrag) => eintrag.rezept);
}

function diaetText(diaet) {
  return { vegan: 'vegan', vegetarisch: 'vegetarisch', fleisch: 'mit Fleisch', fisch: 'mit Fisch' }[diaet] || '';
}


/* ---------- 7) Die vier Bildschirme ---------- */

let aktiverTab = 'heute';
let angezeigterHimmel = '';
let satzAnimation = true;
let zeigeVergangene = false;
let fokusEinkauf = false;

const TABS = [
  { id: 'heute', name: 'Heute', symbol: 'heute' },
  { id: 'kalender', name: 'Kalender', symbol: 'kalender' },
  { id: 'einkauf', name: 'Einkauf', symbol: 'einkauf' },
  { id: 'einstellungen', name: 'Einstellungen', symbol: 'einstellungen' }
];

function zeichne() {
  const ansichten = { heute: heuteAnsicht, kalender: kalenderAnsicht, einkauf: einkaufAnsicht, einstellungen: einstellungenAnsicht };
  $('#inhalt').replaceChildren(ansichten[aktiverTab]());
  zeichneTabs();
  setzeThemeFarbe();
  if (fokusEinkauf) {
    fokusEinkauf = false;
    const feld = $('#einkauf-feld');
    if (feld) feld.focus();
  }
}

// Hintergrund-Aktualisierungen (Wetter, Feiertage) zeichnen nur den passenden Tab neu,
// damit sie nichts überschreiben, was du gerade woanders eintippst.
function zeichneWennAktiv(tab) {
  if (aktiverTab !== tab) return;
  // Tippst du gerade in ein Textfeld, warten wir mit dem Neuzeichnen. Die Daten
  // stehen schon im Speicher und erscheinen beim nächsten Zeichnen.
  const fokus = document.activeElement;
  if (fokus && $('#inhalt').contains(fokus) && fokus.matches('input, textarea')) return;
  zeichne();
}

function wechsleTab(id) {
  aktiverTab = id;
  zeichne();
  window.scrollTo(0, 0);
}

function zeichneTabs() {
  $('#tabs').replaceChildren(...TABS.map((tab) => h('button', {
    type: 'button',
    class: 'tab',
    'aria-current': tab.id === aktiverTab ? 'page' : false,
    onclick: () => wechsleTab(tab.id)
  }, h('span', { class: 'tab-symbol' }, symbol(tab.symbol)), tab.name)));
}

// Die Farbe der Statusleiste auf dem Handy passt sich dem Kopfbereich an.
const HIMMEL_FARBEN = { sonne: '#ffd24a', nacht: '#26305c', wolken: '#c3ccd8', nebel: '#cdd0d4', regen: '#4e73a0', schnee: '#e3edf6', gewitter: '#3e3f73' };

function setzeThemeFarbe() {
  const dunkel = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let farbe = dunkel ? '#10151f' : '#f3f5f8';
  if (aktiverTab === 'heute') {
    farbe = HIMMEL_FARBEN[angezeigterHimmel] || (dunkel ? '#232c3d' : '#e4e8ee');
  }
  const meta = $('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', farbe);
}

/* --- Tab "Heute" --- */

function terminZeile(termin) {
  return h('button', { type: 'button', class: 'zeile', onclick: () => terminBlatt(termin) },
    h('span', { class: 'zeile-zeit' }, termin.zeit || 'Ganztägig'),
    h('span', { class: 'zeile-titel' }, termin.titel));
}

function wetterZeile() {
  const w = wetter.daten;
  if (wetter.status === 'laedt' && !w) return 'Wetter wird geladen …';
  if (wetter.status === 'fehler') return 'Das Wetter ist gerade nicht erreichbar. Der Vorschlag richtet sich nach der Jahreszeit.';
  if (!w) return '';
  let text = `${w.ortName}: ${grad(w.temp)} °C, ${beschreibung(w.code)}. Tief ${grad(w.min)}°, Hoch ${grad(w.max)}°.`;
  if (wetter.status === 'alt') text += ` Stand ${uhrzeit(w.stand)} Uhr, ohne Verbindung.`;
  return text;
}

function ideeZeile(rezept) {
  return h('button', { type: 'button', class: 'idee', onclick: () => rezeptBlatt(rezept) },
    h('span', { class: 'idee-name' }, rezept.name),
    h('span', { class: 'idee-text' }, rezept.text),
    h('span', { class: 'idee-zeit' }, `${rezept.minuten} Min., ${diaetText(rezept.diaet)}`));
}

function iosOhneApp() {
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const alsApp = navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
  return ios && !alsApp && !lesen(TIPP_SPEICHER);
}

function heuteAnsicht() {
  const tag = heute();
  const w = wetter.daten;
  const typ = w ? himmelTyp(w) : '';
  const ersteEinrichtung = wetter.status === 'leer';
  const anlass = anlassName(tag);

  const liste = rangliste();
  const anzahl = Math.min(10, liste.length);
  const position = anzahl ? vorschlagIndex % anzahl : 0;
  const hauptgericht = liste[position];
  const ideen = [];
  for (let schritt = 1; schritt < anzahl && ideen.length < 2; schritt++) {
    ideen.push(liste[(position + schritt) % anzahl]);
  }

  // Der Kopfbereich. Die Farbe wechselt weich vom alten zum neuen Wetter.
  const hero = h('header', { class: 'hero', 'data-himmel': angezeigterHimmel });
  if (angezeigterHimmel !== typ) {
    requestAnimationFrame(() => requestAnimationFrame(() => { hero.dataset.himmel = typ; }));
  }
  angezeigterHimmel = typ;

  const satzKlasse = 'hero-satz' + (satzAnimation ? ' hero-satz--neu' : '');
  satzAnimation = false;

  const text = h('div', { class: 'hero-text' },
    h('p', { class: 'hero-datum' }, FORMAT_LANG.format(new Date())),
    anlass ? h('p', { class: 'hero-anlass' }, `Heute ist ${anlass}.`) : null);

  if (ersteEinrichtung) {
    const feld = h('input', { type: 'text', placeholder: 'Deine Stadt', 'aria-label': 'Deine Stadt', autocomplete: 'address-level2', maxLength: 60 });
    text.append(
      h('p', { class: satzKlasse }, 'Hallo! Wo wohnst du?'),
      h('p', { class: 'hero-beschreibung' }, 'Mit deinem Ort kenne ich das Wetter und schlage dir passende Gerichte für heute vor.'),
      h('form', { class: 'hero-formular', onsubmit: (e) => { e.preventDefault(); setzeStadt(feld.value); } },
        feld,
        h('button', { type: 'submit', class: 'knopf knopf--voll' }, 'Wetter laden'),
        h('button', { type: 'button', class: 'knopf knopf--rand', onclick: nutzeStandort }, 'Meinen Standort verwenden')));
  } else {
    text.append(h('p', { class: 'hero-wetter' }, wetterZeile()));
    if (wetter.status === 'fehler' || wetter.status === 'alt') {
      text.append(h('button', { type: 'button', class: 'knopf knopf--text', onclick: ladeWetter }, 'Erneut versuchen'));
    }
    if (hauptgericht) {
      text.append(
        h('p', { class: satzKlasse }, `Heute gibt's ${hauptgericht.name}.`),
        h('p', { class: 'hero-beschreibung' }, hauptgericht.text),
        h('p', { class: 'hero-zeit' }, `Dauert etwa ${hauptgericht.minuten} Minuten, ${diaetText(hauptgericht.diaet)}.`),
        h('div', { class: 'hero-knoepfe' },
          h('button', { type: 'button', class: 'knopf knopf--voll', onclick: () => rezeptBlatt(hauptgericht) }, 'Zutaten ansehen'),
          h('button', { type: 'button', class: 'knopf knopf--rand', onclick: () => { vorschlagIndex += 1; satzAnimation = true; zeichne(); } }, 'Anderer Vorschlag')));
    }
  }
  hero.append(wetterBild(typ || 'teller'), text);

  // Termine von heute
  const heutige = termineAm(tag);
  const termine = h('section', { class: 'bereich' },
    h('div', { class: 'bereich-kopf' },
      h('h2', {}, 'Heute dran'),
      h('button', { type: 'button', class: 'knopf knopf--text', onclick: () => terminBlatt() }, 'Neuer Termin')),
    heutige.length
      ? h('ul', { class: 'liste' }, heutige.map((t) => h('li', {}, terminZeile(t))))
      : h('p', { class: 'leer' }, 'Heute ist nichts geplant. Tippe auf „Neuer Termin“, um etwas einzutragen.'));

  // Weitere Ideen. Bei der ersten Einrichtung zeigen wir hier alle drei Ideen.
  const ideenListe = ersteEinrichtung && hauptgericht ? [hauptgericht, ...ideen] : ideen;
  const ideenBereich = ideenListe.length
    ? h('section', { class: 'bereich' },
        h('h2', {}, ersteEinrichtung ? 'Ideen nach Jahreszeit' : 'Weitere Ideen'),
        h('div', {}, ideenListe.map(ideeZeile)))
    : null;

  // Hinweis fürs iPhone: Zum Home-Bildschirm hinzufügen
  const tipp = iosOhneApp()
    ? h('div', { class: 'hinweis-box' },
        h('p', {}, 'Tipp fürs iPhone: Tippe in Safari auf „Teilen“ und dann auf „Zum Home-Bildschirm“. Dann startet der Kalender wie eine echte App.'),
        h('button', { type: 'button', class: 'knopf knopf--rand', onclick: () => { schreiben(TIPP_SPEICHER, true); zeichne(); } }, 'Verstanden'))
    : null;

  return h('div', {}, hero, termine, ideenBereich, tipp);
}

/* --- Tab "Kalender" --- */

function kalenderAnsicht() {
  const tag = heute();
  const alle = [...state.termine].sort(vergleiche);
  const kommende = alle.filter((t) => t.datum >= tag);
  const vergangene = alle.filter((t) => t.datum < tag);

  // Alle Tage sammeln, an denen etwas ist: Termine und Feiertage der nächsten vier Monate
  const tage = new Map();
  const eintrag = (schluessel) => {
    if (!tage.has(schluessel)) tage.set(schluessel, { feiertag: '', termine: [] });
    return tage.get(schluessel);
  };
  for (const t of kommende) eintrag(t.datum).termine.push(t);
  for (let i = 0; i < 120; i++) {
    const schluessel = tagVersetzt(tag, i);
    const name = feiertagsNamen(schluessel);
    if (name) eintrag(schluessel).feiertag = name;
  }
  const sortierteTage = [...tage.keys()].sort();

  const tagesblock = (schluessel, inhalt, vorbei) => [
    h('h3', { class: 'tag-titel' }, tagName(schluessel)),
    h('ul', { class: 'liste' },
      inhalt.feiertag
        ? h('li', {}, h('div', { class: 'zeile zeile--feiertag zeile--statisch' },
            h('span', { class: 'zeile-zeit' }, 'Feiertag'),
            h('span', { class: 'zeile-titel' }, inhalt.feiertag)))
        : null,
      inhalt.termine.map((t) => h('li', { class: vorbei ? 'zeile--vorbei' : '' }, terminZeile(t))))
  ];

  const kommendeBlock = sortierteTage.flatMap((schluessel) => tagesblock(schluessel, tage.get(schluessel), false));

  // Vergangene Termine, neueste zuerst, nur auf Wunsch
  const vergangeneTage = new Map();
  for (const t of [...vergangene].reverse()) {
    if (!vergangeneTage.has(t.datum)) vergangeneTage.set(t.datum, { feiertag: '', termine: [] });
    vergangeneTage.get(t.datum).termine.unshift(t);
  }

  return h('div', {},
    h('div', { class: 'titelzeile' },
      h('h1', {}, 'Kalender'),
      h('button', { type: 'button', class: 'knopf knopf--voll', onclick: () => terminBlatt() }, symbol('plus'), 'Neuer Termin')),
    h('section', { class: 'bereich' },
      !kommende.length
        ? h('p', { class: 'leer' }, 'Noch keine kommenden Termine. Tippe oben auf „Neuer Termin“, um den ersten einzutragen.')
        : null,
      kommendeBlock,
      vergangene.length
        ? h('div', { class: 'knopf-reihe', style: 'margin-top:1.6rem' },
            h('button', { type: 'button', class: 'knopf knopf--rand', 'aria-expanded': String(zeigeVergangene), onclick: () => { zeigeVergangene = !zeigeVergangene; zeichne(); } },
              zeigeVergangene ? 'Vergangene Termine ausblenden' : `Vergangene Termine anzeigen (${vergangene.length})`))
        : null,
      zeigeVergangene
        ? [...vergangeneTage.keys()].flatMap((schluessel) => tagesblock(schluessel, vergangeneTage.get(schluessel), true))
        : null));
}

function terminBlatt(termin) {
  const neu = !termin;
  const titel = h('input', { type: 'text', id: 't-titel', required: true, maxLength: 80, value: neu ? '' : termin.titel, placeholder: 'z. B. Zahnarzt', autocomplete: 'off' });
  const datum = h('input', { type: 'date', id: 't-datum', required: true, value: neu ? heute() : termin.datum });
  const zeit = h('input', { type: 'time', id: 't-zeit', value: neu ? '' : termin.zeit });

  const formular = h('form', {
    onsubmit: (e) => {
      e.preventDefault();
      const neuerTitel = titel.value.trim();
      if (!neuerTitel) { titel.focus(); return; }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(datum.value)) { datum.focus(); return; }
      if (neu) {
        state.termine.push({ id: neueId(), titel: neuerTitel, datum: datum.value, zeit: zeit.value });
      } else {
        Object.assign(termin, { titel: neuerTitel, datum: datum.value, zeit: zeit.value });
      }
      speichern();
      schliesseBlatt();
      zeichne();
      zeigeHinweis('Termin gespeichert.');
    }
  },
    h('div', { class: 'feld' }, h('label', { for: 't-titel' }, 'Titel'), titel),
    h('div', { class: 'feld-reihe' },
      h('div', { class: 'feld' }, h('label', { for: 't-datum' }, 'Datum'), datum),
      h('div', { class: 'feld' }, h('label', { for: 't-zeit' }, 'Uhrzeit'), zeit)),
    h('p', { class: 'blatt-notiz' }, 'Ohne Uhrzeit gilt der Termin für den ganzen Tag.'),
    h('div', { class: 'blatt-knoepfe' },
      h('button', { type: 'submit', class: 'knopf knopf--voll' }, 'Speichern'),
      h('button', { type: 'button', class: 'knopf knopf--rand', onclick: schliesseBlatt }, 'Abbrechen'),
      neu ? null : h('button', {
        type: 'button',
        class: 'knopf knopf--gefahr',
        onclick: () => {
          state.termine = state.termine.filter((t) => t.id !== termin.id);
          speichern();
          schliesseBlatt();
          zeichne();
          zeigeHinweis('Termin gelöscht.', {
            text: 'Rückgängig',
            tun: () => { state.termine.push(termin); speichern(); zeichne(); }
          });
        }
      }, 'Termin löschen')));

  oeffneBlatt(h('h2', { id: 'blatt-titel' }, neu ? 'Neuer Termin' : 'Termin bearbeiten'), formular);
}

/* --- Tab "Einkauf" --- */

function einkaufAnsicht() {
  const eingabe = h('input', { type: 'text', id: 'einkauf-feld', placeholder: 'Was fehlt noch?', 'aria-label': 'Neuer Eintrag', maxLength: 60, autocomplete: 'off' });
  const offene = state.einkauf.filter((e) => !e.erledigt);
  const erledigte = state.einkauf.filter((e) => e.erledigt);

  const punkt = (e) => h('li', {},
    h('button', {
      type: 'button',
      class: 'einkauf-punkt',
      'aria-pressed': String(e.erledigt),
      onclick: () => { e.erledigt = !e.erledigt; speichern(); zeichne(); }
    },
      h('span', { class: 'einkauf-kreis' }, e.erledigt ? symbol('haken') : null),
      h('span', { class: 'einkauf-name' }, e.name)));

  return h('div', {},
    h('div', { class: 'titelzeile' }, h('h1', {}, 'Einkauf')),
    h('section', { class: 'bereich' },
      h('form', {
        class: 'einkauf-eingabe',
        onsubmit: (ereignis) => {
          ereignis.preventDefault();
          const name = eingabe.value.trim();
          if (!name) return;
          fuegeZumEinkaufHinzu([name]);
          fokusEinkauf = true;
          zeichne();
        }
      }, eingabe, h('button', { type: 'submit', class: 'knopf knopf--voll' }, 'Hinzufügen')),
      state.einkauf.length
        ? h('ul', { class: 'liste', style: 'margin-top:.8rem' }, [...offene, ...erledigte].map(punkt))
        : h('p', { class: 'leer', style: 'margin-top:1rem' }, 'Die Liste ist leer. Öffne ein Rezept und tippe auf „Auf die Einkaufsliste“, dann landen die Zutaten hier.'),
      h('div', { class: 'einkauf-aktionen' },
        h('button', {
          type: 'button', class: 'knopf knopf--rand', disabled: !erledigte.length,
          onclick: () => { state.einkauf = offene; speichern(); zeichne(); }
        }, 'Erledigte entfernen'),
        h('button', {
          type: 'button', class: 'knopf knopf--rand', disabled: !state.einkauf.length,
          onclick: () => {
            if (!confirm('Die ganze Einkaufsliste leeren?')) return;
            state.einkauf = [];
            speichern();
            zeichne();
          }
        }, 'Liste leeren'))));
}

// Gibt zurück, wie viele Einträge neu dazugekommen sind (doppelte werden übersprungen)
function fuegeZumEinkaufHinzu(namen) {
  let neu = 0;
  for (const name of namen) {
    const vorhanden = state.einkauf.some((e) => e.name.toLowerCase() === name.toLowerCase());
    if (!vorhanden) {
      state.einkauf.push({ id: neueId(), name, erledigt: false });
      neu += 1;
    }
  }
  speichern();
  return neu;
}

function rezeptBlatt(rezept) {
  oeffneBlatt(
    h('h2', { id: 'blatt-titel' }, rezept.name),
    h('p', { class: 'blatt-meta' }, `${rezept.text} Dauert etwa ${rezept.minuten} Minuten, ${diaetText(rezept.diaet)}.`),
    h('p', { class: 'feld-titel' }, 'Zutaten'),
    h('ul', { class: 'blatt-liste' }, rezept.zutaten.map((zutat) => h('li', {}, zutat))),
    h('div', { class: 'blatt-knoepfe' },
      h('button', {
        type: 'button',
        class: 'knopf knopf--voll',
        onclick: () => {
          const neu = fuegeZumEinkaufHinzu(rezept.zutaten);
          schliesseBlatt();
          zeichneWennAktiv('einkauf');
          zeigeHinweis(
            neu ? `${neu} ${neu === 1 ? 'Zutat' : 'Zutaten'} auf der Einkaufsliste.` : 'Alle Zutaten stehen schon auf der Liste.',
            { text: 'Ansehen', tun: () => wechsleTab('einkauf') });
        }
      }, 'Auf die Einkaufsliste'),
      h('button', { type: 'button', class: 'knopf knopf--rand', onclick: schliesseBlatt }, 'Schließen')),
    h('p', { class: 'blatt-notiz' }, 'Mengen richten sich nach deinem Geschmack und der Personenzahl. Prüfe die Zutaten bei Allergien oder Unverträglichkeiten immer selbst.'));
}

/* --- Tab "Einstellungen" --- */

function sichern() {
  const inhalt = JSON.stringify({
    app: 'schlauer-kalender',
    version: 1,
    gesichert: new Date().toISOString(),
    termine: state.termine,
    einkauf: state.einkauf
  }, null, 2);
  const adresse = URL.createObjectURL(new Blob([inhalt], { type: 'application/json' }));
  const link = h('a', { href: adresse, download: `kalender-sicherung-${heute()}.json` });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(adresse), 5000);
}

async function wiederherstellen(datei) {
  try {
    const inhalt = JSON.parse(await datei.text());
    if (!inhalt || inhalt.app !== 'schlauer-kalender') throw new Error('Falsche Datei');
    const schluesselVon = (t) => `${t.datum}|${t.zeit}|${t.titel}`;
    const vorhanden = new Set(state.termine.map(schluesselVon));
    let neueTermine = 0;
    for (const t of bereinigeTermine(inhalt.termine)) {
      if (!vorhanden.has(schluesselVon(t))) { state.termine.push(t); vorhanden.add(schluesselVon(t)); neueTermine += 1; }
    }
    const neueEintraege = fuegeZumEinkaufHinzu(bereinigeEinkauf(inhalt.einkauf).map((e) => e.name));
    speichern();
    zeichne();
    zeigeHinweis(`Wiederhergestellt: ${neueTermine} Termine und ${neueEintraege} Einkaufseinträge dazugekommen.`);
  } catch (fehler) {
    zeigeHinweis('Diese Datei kann ich nicht lesen. Wähle eine Sicherung, die diese App erstellt hat.');
  }
}

function alleDatenLoeschen() {
  if (!confirm('Wirklich alles löschen? Termine, Einkaufsliste und Einstellungen sind danach weg.')) return;
  try {
    Object.keys(localStorage).filter((k) => k.startsWith('schlauer-kalender')).forEach((k) => localStorage.removeItem(k));
  } catch (fehler) { /* nichts zu löschen */ }
  state = zustandLaden();
  wetter.daten = null;
  wetter.status = 'leer';
  wetter.anfrage += 1;
  vorschlagIndex = 0;
  angezeigterHimmel = '';
  for (const jahr of Object.keys(feiertagsListen)) delete feiertagsListen[jahr];
  ladeAlleFeiertage();
  zeichne();
  zeigeHinweis('Alles gelöscht.');
}

function einstellungenAnsicht() {
  const e = state.einstellungen;
  const stadtFeld = h('input', { type: 'text', id: 's-stadt', value: e.stadt, placeholder: e.ort && !e.stadt ? 'Dein Standort' : 'z. B. München', autocomplete: 'address-level2', maxLength: 60 });
  const dateiFeld = h('input', { type: 'file', accept: 'application/json,.json', hidden: true, onchange: (ereignis) => { const datei = ereignis.target.files[0]; if (datei) wiederherstellen(datei); ereignis.target.value = ''; } });

  const auswahl = (id, wert, optionen, beiAenderung) => h('select', { id, onchange: (ereignis) => beiAenderung(ereignis.target.value) },
    optionen.map(([optionWert, name]) => h('option', { value: optionWert, selected: optionWert === wert }, name)));

  return h('div', {},
    h('div', { class: 'titelzeile' }, h('h1', {}, 'Einstellungen')),

    h('section', { class: 'gruppe' },
      h('h2', {}, 'Ort'),
      h('form', { onsubmit: (ereignis) => { ereignis.preventDefault(); setzeStadt(stadtFeld.value); } },
        h('div', { class: 'feld' },
          h('label', { for: 's-stadt' }, 'Stadt'),
          stadtFeld,
          h('small', {}, e.ort ? `Aktuell: ${e.ort.name}` : 'Noch kein Ort gewählt.')),
        h('div', { class: 'knopf-reihe' },
          h('button', { type: 'submit', class: 'knopf knopf--voll' }, 'Ort übernehmen'),
          h('button', { type: 'button', class: 'knopf knopf--rand', onclick: nutzeStandort }, 'Meinen Standort verwenden')))),

    h('section', { class: 'gruppe' },
      h('h2', {}, 'Feiertage'),
      h('div', { class: 'feld' },
        h('label', { for: 's-land' }, 'Bundesland'),
        auswahl('s-land', e.bundesland, [['', 'Nur bundesweite Feiertage'], ...BUNDESLAENDER.map((b) => [b.code, b.name])], (wert) => {
          state.einstellungen.bundesland = wert;
          speichern();
          zeigeHinweis('Bundesland gespeichert.');
        }),
        h('small', {}, 'Mit Bundesland zeige ich auch die Feiertage an, die nur dort gelten.'))),

    h('section', { class: 'gruppe' },
      h('h2', {}, 'Essen'),
      h('div', { class: 'feld' },
        h('label', { for: 's-essen' }, 'Ernährung'),
        auswahl('s-essen', e.ernaehrung, [['alles', 'Alles'], ['vegetarisch', 'Vegetarisch'], ['vegan', 'Vegan']], (wert) => {
          state.einstellungen.ernaehrung = wert;
          vorschlagIndex = 0;
          speichern();
          zeigeHinweis('Ernährung gespeichert.');
        }),
        h('small', {}, 'Die Ideen sind Vorschläge. Prüfe die Zutaten bei Allergien oder Unverträglichkeiten immer selbst.'))),

    h('section', { class: 'gruppe' },
      h('h2', {}, 'Meine Daten'),
      h('p', {}, 'Termine und Einkaufsliste bleiben nur auf diesem Gerät, in diesem Browser. Sichere sie ab und zu, vor allem bevor du Safari-Daten löschst oder das Handy wechselst.'),
      h('div', { class: 'knopf-reihe' },
        h('button', { type: 'button', class: 'knopf knopf--rand', onclick: sichern }, 'Daten sichern'),
        h('button', { type: 'button', class: 'knopf knopf--rand', onclick: () => dateiFeld.click() }, 'Daten wiederherstellen'),
        dateiFeld),
      h('button', { type: 'button', class: 'knopf knopf--gefahr', onclick: alleDatenLoeschen }, 'Alles löschen')),

    h('section', { class: 'gruppe' },
      h('h2', {}, 'Über die App'),
      h('p', {},
        'Wetter von ', h('a', { href: 'https://open-meteo.com/', target: '_blank', rel: 'noopener' }, 'Open-Meteo.com'),
        ', Feiertage von ', h('a', { href: 'https://date.nager.at/', target: '_blank', rel: 'noopener' }, 'Nager.Date'),
        '. Beim Laden gehen dein Ort (als Koordinaten) und das Jahr an diese Dienste. Sonst verlässt nichts dein Gerät.')));
}


/* ---------- 8) Start ---------- */

// Wenn du die App wieder öffnest: Wetter auffrischen, falls es alt ist.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  const w = wetter.daten;
  const veraltet = !w || w.tag !== heute() || Date.now() - w.stand > 30 * 60 * 1000;
  if (state.einstellungen.ort && veraltet && wetter.status !== 'laedt') ladeWetter();
  ladeAlleFeiertage();
  zeichneWennAktiv('heute');
  zeichneWennAktiv('kalender');
});

function start() {
  zeichne();
  if (state.einstellungen.ort) ladeWetter();
  ladeAlleFeiertage();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* App läuft auch ohne */ });
  }
}

start();
