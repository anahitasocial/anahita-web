export default {
  cTitle: 'Administration',
  cDescription: 'Meldungen, Registrierungsanfragen und Einladungen, um die sich Administrator:innen kümmern.',
  mTitle: 'Administration',
  tabWithCount: '{{title}} ({{count}})',
  waiting_one: '{{count}} Eintrag wartet',
  waiting_other: '{{count}} Einträge warten',
  restricted: {
    cTitle: 'Die Administration ist eingeschränkt',
    cDescription: 'Nur für Administrator:innen.',
  },
  scheduled: {
    title: 'Geplante Löschungen',
    description: 'Alle Profile, die gelöscht werden, die nächsten zuerst. Jedes lässt sich in seinen Einstellungen wiederherstellen oder endgültig löschen, solange noch Tage bleiben.',
    empty: 'Keine Löschung geplant.',
    settings: 'Einstellungen',
    loadError: 'Die geplanten Löschungen konnten nicht geladen werden.',
    kinds: {
      person: 'Person',
      group: 'Gruppe',
      event: 'Veranstaltung',
      website: 'Website',
    },
  },
};
