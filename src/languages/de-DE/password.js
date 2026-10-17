export default {
  mTitle: 'Passwort',
  cTitle: 'Passwort',
  cDesc: 'Ändere das Passwort, mit dem du dich anmeldest.',
  description: 'Dein neues Passwort muss mindestens {{count}} Zeichen lang sein. Nimm eine eigene Passphrase, die du sonst nirgends verwendest.',
  fields: {
    new: 'Neues Passwort',
  },
  toggle: {
    show: 'Passwort anzeigen',
    hide: 'Passwort verbergen',
  },
  submit: 'Passwort ändern',
  update: 'Ändern',
  submitting: 'Wird geändert…',
  success: 'Dein Passwort wurde geändert. Eine Bestätigung wurde per E-Mail verschickt.',
  // Plural keys are the bare key for one and `key_other` for more, which
  // is what i18next 26 looks up. `key_plural`, which older versions read,
  // is never looked up: a phrase written that way shows its singular for
  // every count.
  successSessions: 'Dein Passwort wurde geändert und {{count}} andere Sitzung wurde abgemeldet. Eine Bestätigung wurde per E-Mail verschickt.',
  successSessions_other: 'Dein Passwort wurde geändert und {{count}} andere Sitzungen wurden abgemeldet. Eine Bestätigung wurde per E-Mail verschickt.',
  errors: {
    newRequired: 'Gib ein neues Passwort ein.',
    newTooShort: 'Das neue Passwort muss mindestens {{count}} Zeichen lang sein.',
    newTooLong: 'Das neue Passwort darf höchstens {{count}} Zeichen lang sein.',
    reused: 'Dein neues Passwort muss sich von deinem aktuellen unterscheiden.',
    generic: 'Dein Passwort konnte nicht geändert werden. Versuch es noch einmal.',
    // No duration named. The server's window is 15 minutes today
    // (rateLimitScopePasswordEdit), but a number repeated here goes
    // stale silently the moment that constant is tuned, and a promise
    // of "30 minutes" that is really 15 is worse than no promise.
    tooMany: 'Zu viele Versuche. Warte ein paar Minuten und versuch es dann noch einmal.',
  },
};
