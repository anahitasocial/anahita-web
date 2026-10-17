export default {
  mTitle: 'Contraseña',
  cTitle: 'Contraseña',
  cDesc: 'Cambia la contraseña que usas para iniciar sesión.',
  description: 'Tu nueva contraseña debe tener al menos {{count}} caracteres. Usa una frase de contraseña única que no uses en otro lugar.',
  fields: {
    new: 'Nueva contraseña',
  },
  toggle: {
    show: 'Mostrar contraseña',
    hide: 'Ocultar contraseña',
  },
  submit: 'Actualizar contraseña',
  update: 'Actualizar',
  submitting: 'Actualizando…',
  success: 'Tu contraseña se actualizó. Te enviamos un correo de confirmación.',
  // Plural keys are the bare key for one and `key_other` for more, which
  // is what i18next 26 looks up. `key_plural`, which older versions read,
  // is never looked up: a phrase written that way shows its singular for
  // every count.
  successSessions: 'Tu contraseña se actualizó y se cerró {{count}} sesión más. Te enviamos un correo de confirmación.',
  successSessions_other: 'Tu contraseña se actualizó y se cerraron {{count}} sesiones más. Te enviamos un correo de confirmación.',
  errors: {
    newRequired: 'Escribe una nueva contraseña.',
    newTooShort: 'La nueva contraseña debe tener al menos {{count}} caracteres.',
    newTooLong: 'La nueva contraseña no puede tener más de {{count}} caracteres.',
    reused: 'Tu nueva contraseña debe ser distinta de la actual.',
    generic: 'No se pudo actualizar tu contraseña. Inténtalo de nuevo.',
    // No duration named. The server's window is 15 minutes today
    // (rateLimitScopePasswordEdit), but a number repeated here goes
    // stale silently the moment that constant is tuned, and a promise
    // of "30 minutes" that is really 15 is worse than no promise.
    tooMany: 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
  },
};
