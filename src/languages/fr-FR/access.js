export default {
  public: 'Public',
  registered: 'Personnes connectées',
  followers: 'Abonnés',
  leaders: 'Abonnements',
  mutuals: 'Relations mutuelles',
  admins: 'Admins',
  myself: 'Moi uniquement',
  // Choisir qui peut voir une publication au moment de l’écrire. Un
  // vocabulaire à part : ici chaque niveau doit dire de qui sont les
  // abonnés et les administrateurs.
  audience: {
    label: 'Qui peut voir ceci : {{ name }}',
    names: {
      public: 'Public',
      registered: 'Personnes connectées',
      followers: 'Abonnés',
      leaders: 'Abonnements',
      mutuals: 'Relations mutuelles',
      admins: 'Admins',
      myself: 'Moi uniquement',
    },
    descriptions: {
      public: 'Tout le monde, connecté ou non',
      registered: 'Toute personne connectée',
      own: {
        followers: 'Les personnes qui vous suivent',
        leaders: 'Les personnes que vous suivez',
        mutuals: 'Vous vous suivez mutuellement',
        myself: 'Personne d’autre',
      },
      person: {
        followers: 'Les personnes qui suivent {{ name }}',
        leaders: 'Les personnes que {{ name }} suit',
        mutuals: 'Les personnes que {{ name }} suit et qui suivent {{ name }}',
        myself: '{{ name }} uniquement',
      },
      group: {
        followers: 'Les personnes qui suivent {{ name }}',
        admins: 'Les admins de {{ name }}',
      },
    },
    capped: 'Indisponible ici : {{ name }} n’est pas visible aussi largement, donc une publication ne peut pas l’être non plus.',
  },
  // The access dialog's reasons a level cannot be chosen (roadmap row 155).
  dialog: {
    notOnSite: 'Ce site réserve ce qui est nouveau aux personnes connectées',
    notNarrower: 'Pas plus restreint que ce profil',
  },
  // Whether search engines may index a profile and its posts (anahita-services
  // roadmap row 174): `noindex` when not, which hides nothing.
  searchEngines: {
    title: 'Moteurs de recherche',
    label: 'Laisser les moteurs de recherche indexer ce profil',
    help: 'Les moteurs de recherche comme Google peuvent référencer ce profil et ses publications. Désactivé, on leur demande de ne pas le faire. Qui peut les voir reste tel que réglé plus haut.',
    saved: 'Enregistré',
    notSaved: 'Impossible d’enregistrer. Réessayez dans un instant.',
  },
};
