export default {
  about: 'À propos',
  name: 'Nom',
  alias: 'Alias',
  website: 'Site web',
  body: 'Description',
  unknown: 'Inconnu',
  delete: {
    prompts: {
      challenge: 'Tapez {{ alias }} pour confirmer',
      inProgress: 'Suppression en cours ...',
    },
    errors: {
      generic: 'Impossible de supprimer ce profil. Veuillez réessayer.',
      forbidden: 'Vous n\'avez pas la permission de supprimer ce profil.',
      lastSuperAdmin: 'Il s\'agit du seul super administrateur. Promouvez quelqu\'un d\'autre, ou changez ce compte en administrateur, avant de le supprimer.',
    },
  },
  access: {
    title: 'Accès',
    cDescription: 'Qui peut voir ce profil.',
    descriptions: {
      public: 'Tout le monde, connecté ou non.',
      registered: 'Toute personne ayant un compte ici.',
      followers: 'Les personnes abonnées à ce profil.',
      leaders: 'Les personnes suivies par ce profil.',
      mutuals: 'Les personnes abonnées à ce profil et suivies en retour.',
      admins: 'Les administrateurs de ce groupe.',
      myself: 'Personne d’autre.',
    },
    labels: {
      whoCanSee: 'Qui peut voir ce profil ?',
      othersCanRequestToFollow: "Les autres peuvent demander à s'abonner",
      whoCanAddFollowers: 'Qui peut ajouter des abonnés ?',
    },
    alerts: {
      success: "L'accès a été mis à jour",
      error: "L'accès n'a pas pu être mis à jour.",
    },
  },
  permissions: {
    title: 'Autorisations',
    cDescription: "Qui peut publier, commenter et aimer ici. Tant qu'elles ne sont pas enregistrées, les réglages par défaut du site s'appliquent.",
    empty: "Il n'y a aucune autorisation à régler ici.",
    restoreDefaults: 'Rétablir les valeurs par défaut',
    choices: {
      person: {
        registered: 'Toute personne connectée',
        followers: 'Abonnés',
        leaders: 'Abonnements',
        mutuals: 'Relations mutuelles',
        admins: 'Moi uniquement',
      },
      group: {
        registered: 'Toute personne connectée',
        followers: 'Abonnés',
        admins: 'Administrateurs',
      },
    },
    descriptions: {
      person: {
        registered: 'Toute personne ayant un compte ici.',
        followers: 'Les personnes qui vous suivent.',
        leaders: 'Les personnes que vous suivez.',
        mutuals: 'Les personnes qui vous suivent et que vous suivez en retour.',
        admins: 'Personne d’autre.',
      },
      group: {
        registered: 'Toute personne ayant un compte ici.',
        followers: 'Les personnes abonnées à ce groupe.',
        admins: 'Les administrateurs de ce groupe.',
      },
    },
    commentLocked: {
      followers: 'Abonnés — ce profil n’est visible que par ses abonnés.',
      readers: 'Toute personne pouvant voir ce profil, selon le réglage Accès.',
    },
  },
};
