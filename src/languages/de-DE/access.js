export default {
  public: 'Öffentlich',
  registered: 'Angemeldete Personen',
  followers: 'Follower',
  leaders: 'Gefolgt',
  mutuals: 'Gegenseitig',
  admins: 'Admins',
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
      admins: 'Admins',
      myself: 'Nur ich',
    },
    descriptions: {
      public: 'Alle, angemeldet oder nicht',
      registered: 'Alle, die angemeldet sind',
      own: {
        followers: 'Personen, die dir folgen',
        leaders: 'Personen, denen du folgst',
        mutuals: 'Ihr folgt einander',
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
        admins: 'Die Admins von {{ name }}',
      },
    },
    capped: 'Hier nicht verfügbar: {{ name }} ist nicht so weit sichtbar, also kann es ein Beitrag darin auch nicht sein.',
  },
  // The access dialog's reasons a level cannot be chosen (roadmap row 155).
  dialog: {
    notOnSite: 'Diese Website zeigt Neues nur angemeldeten Personen',
    notNarrower: 'Nicht enger als dieses Profil',
  },
};
