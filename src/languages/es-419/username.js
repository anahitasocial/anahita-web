export default {
  mTitle: 'Nombre de usuario',
  cTitle: 'Nombre de usuario',
  title: 'Nombre de usuario',
  description: 'Tu nombre de usuario sirve para iniciar sesión y forma la dirección de tu perfil. Si lo cambias, el anterior queda libre y los enlaces a la dirección anterior de tu perfil dejarán de funcionar.',
  changed: 'Tu nombre de usuario ahora es {{username}}. Te enviamos un correo de confirmación.',
  change: 'Cambiar nombre de usuario',
  fields: {
    current: 'Nombre de usuario actual',
    new: 'Nuevo nombre de usuario',
  },
  helper: 'Solo letras, números, guiones y guiones bajos.',
  submit: 'Cambiar nombre de usuario',
  submitting: 'Cambiando…',
  errors: {
    required: 'Escribe un nuevo nombre de usuario.',
    tooShort: 'El nombre de usuario debe tener al menos {{count}} caracteres.',
    tooLong: 'El nombre de usuario no puede tener más de {{count}} caracteres.',
    invalid: 'Usa solo letras, números, guiones y guiones bajos.',
    sameAsCurrent: 'Ese ya es tu nombre de usuario.',
    taken: 'Ese nombre de usuario ya está en uso.',
    generic: 'No se pudo cambiar tu nombre de usuario. Inténtalo de nuevo.',
  },
};
