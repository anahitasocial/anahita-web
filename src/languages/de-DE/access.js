export default {
  public: 'Öffentlich',
  registered: 'Angemeldete Mitglieder',
  followers: 'Follower',
  leaders: 'Gefolgt',
  mutuals: 'Gegenseitig',
  admins: 'Administrator:innen',
  myself: 'Nur ich',
  // Choosing who can see a post while writing it. Its own wording, not
  // the bare level names above: here each one has to say whose followers
  // and whose administrators are meant.
  audience: {
    label: 'Wer das sehen kann: {{ name }}',
    names: {
      public: 'Öffentlich',
      registered: 'Angemeldete Personen',
      followers: 'Follower',
      leaders: 'Gefolgt',
      mutuals: 'Gegenseitig',
      admins: 'Administrator:innen',
      myself: 'Nur ich',
    },
    descriptions: {
      public: 'Alle, angemeldet oder nicht',
      registered: 'Alle, die angemeldet sind',
      own: {
        followers: 'Personen, die dir folgen',
        leaders: 'Personen, denen du folgst',
        mutuals: 'Personen, denen du folgst und die dir zurückfolgen',
        myself: 'Sonst niemand',
      },
      person: {
        followers: 'Personen, die {{ name }} folgen',
        leaders: 'Personen, denen {{ name }} folgt',
        mutuals: 'Personen, denen {{ name }} folgt und die zurückfolgen',
        myself: 'Nur {{ name }}',
      },
      group: {
        followers: 'Personen, die {{ name }} folgen',
        admins: 'Die Administrator:innen von {{ name }}',
      },
    },
    capped: 'Hier nicht verfügbar: {{ name }} ist nicht so weit sichtbar, also kann es ein Beitrag darin auch nicht sein.',
  },
};
