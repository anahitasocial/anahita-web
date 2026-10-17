export default {
  mTitle: 'Nom d’utilisateur',
  cTitle: 'Nom d’utilisateur',
  title: 'Nom d’utilisateur',
  description: 'Votre nom d’utilisateur sert à vous connecter et forme l’adresse de votre profil. En le changeant, vous libérez l’ancien, et les liens vers l’ancienne adresse de votre profil cesseront de fonctionner.',
  changed: 'Votre nom d’utilisateur est désormais {{username}}. Un email de confirmation a été envoyé.',
  change: 'Changer de nom d’utilisateur',
  fields: {
    current: 'Nom d’utilisateur actuel',
    new: 'Nouveau nom d’utilisateur',
  },
  helper: 'Lettres, chiffres, traits d’union et tirets bas uniquement.',
  submit: 'Changer de nom d’utilisateur',
  submitting: 'Modification…',
  errors: {
    required: 'Saisissez un nouveau nom d’utilisateur.',
    tooShort: 'Le nom d’utilisateur doit compter au moins {{count}} caractères.',
    tooLong: 'Le nom d’utilisateur ne doit pas dépasser {{count}} caractères.',
    invalid: 'Utilisez uniquement des lettres, des chiffres, des traits d’union et des tirets bas.',
    sameAsCurrent: 'C’est déjà votre nom d’utilisateur.',
    taken: 'Ce nom d’utilisateur est déjà pris.',
    generic: 'Impossible de changer votre nom d’utilisateur. Réessayez.',
  },
};
