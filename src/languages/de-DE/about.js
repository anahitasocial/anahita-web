// The public About page. Not a setting — see containers/about.
export default {
  cTitle: 'Über',
  mTitle: 'Über',
  cDescription: 'Was auf dieser Website läuft.',
  unavailable: 'Diese Website hat ihr NodeInfo-Dokument nicht geliefert.',
  readOnly: 'Vom Server gemeldet. Ändern lässt sich das in der Serverkonfiguration.',
  promises: {
    title: 'Unsere Versprechen an dich',
    rules: 'Unsere Regeln lesen',
  },
  // Two headings and one set of bare field labels, so a row says
  // "Repository" rather than "Server repository" under a heading
  // that already said Server.
  server: {
    mTitle: 'Server',
  },
  client: {
    mTitle: 'Client',
  },
  fields: {
    name: 'Name',
    version: 'Version',
    license: 'Lizenz',
    repository: 'Repository',
  },
  usage: {
    mTitle: 'Nutzung',
    people: 'Personen',
    activeMonth: 'Aktiv diesen Monat',
    activeHalfyear: 'Aktiv in sechs Monaten',
    localPosts: 'Beiträge',
  },
  registration: {
    mTitle: 'Registrierung',
    mode: 'Modus',
    open: 'Offen',
    closed: 'Geschlossen',
    approvalRequired: 'Freigabe nötig',
    invitationsAccepted: 'Einladungen möglich',
  },
  contact: {
    mTitle: 'Kontakt und Rechtliches',
    supportEmail: 'Support-E-Mail',
    supportPhone: 'Support-Telefon',
    termsOfService: 'Nutzungsbedingungen',
    privacyPolicy: 'Datenschutzerklärung',
  },
};
