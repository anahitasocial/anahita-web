export default {
  cTitle: 'Solicitudes de registro',
  mTitle: 'Solicitudes de registro',
  empty: 'Nadie está esperando.',
  restricted: {
    cTitle: 'Las solicitudes de registro están restringidas',
    cDescription: 'Solo para admins.',
  },
  usernameTakenHint: 'Este nombre de usuario ya fue ocupado, así que la solicitud no se puede aprobar.',
  invited: 'Con invitación',
  fields: {
    note: 'Nota',
  },
  actions: {
    approve: 'Aprobar',
    reject: 'Rechazar',
  },
  form: {
    noteHint: 'Opcional. Queda en tus registros; no se le muestra a la persona.',
  },
  confirmApprove: {
    cTitle: '¿Aprobar esta solicitud?',
    cDescription: 'Crea una cuenta para {{username}} y envía un correo a {{email}}.',
  },
  confirmReject: {
    cTitle: '¿Rechazar esta solicitud?',
    cDescription: 'Rechaza a {{username}} y le envía un correo.',
  },
  alerts: {
    approved: 'Se aprobó a {{username}}',
    rejected: 'Se rechazó a {{username}}',
  },
  errors: {
    browse: 'No se pudieron cargar las solicitudes.',
    approve: 'No se pudo aprobar la solicitud.',
    reject: 'No se pudo rechazar la solicitud.',
    // Says what to do instead, because retrying cannot work.
    usernameTaken: 'Alguien ocupó ese nombre de usuario mientras la solicitud esperaba. Recházala y pide otro.',
    alreadyDecided: 'Otra persona de la administración ya respondió esta solicitud.',
    notVerified: 'Todavía no confirmó su dirección de correo electrónico.',
  },
};
