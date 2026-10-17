export default {
  cTitle: 'Einladungen',
  mTitle: 'Einladungen',
  empty: 'Keine Einladungen verschickt.',
  // How many more may wait at once; the count goes down as they send.
  remaining_one: 'Du kannst noch {{count}} Einladung verschicken.',
  remaining_other: 'Du kannst noch {{count}} Einladungen verschicken.',
  atLimit_one: 'Du hast {{count}} offene Einladung, mehr geht nicht. Ein Platz wird frei, wenn eine Einladung angenommen wird, abläuft oder du sie zurückziehst.',
  atLimit_other: 'Du hast {{count}} offene Einladungen, mehr geht nicht. Ein Platz wird frei, wenn eine Einladung angenommen wird, abläuft oder du sie zurückziehst.',
  restricted: {
    cTitle: 'Einladungen sind eingeschränkt',
    cDescription: 'Nur für Administrator:innen.',
  },
  fields: {
    recipientEmail: 'E-Mail',
  },
  status: {
    pending: 'Offen',
    used: 'Angenommen',
    expired: 'Abgelaufen',
  },
  actions: {
    add: 'Hinzufügen',
    send: 'Senden',
    revoke: 'Zurückziehen',
    // The icon button carries no text, so the accessible name has to
    // say which invite it revokes — there is one per row.
    revokeFor: 'Einladung an {{email}} zurückziehen',
  },
  form: {
    cTitle: 'Jemanden einladen',
    cDescription: 'Die Person bekommt eine E-Mail mit einem Link zum Beitreten.',
  },
  confirmRevoke: {
    cTitle: 'Diese Einladung zurückziehen?',
    // Kept, because it sends mail to somebody who is not expecting it.
    cDescription: 'Der Link an {{email}} funktioniert dann nicht mehr, und die Person erfährt, dass die Einladung zurückgezogen wurde.',
  },
  alerts: {
    sent: 'Eine Einladung wurde an {{email}} verschickt',
    revoked: 'Die Einladung an {{email}} wurde zurückgezogen',
  },
  errors: {
    browse: 'Die Einladungen konnten nicht geladen werden.',
    add: 'Die Einladung konnte nicht verschickt werden.',
    delete: 'Die Einladung konnte nicht zurückgezogen werden.',
    // Only a fallback: the server sends its own message here, which
    // names the number outstanding and how a slot frees.
    conflict: 'Diese Adresse hat schon ein Konto, oder du hast zu viele offene Einladungen.',
    forbidden: 'Diese Website verschickt keine Einladungen.',
    rateLimited: 'Zu viele Einladungen in letzter Zeit. Versuch es später noch einmal.',
  },
};
