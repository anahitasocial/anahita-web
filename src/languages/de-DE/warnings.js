// Inhaltswarnungen (anahita-services, Zeile 122).
export default {
  label: 'Inhaltswarnung',
  none: 'Keine',
  title: 'Inhaltswarnung',
  help: 'Man sieht deinen Inhalt verschwommen und hinter einer Warnung.',
  kinds: {
    adult: 'Inhalte für Erwachsene',
    suggestive: 'Sexuell anzüglich',
    graphic: 'Drastische Bilder',
    nudity: 'Nicht sexuelle Nacktheit',
    other: 'Andere',
  },
  lines: {
    adult: 'Explizite sexuelle Bilder',
    suggestive: 'Sexuell, ohne Nacktheit',
    graphic: 'Gewalt, Blut oder verstörende Bilder',
    nudity: 'Zum Beispiel künstlerische Akte',
    other: 'In eigenen Worten: Spoiler, Trauer …',
  },
  words: 'Was er enthält',
  wordsNeeded: 'Sag, was der Beitrag enthält.',
  remove: 'Inhaltswarnung entfernen',
  view: 'Ansehen',
  byModerator: 'Die Administratoren haben dem Beitrag diese Warnung gegeben; sie kann hier nicht geändert werden.',
  // In the dialog, for an administrator giving one as the site's.
  moderatorHelp: 'Von den Administratoren gegeben: Die Person, die es schrieb, wird informiert und kann sie nicht entfernen.',
  saved: 'Inhaltswarnung gespeichert.',
  notSaved: 'Die Inhaltswarnung konnte nicht gespeichert werden.',
  // A post the reader chose to hide, as one line in a list.
  hidden: 'Ausgeblendet: {{ warning }}',
  // What each reader chooses, in their settings (row 122, phase 2).
  choices: {
    title: 'Inhaltswarnungen',
    help: 'Was du von einem Beitrag mit einer Warnung siehst',
    show: 'Zeigen',
    warn: 'Warnen',
    hide: 'Ausblenden',
    // Other's line, for a reader: the kinds' own lines say the rest.
    otherLine: 'In den Worten der Person, die ihn schrieb: Spoiler, Trauer …',
  },
};
