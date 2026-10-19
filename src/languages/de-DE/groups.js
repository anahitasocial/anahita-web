export default {
  cTitle: 'Gruppen',
  mTitle: 'Gruppen',
  add: {
    cTitle: 'Gruppe erstellen',
    mTitle: 'Gruppe erstellen',
  },
  settings: {
    info: 'Info',
    admins: 'Admins',
    features: 'Funktionen',
    permissions: 'Berechtigungen',
    rules: 'Regeln',
    access: 'Privatsphäre',
    // Deletion copy, namespace-specific. The shared actor:delete strings told
    // group administrators to "sign in to restore", which a group cannot do,
    // and that their passkeys would be removed, which a group has none of.
    delete: 'Löschen',
    // The card title. Its text is in the accounts namespace, shared with
    // the accounts list.
    purge: 'Endgültig löschen',
    // Archive. The copy does the work here: archive sits next to delete and
    // must never read as the gentler option. Permanence first, then what is
    // preserved — which is the reason to choose it, not a softener.
    archive: 'Archivieren',
    archivePrompts: {
      permanent: 'Archivieren lässt sich nicht rückgängig machen. Diese Gruppe kann nicht zurückgeholt werden.',
      groupDescription: 'Nichts wird gelöscht. Jeder Beitrag, jedes Foto und jede Diskussion bleibt genau dort, wo es ist, und behält seine Adresse, sodass gespeicherte Links weiter funktionieren. Was aufhört, ist die Aktivität der Gruppe: Sie verschwindet aus Feeds, Vorschlägen und der Suche, und niemand kann dort mehr etwas veröffentlichen.',
      confirmLabel: 'Gib {{ alias }} ein, um zu bestätigen',
      action: 'Endgültig archivieren',
      archived: 'Diese Gruppe wurde archiviert.',
      errors: {
        nothingToArchive: 'Nichts zu archivieren — diese Gruppe ist schon archiviert oder zum Löschen vorgemerkt.',
        forbidden: 'Du darfst diese Gruppe nicht archivieren.',
        lastSuperAdmin: 'Dies ist die einzige Person mit Super-Administrator-Rechten. Befördere zuerst jemand anderen, bevor du diese Gruppe archivierst.',
        generic: 'Diese Gruppe konnte nicht archiviert werden. Bitte versuch es noch einmal.',
      },
    },
    // Disable. Deliberately light — it is a switch, and dressing it up like
    // the two below trains people to type confirmations without reading.
    disable: 'Deaktivieren',
    disablePrompts: {
      description: 'Deaktivieren verbirgt diese Gruppe vor allen. Solange sie deaktiviert ist, können ihre Follower dort nichts veröffentlichen und sie nicht finden.',
      descriptionDisabled: 'Diese Gruppe ist deaktiviert. Sie erscheint nirgends, und niemand kann dort etwas veröffentlichen.',
      reversible: 'Das lässt sich jederzeit rückgängig machen, und nichts wird gelöscht. Um ein Profil endgültig zu entfernen, archiviere oder lösche es stattdessen.',
      action: 'Deaktivieren',
      actionEnable: 'Aktivieren',
      disabled: 'Diese Gruppe wurde deaktiviert.',
      enabled: 'Diese Gruppe wurde aktiviert.',
      errors: {
        forbidden: 'Du darfst das nicht ändern.',
        lastSuperAdmin: 'Dies ist die einzige Person mit Super-Administrator-Rechten und kann nicht deaktiviert werden.',
        generic: 'Das konnte nicht geändert werden. Bitte versuch es noch einmal.',
      },
    },
    deletePrompts: {
      counts: {
        intro: 'Gerade in dieser Gruppe:',
        posts: '{{ count }} Beitrag',
        posts_other: '{{ count }} Beiträge',
        replies: '{{ count }} Antwort',
        replies_other: '{{ count }} Antworten',
        followers: '{{ count }} Follower',
        followers_other: '{{ count }} Follower',
        admins: '{{ count }} Administrator:in',
        admins_other: '{{ count }} Administrator:innen',
        memberSince: 'Erstellt am {{ date }}.',
      },
      description: 'Löschen entfernt diese Gruppe und alles darin: Beiträge, Fotos, Antworten und die Liste der Follower. Was ihre Follower beigetragen haben, verschwindet mit.',
      reversible: 'Das passiert nicht sofort. Die Gruppe wird sofort verborgen und nach {{ count }} Tagen endgültig gelöscht. Bis dahin können alle Administrator:innen sie auf dieser Seite wiederherstellen.',
      revoked: 'Follower verlieren sofort den Zugriff, und die Gruppe verschwindet aus ihren Profilen und Feeds.',
      handle: 'Der Name {{ alias }} bleibt danach reserviert, sodass keine andere Gruppe ihn nehmen kann.',
      scheduled: 'Diese Gruppe ist zum Löschen vorgemerkt und wird am {{ date }} gelöscht.',
      restore: 'Diese Gruppe wiederherstellen',
      restored: 'Diese Gruppe wurde wiederhergestellt.',
      errors: {
        restoreFailed: 'Diese Gruppe konnte nicht wiederhergestellt werden. Vielleicht wurde sie schon endgültig gelöscht.',
      },
    },
    // Labels the tab; the card inside it still reads "Delete".
    sections: {
      danger: 'Gefahrenbereich',
    },
    followRequests: 'Folgeanfragen',
  },
  confirm: {
    delete: 'Willst du das Profil von {{ name }} löschen?',
  },
};
