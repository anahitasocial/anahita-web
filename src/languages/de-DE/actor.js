export default {
  scheduledDeletion_one: 'Löschung geplant · noch {{count}} Tag',
  scheduledDeletion_other: 'Löschung geplant · noch {{count}} Tage',
  about: 'Über',
  name: 'Name',
  alias: 'Alias',
  website: 'Website',
  body: 'Beschreibung',
  unknown: 'Unbekannt',
  // A profile the viewer may not see, which lets people ask to follow it.
  limited: {
    private: 'Dieses Profil ist privat. Seine Follower können es sehen.',
    request: 'Anfrage zum Folgen',
    requested: 'Angefragt',
    withdraw: 'Anfrage zurückziehen',
    failed: 'Das hat nicht geklappt.',
  },
  featured: {
    feature: 'Hervorheben',
    unfeature: 'Nicht mehr hervorheben',
    errors: {
      generic: 'Konnte nicht ändern, ob dieses Profil hervorgehoben ist. Bitte versuch es noch einmal.',
      conflict: 'Ein deaktiviertes oder archiviertes Profil kann nicht hervorgehoben werden.',
    },
  },
  delete: {
    // The card said nothing about what deletion does, whether it is
    // reversible, or when it takes effect — it offered one text field and a
    // red button. These strings are the disclosure.
    prompts: {
      challenge: 'Gib {{ alias }} ein, um zu bestätigen',
      inProgress: 'Wird gelöscht ...',
    },
    errors: {
      generic: 'Dieses Profil konnte nicht gelöscht werden. Bitte versuch es noch einmal.',
      forbidden: 'Du darfst dieses Profil nicht löschen.',
      // Fallback only. The server sends a message naming the way out, and
      // it is more specific than this can be.
      lastSuperAdmin: 'Dies ist die einzige Person mit Super-Administrator-Rechten. Befördere zuerst jemand anderen oder mach dieses Konto zu Administrator:in, bevor du es löschst.',
    },
  },
  access: {
    title: 'Zugriff',
    cDescription: 'Wer dieses Profil sehen kann.',
    // One sentence per level, because the label alone does not say who
    // it means — "Mutuals" and "Following" are the site's words, not
    // everybody's.
    descriptions: {
      public: 'Alle, angemeldet oder nicht.',
      registered: 'Alle mit einem Konto hier.',
      followers: 'Leute, die diesem Profil folgen.',
      leaders: 'Leute, denen dieses Profil folgt.',
      mutuals: 'Leute, die diesem Profil folgen und denen es zurückfolgt.',
      admins: 'Administrator:innen dieser Gruppe.',
      myself: 'Sonst niemand.',
    },
    labels: {
      whoCanSee: 'Wer kann dieses Profil sehen?',
      othersCanRequestToFollow: 'Andere können anfragen, ob sie folgen dürfen',
      whoCanAddFollowers: 'Wer kann Follower hinzufügen?',
    },
    alerts: {
      success: 'Zugriff wurde aktualisiert',
      error: 'Zugriff konnte nicht aktualisiert werden.',
    },
  },
  permissions: {
    title: 'Berechtigungen',
    cDescription: 'Wer hier veröffentlichen, antworten und „Gefällt mir“ geben kann. Bis diese gespeichert sind, gelten die Standardwerte der Website.',
    empty: 'Hier gibt es keine Berechtigungen einzustellen.',
    restoreDefaults: 'Standardwerte wiederherstellen',
    // Per actor type, because "Admins" of a person is that person.
    choices: {
      person: {
        registered: 'Alle Angemeldeten',
        followers: 'Follower',
        leaders: 'Gefolgt',
        mutuals: 'Gegenseitig',
        admins: 'Nur ich',
      },
      group: {
        registered: 'Alle Angemeldeten',
        followers: 'Follower',
        admins: 'Admins',
      },
    },
    // Shown under each choice in the open list — "Following" and "Mutuals"
    // are the site's words, not everybody's.
    descriptions: {
      person: {
        registered: 'Alle mit einem Konto hier.',
        followers: 'Leute, die dir folgen.',
        leaders: 'Leute, denen du folgst.',
        mutuals: 'Leute, die dir folgen und denen du zurückfolgst.',
        admins: 'Sonst niemand.',
      },
      group: {
        registered: 'Alle mit einem Konto hier.',
        followers: 'Leute, die dieser Gruppe folgen.',
        admins: 'Administrator:innen dieser Gruppe.',
      },
    },
    // Replies on a profile narrower than registered follow its access.
    commentLocked: {
      followers: 'Follower — dieses Profil ist nur für Follower sichtbar.',
      readers: 'Alle, die dieses Profil sehen können, wie unter Zugriff eingestellt.',
    },
  },
  tabs: 'Profil-Tabs',
  addAdmins: 'Admins hinzufügen',
};
