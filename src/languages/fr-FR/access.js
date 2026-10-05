export default {
  public: 'Public',
  registered: 'Membres inscrits',
  followers: 'Abonnés',
  leaders: 'Abonnements',
  mutuals: 'Relations mutuelles',
  admins: 'Administrateurs',
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
      admins: 'Administrateurs',
      myself: 'Moi uniquement',
    },
    descriptions: {
      public: 'Tout le monde, connecté ou non',
      registered: 'Toute personne connectée',
      own: {
        followers: 'Les personnes qui vous suivent',
        leaders: 'Les personnes que vous suivez',
        mutuals: 'Les personnes que vous suivez et qui vous suivent',
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
        admins: 'Les administrateurs de {{ name }}',
      },
    },
    capped: 'Indisponible ici : {{ name }} n’est pas visible aussi largement, donc une publication ne peut pas l’être non plus.',
  },
};
