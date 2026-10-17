export default {
  cTitle: 'Personen',
  mTitle: 'Personen',
  // Under the title of the list of people: whose list it is.
  browse: {
    title: 'Personen',
    local: 'Personen auf {{ site }}.',
    localUnnamed: 'Personen auf dieser Instanz.',
    elsewhere: {
      both: 'Um jemanden im Fediverse oder auf Bluesky zu finden, such nach dem Handle.',
      activitypub: 'Um jemanden im Fediverse zu finden, such nach dem Handle.',
      atproto: 'Um jemanden auf Bluesky zu finden, such nach dem Handle.',
    },
  },
  add: {
    cTitle: 'Person hinzufügen',
    mTitle: 'Person hinzufügen',
  },
  settings: {
    authLogs: 'Anmeldungen',
    webauthn: 'Passkeys',
    totp: '2FA',
    info: 'Infos',
    features: 'Funktionen',
    permissions: 'Berechtigungen',
    access: 'Zugriff',
    reposts: 'Reposts',
    quotes: 'Zitate',
    // Deletion copy, namespace-specific — groups carry their own in groups.js,
    // because the sign-in and passkey lines here are meaningless for a group.
    delete: 'Löschen',
    // The card title. Its text is in the accounts namespace, shared with
    // the accounts list.
    purge: 'Endgültig löschen',
    // Archive. The copy does the work here: archive sits next to delete and
    // must never read as the gentler option. Permanence first, then what is
    // preserved — which is the reason to choose it, not a softener.
    archive: 'Archivieren',
    archivePrompts: {
      permanent: 'Archivieren lässt sich nicht rückgängig machen. Dieses Profil kann nicht zurückgeholt werden.',
      personDescription: 'Nichts wird gelöscht. Jeder Beitrag, jede Antwort und jedes Foto bleibt genau dort, wo es ist, und behält seine Adresse, sodass gespeicherte Links weiter funktionieren. Was aufhört, ist das Profil selbst: Es verschwindet aus Feeds und Vorschlägen, und niemand kann sich mehr damit anmelden.',
      selfSignIn: 'Danach kannst du dich nicht mehr anmelden, und auch sonst niemand – die E-Mail-Adresse und der Benutzername bleiben reserviert, damit niemand sie übernehmen kann.',
      confirmLabel: 'Gib {{ alias }} ein, um zu bestätigen',
      action: 'Endgültig archivieren',
      archived: 'Dieses Profil wurde archiviert.',
      errors: {
        nothingToArchive: 'Nichts zu archivieren – dieses Profil ist schon archiviert oder zum Löschen vorgemerkt.',
        forbidden: 'Du darfst dieses Profil nicht archivieren.',
        lastSuperAdmin: 'Das ist die einzige Super-Administrator:in. Ernenne erst jemand anderen, bevor du dieses Profil archivierst.',
        generic: 'Das Profil konnte nicht archiviert werden. Bitte versuch es noch einmal.',
      },
    },
    // Disable. Deliberately light — it is a switch, and dressing it up like
    // the two below trains people to type confirmations without reading.
    disable: 'Deaktivieren',
    disablePrompts: {
      description: 'Deaktivieren verbirgt dieses Profil und meldet die Person ab. Solange es deaktiviert ist, kann sie sich nicht anmelden.',
      descriptionDisabled: 'Dieses Profil ist deaktiviert. Die Person kann sich nicht anmelden, und es erscheint nirgends.',
      reversible: 'Das lässt sich jederzeit rückgängig machen, und nichts wird gelöscht. Um ein Profil endgültig zu entfernen, archiviere oder lösche es stattdessen.',
      action: 'Deaktivieren',
      actionEnable: 'Aktivieren',
      disabled: 'Dieses Profil wurde deaktiviert.',
      enabled: 'Dieses Profil wurde aktiviert.',
      errors: {
        forbidden: 'Du darfst das nicht ändern.',
        lastSuperAdmin: 'Das ist die einzige Super-Administrator:in und kann nicht deaktiviert werden.',
        generic: 'Das konnte nicht geändert werden. Bitte versuch es noch einmal.',
      },
    },
    deletePrompts: {
      counts: {
        intro: 'Auf diesem Profil gerade:',
        posts: '{{ count }} Beitrag',
        posts_other: '{{ count }} Beiträge',
        replies: '{{ count }} Antwort',
        replies_other: '{{ count }} Antworten',
        followers: '{{ count }} Follower',
        followers_other: '{{ count }} Follower',
        admins: '{{ count }} Administrator:in',
        admins_other: '{{ count }} Administrator:innen',
        following: 'folgt {{ count }} Person',
        following_other: 'folgt {{ count }} Personen',
        groupsAdministered: 'verwaltet {{ count }} Gruppe',
        groupsAdministered_other: 'verwaltet {{ count }} Gruppen',
        memberSince: 'Mitglied seit {{ date }}.',
      },
      description: 'Löschen entfernt dieses Profil und alles darauf: Beiträge, Antworten, Fotos, Follower und die Gruppen, denen es folgt. Antworten, die andere unter diesen Inhalten hinterlassen haben, verschwinden mit.',
      reversible: 'Das passiert nicht sofort. Das Profil wird gleich verborgen und nach {{ count }} Tagen endgültig gelöscht. Wer sich vorher anmeldet, kann es wiederherstellen.',
      revoked: 'Die Sitzungen auf allen Geräten enden jetzt, und alle Passkeys werden entfernt. Wiederherstellen bringt sie nicht zurück.',
      handle: 'Das Handle {{ alias }} bleibt danach reserviert, sodass niemand anders es nehmen kann.',
      scheduled: 'Dieses Profil ist zum Löschen vorgemerkt. Melde dich vor dem {{ date }} an, um es wiederherzustellen.',
    },
    notifications: 'Benachrichtigungseinstellungen',
    followRequests: 'Folgeanfragen',
    password: 'Passwort',
    email: 'E-Mail',
    username: 'Benutzername',
    // Section labels for the grouped person settings page. The keys above
    // are still used as the per-card titles inside a section.
    sections: {
      account: 'Konto',
      security: 'Sicherheit',
      access: 'Privatsphäre',
      permissions: 'Berechtigungen',
      fediverse: 'Fediverse',
      administration: 'Verwaltung',
      danger: 'Gefahrenbereich',
    },
  },
  notifications: {
    cTitle: 'Benachrichtigungen',
    cDescription: 'Bearbeite deine Benachrichtigungseinstellungen',
    mTitle: 'Benachrichtigungen',
    email: 'Benachrichtigungen per E-Mail erhalten',
    optionsTitle: 'Benachrichtigungen erhalten für',
    options: {
      all: 'Alle Beiträge',
      following: 'Nur Beiträge, denen du folgst',
    },
  },
  person: {
    displayName: 'Anzeigename',
    username: 'Benutzername',
    email: 'E-Mail',
    body: 'Über mich',
    pronouns: 'Pronomen',
    pronounsUnset: 'Keine Angabe',
    postingLanguage: 'Sprache deiner Beiträge',
    postingLanguageUnset: 'Die Sprache meines Browsers',
    postingLanguageHint: 'Das Eingabefeld startet in dieser Sprache. Du kannst sie bei jedem Beitrag ändern.',
    // The set that makes sense in THIS language. Other locales ship their own;
    // a language with no gendered third-person pronoun ships an empty list and
    // the field offers only "prefer not to say".
    pronounOptions: [
      'er/ihm',
      'sie/ihr',
      'dey/denen',
      'er/dey',
      'sie/dey',
    ],
    usertype: 'Benutzertyp',
    usertypeOptions: {
      guest: 'Gast',
      registered: 'Registriert',
      administrator: 'Admin',
      'super-administrator': 'Super-Admin',
    },
    joinedDate: 'Dabei seit {{ date }}',
    lastVisitOn: 'Letzter Besuch am {{ date }}',
  },
  confirm: {
    delete: 'Möchtest du das Profil von {{ name }} löschen?',
  },
  account: {
    prompts: {
      error: 'Etwas ist schiefgelaufen!',
      errorUsernameTaken: 'Dieser Benutzername ist schon vergeben!',
      errorEmailTaken: 'Diese E-Mail-Adresse wird hier schon verwendet!',
    },
  },

  // The Administration section: an administrator looking at somebody
  // else's account. Never the viewer's own — see containers/actors/
  // Settings/sections.js.
  agreements: {
    cTitle: 'Vereinbarungen',
    tos: 'Nutzungsbedingungen',
    privacy: 'Datenschutzerklärung',
    acceptedOn: 'Akzeptiert am {{date}}',
    never: 'Nie akzeptiert',
    version: 'v{{version}}',
    unavailable: 'Die Vereinbarungen konnten nicht geladen werden.',
  },
  metadata: {
    cTitle: 'Konto',
    joined: 'Dabei seit',
    lastSignIn: 'Letzte Anmeldung',
    unknown: 'Unbekannt',
  },
  revokePasskeys: {
    cTitle: 'Passkeys',
    cDescription: 'Alle Passkeys dieses Kontos entfernen.',
    count: 'Dieses Konto hat {{count}} Passkey(s).',
    unknown: 'Die Anzahl der Passkeys konnte nicht gelesen werden.',
    actions: {
      revoke: 'Widerrufen',
    },
    confirm: {
      cTitle: 'Alle Passkeys widerrufen?',
      cDescription: '{{name}} kann sich dann nicht mehr mit einem Passkey anmelden. Das Passwort funktioniert weiter, und du wirst vorher gebeten zu bestätigen, dass du es bist.',
    },
    alerts: {
      revoked: 'Alle Passkeys von {{name}} wurden widerrufen',
    },
    errors: {
      revoke: 'Die Passkeys konnten nicht widerrufen werden.',
    },
  },
  revokeTotp: {
    cTitle: 'Zwei-Faktor-Authentifizierung',
    cDescription: 'Die Authentifizierungs-App dieses Kontos entfernen.',
    enabled: 'Für dieses Konto ist eine Authentifizierungs-App eingerichtet.',
    disabled: 'Für dieses Konto ist keine Authentifizierungs-App eingerichtet.',
    unknown: 'Der Status der Authentifizierungs-App konnte nicht gelesen werden.',
    expired: 'Nicht kürzlich bestätigt',
    actions: {
      revoke: 'Entfernen',
    },
    confirm: {
      cTitle: 'Authentifizierungs-App entfernen?',
      cDescription: '{{name}} meldet sich ohne zweiten Faktor an, bis eine neue App eingerichtet ist. Tu das, wenn jemand Gerät und Wiederherstellungscodes verloren hat.',
    },
    alerts: {
      revoked: 'Die Authentifizierungs-App von {{name}} wurde entfernt',
    },
    errors: {
      revoke: 'Die Authentifizierungs-App konnte nicht entfernt werden.',
    },
  },
};
