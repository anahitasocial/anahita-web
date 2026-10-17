export default {
  cTitle: 'Invitaciones',
  mTitle: 'Invitaciones',
  empty: 'No has enviado invitaciones.',
  // How many more may wait at once; the count goes down as they send.
  remaining_one: 'Puedes enviar {{count}} invitación más.',
  remaining_other: 'Puedes enviar {{count}} invitaciones más.',
  atLimit_one: 'Tienes {{count}} invitación pendiente, el máximo posible. Se libera un lugar cuando una invitación se acepta, vence o la revocas.',
  atLimit_other: 'Tienes {{count}} invitaciones pendientes, el máximo posible. Se libera un lugar cuando una invitación se acepta, vence o la revocas.',
  restricted: {
    cTitle: 'Las invitaciones están restringidas',
    cDescription: 'Solo para admins.',
  },
  fields: {
    recipientEmail: 'Correo electrónico',
  },
  status: {
    pending: 'Pendiente',
    used: 'Aceptada',
    expired: 'Vencida',
  },
  actions: {
    add: 'Agregar',
    send: 'Enviar',
    revoke: 'Revocar',
    // The icon button carries no text, so the accessible name has to
    // say which invite it revokes — there is one per row.
    revokeFor: 'Revocar la invitación a {{email}}',
  },
  form: {
    cTitle: 'Invitar a alguien',
    cDescription: 'Recibirá un correo con un enlace para unirse.',
  },
  confirmRevoke: {
    cTitle: '¿Revocar esta invitación?',
    // Kept, because it sends mail to somebody who is not expecting it.
    cDescription: 'El enlace enviado a {{email}} deja de funcionar y se le avisa que fue retirado.',
  },
  alerts: {
    sent: 'Se envió una invitación a {{email}}',
    revoked: 'Se revocó la invitación a {{email}}',
  },
  errors: {
    browse: 'No se pudieron cargar las invitaciones.',
    add: 'No se pudo enviar la invitación.',
    delete: 'No se pudo revocar la invitación.',
    // Only a fallback: the server sends its own message here, which
    // names the number outstanding and how a slot frees.
    conflict: 'Esa dirección ya tiene una cuenta, o tienes demasiadas invitaciones pendientes.',
    forbidden: 'Este sitio no está enviando invitaciones.',
    rateLimited: 'Demasiadas invitaciones en poco tiempo. Inténtalo más tarde.',
  },
};
