export default {
  cTitle: 'Convites',
  mTitle: 'Convites',
  empty: 'Nenhum convite enviado.',
  // How many more may wait at once; the count goes down as they send.
  remaining_one: 'Você pode enviar mais {{count}} convite.',
  remaining_other: 'Você pode enviar mais {{count}} convites.',
  atLimit_one: 'Você tem {{count}} convite pendente, o máximo permitido. Uma vaga se libera quando um convite é aceito, expira ou é revogado por você.',
  atLimit_other: 'Você tem {{count}} convites pendentes, o máximo permitido. Uma vaga se libera quando um convite é aceito, expira ou é revogado por você.',
  restricted: {
    cTitle: 'Os convites são restritos',
    cDescription: 'Só para a administração.',
  },
  fields: {
    recipientEmail: 'E-mail',
  },
  status: {
    pending: 'Pendente',
    used: 'Aceito',
    expired: 'Expirado',
  },
  actions: {
    add: 'Adicionar',
    send: 'Enviar',
    revoke: 'Revogar',
    // The icon button carries no text, so the accessible name has to
    // say which invite it revokes — there is one per row.
    revokeFor: 'Revogar o convite para {{email}}',
  },
  form: {
    cTitle: 'Convidar alguém',
    cDescription: 'A pessoa recebe um e-mail com um link para entrar.',
  },
  confirmRevoke: {
    cTitle: 'Revogar este convite?',
    // Kept, because it sends mail to somebody who is not expecting it.
    cDescription: 'O link enviado para {{email}} deixa de funcionar, e a pessoa é avisada de que o convite foi retirado.',
  },
  alerts: {
    sent: 'Um convite foi enviado para {{email}}',
    revoked: 'O convite para {{email}} foi revogado',
  },
  errors: {
    browse: 'Não foi possível carregar os convites.',
    add: 'Não foi possível enviar o convite.',
    delete: 'Não foi possível revogar o convite.',
    // Only a fallback: the server sends its own message here, which
    // names the number outstanding and how a slot frees.
    conflict: 'Esse endereço já tem uma conta, ou você tem convites pendentes demais.',
    forbidden: 'Este site não está enviando convites.',
    rateLimited: 'Convites demais nos últimos tempos. Tente de novo mais tarde.',
  },
};
