export default {
  mTitle: 'Mot de passe',
  cTitle: 'Mot de passe',
  cDesc: 'Changez le mot de passe que vous utilisez pour vous connecter.',
  description: 'Votre nouveau mot de passe doit compter au moins {{count}} caractères. Choisissez une phrase de passe que vous n’utilisez nulle part ailleurs.',
  fields: {
    new: 'Nouveau mot de passe',
  },
  toggle: {
    show: 'Afficher le mot de passe',
    hide: 'Masquer le mot de passe',
  },
  submit: 'Mettre à jour le mot de passe',
  update: 'Mettre à jour',
  submitting: 'Mise à jour…',
  success: 'Votre mot de passe a été mis à jour. Un email de confirmation a été envoyé.',
  // The bare key for one and `key_other` for more, as in ../en-CA.
  successSessions: 'Votre mot de passe a été mis à jour et {{count}} autre session a été déconnectée. Un email de confirmation a été envoyé.',
  successSessions_other: 'Votre mot de passe a été mis à jour et {{count}} autres sessions ont été déconnectées. Un email de confirmation a été envoyé.',
  errors: {
    newRequired: 'Saisissez un nouveau mot de passe.',
    newTooShort: 'Le nouveau mot de passe doit compter au moins {{count}} caractères.',
    newTooLong: 'Le nouveau mot de passe ne doit pas dépasser {{count}} caractères.',
    reused: 'Votre nouveau mot de passe doit être différent de l’actuel.',
    generic: 'Impossible de mettre à jour votre mot de passe. Réessayez.',
    // No duration named: see ../en-CA/password.js.
    tooMany: 'Trop de tentatives. Patientez quelques minutes, puis réessayez.',
  },
};
