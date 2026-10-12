export default {
  settings: {
    title: 'Fédivers',
    enable: 'Permettre aux personnes d’autres serveurs de me trouver et de me suivre',
    help: 'Les personnes sur Mastodon et les autres serveurs du fédivers peuvent alors vous trouver par votre identifiant et vous suivre, et vos notes publiques leur sont envoyées. Vous pouvez aussi suivre des personnes là-bas.',
    handle: 'Votre identifiant',
    warning: 'Ce qui est envoyé à un autre serveur ne peut pas être repris. Supprimer une note demande à ces serveurs de la supprimer aussi, et la plupart le font, mais aucun n’y est tenu.',
    saved: 'Enregistré.',
    notSaved: 'Cela n’a pas pu être enregistré. Veuillez réessayer.',
    unavailable: {
      site_private: 'Ce site réserve son contenu à ses membres : personne ici n’est sur le fédivers.',
      site_unreachable: 'Ce site n’a pas d’adresse que les autres serveurs peuvent joindre : personne ici n’est sur le fédivers.',
      profile_not_public: 'Seul un profil visible par tout le monde peut être sur le fédivers. Le vôtre ne l’est pas : vous pouvez le changer ci-dessus, sous « Accès ».',
    },
  },
  remote: {
    badge: 'De {{ domain }}',
    onAnotherServer: 'Cette personne est sur un autre serveur, {{ domain }}. Ce que vous voyez ici est ce que ce serveur partage avec tout le monde.',
    viewOriginal: 'Voir sur {{ domain }}',
    replyThere: 'Répondre sur {{ domain }}',
  },
  lookup: {
    title: 'Sur un autre serveur',
    prompt: 'Chercher {{ query }} sur son propre serveur',
    button: 'Chercher',
    looking: 'Demande à {{ domain }}…',
    errors: {
      lookup_unreadable: 'Ce n’est ni un identifiant ni l’adresse d’un profil.',
      lookup_is_here: 'C’est quelqu’un de ce site. Cherchez cette personne par son nom.',
      lookup_not_found: 'Personne n’a été trouvé sous ce nom.',
      lookup_not_a_person: 'Ce n’est pas quelqu’un que l’on peut suivre d’ici.',
      lookup_failed: 'Ce serveur n’a pas pu être joint, ou n’a pas répondu d’une façon que ce site comprend.',
      too_many_lookups: 'Cela fait beaucoup de recherches. Veuillez patienter quelques minutes.',
      site_private: 'Ce site réserve son contenu à ses membres et ne cherche personne sur d’autres serveurs.',
      site_unreachable: 'Ce site ne peut pas joindre d’autres serveurs.',
      failed: 'Cela n’a pas fonctionné. Veuillez réessayer.',
    },
  },
};
