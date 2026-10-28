export default {
  cTitle: 'Willkommen, {{name}}',
  intro: 'Ein paar schnelle Schritte, dann kann’s losgehen.',
  steps: {
    avatar: 'Foto',
    profile: 'Über dich',
    interests: 'Interessen',
    featured: 'Wem folgen',
    recommended: 'Empfohlen',
  },
  avatar: {
    title: 'Füge ein Profilfoto hinzu',
    description: 'Leute folgen viel eher jemandem, dessen Gesicht sie sehen. Tippe auf den Kreis, um ein Foto auszuwählen.',
    error: 'Dein Foto konnte nicht hochgeladen werden. Versuch es noch einmal oder überspring es vorerst.',
  },
  profile: {
    title: 'Erzähl etwas über dich',
    description: 'Dein Name und ein, zwei Zeilen über dich erscheinen neben allem, was du veröffentlichst.',
  },
  interests: {
    title: 'Wofür interessierst du dich?',
    description: 'Hashtags, die hier oft verwendet werden. Wähle bis zu zehn: Beiträge mit einem davon bilden auf deiner Startseite einen Feed „Meine Interessen“ und helfen uns, dir Personen und Gruppen vorzuschlagen.',
    follow_one: '{{ count }} Hashtag folgen',
    follow_other: '{{ count }} Hashtags folgen',
    feedName: 'Meine Interessen',
  },
  recommended: {
    title: 'Für dich empfohlen',
    description: 'Personen und Gruppen, die dir gefallen könnten, jeweils mit dem Grund. Du folgst niemandem, bevor du es selbst auswählst.',
  },
  featured: {
    title: 'Profile zum Folgen',
    description: 'Ein paar Personen und Gruppen für den Anfang. Du folgst niemandem, bevor du es selbst auswählst.',
    inviter: 'Hat dich eingeladen',
    person: 'Person',
    group: 'Gruppe',
    website: 'Website',
    event: 'Veranstaltung',
    following: 'Folgst du',
  },
  actions: {
    continue: 'Weiter',
    finish: 'Fertig',
    followSelected: 'Ausgewählten folgen',
    skip: 'Vorerst überspringen',
  },
  prompts: {
    error: 'Etwas ist schiefgelaufen. Versuch es noch einmal.',
    followError: 'Einigen Profilen konnte nicht gefolgt werden. Du kannst ihnen später über ihr Profil folgen.',
  },
  nudge: {
    title: 'Vervollständige dein Profil',
    description: 'Füge ein Foto und eine kurze Bio hinzu, damit Leute dich erkennen.',
    action: 'Profil vervollständigen',
    dismiss: 'Ausblenden',
  },
};
