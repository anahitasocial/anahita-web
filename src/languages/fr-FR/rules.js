export default {
  editor: {
    intro: 'Chacun coche chaque règle avant de suivre ou de répondre. Si vous les modifiez, tous ceux qui les ont acceptées devront les accepter de nouveau.',
    title: 'Règle',
    body: 'Une ligne de plus (facultatif)',
    up: 'Monter',
    down: 'Descendre',
    remove: 'Retirer',
    add: 'Ajouter une règle',
    full: '{{max}} règles au maximum',
    suggestions: 'Suggestions',
    siteRules: "Les règles du site s'appliquent aussi ici.",
    siteRulesLink: 'Les lire',
  },
  // Before joining a group or an event with rules.
  join: {
    title: 'Les règles de {{name}}',
    intro: "Cochez chacune pour l'accepter avant de rejoindre.",
    introChanged: 'Les règles ont changé depuis votre accord. Cochez chacune de nouveau.',
    introPost: "Cochez chacune pour l'accepter avant de publier.",
    agree: "J'accepte",
  },
  prompts: {
    notAgreed: "Votre accord n'a pas pu être enregistré. Veuillez réessayer.",
    saved: 'Règles enregistrées. Tous ceux qui les avaient acceptées devront les accepter de nouveau.',
    notSaved: "Les règles n'ont pas pu être enregistrées.",
  },
  about: {
    title: 'Règles',
  },
  // A group's or an event's reports against its rules (part 6b).
  reports: {
    intro: "Les signalements contre vos règles, les plus récents d'abord. Leurs auteurs ne sont jamais affichés. Agissez sur une publication depuis sa propre page : la supprimer clôt son signalement. Les administrateurs du site voient aussi chaque signalement.",
    none: "Rien n'a été signalé contre vos règles.",
    loadError: 'Impossible de charger les signalements. Veuillez réessayer.',
    broke: 'Enfreint « {{rule}} »',
    view: 'Voir',
    gone: "Ceci n'existe plus.",
  },
};
