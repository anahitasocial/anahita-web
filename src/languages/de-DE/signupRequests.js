export default {
  cTitle: 'Registrierungsanfragen',
  mTitle: 'Registrierungsanfragen',
  empty: 'Niemand wartet.',
  restricted: {
    cTitle: 'Registrierungsanfragen sind eingeschränkt',
    cDescription: 'Nur für Administrator:innen.',
  },
  usernameTakenHint: 'Dieser Benutzername ist inzwischen vergeben, deshalb kann die Anfrage nicht freigegeben werden.',
  invited: 'Eingeladen',
  fields: {
    note: 'Notiz',
  },
  actions: {
    approve: 'Freigeben',
    reject: 'Ablehnen',
  },
  form: {
    noteHint: 'Optional. Nur für deine Unterlagen, der Person wird sie nicht gezeigt.',
  },
  confirmApprove: {
    cTitle: 'Diese Anfrage freigeben?',
    cDescription: 'Erstellt ein Konto für {{username}} und schickt eine E-Mail an {{email}}.',
  },
  confirmReject: {
    cTitle: 'Diese Anfrage ablehnen?',
    cDescription: 'Lehnt {{username}} ab und schickt der Person eine E-Mail.',
  },
  alerts: {
    approved: '{{username}} wurde freigegeben',
    rejected: '{{username}} wurde abgelehnt',
  },
  errors: {
    browse: 'Die Anfragen konnten nicht geladen werden.',
    approve: 'Die Anfrage konnte nicht freigegeben werden.',
    reject: 'Die Anfrage konnte nicht abgelehnt werden.',
    // Says what to do instead, because retrying cannot work.
    usernameTaken: 'Dieser Benutzername wurde vergeben, während die Anfrage wartete. Lehne sie ab und bitte um einen anderen.',
    alreadyDecided: 'Ein:e andere:r Administrator:in hat diese Anfrage schon beantwortet.',
    notVerified: 'Die Person hat ihre E-Mail-Adresse noch nicht bestätigt.',
  },
};
