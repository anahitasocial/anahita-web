export default {
  cTitle: 'Pedidos de cadastro',
  mTitle: 'Pedidos de cadastro',
  empty: 'Ninguém está esperando.',
  restricted: {
    cTitle: 'Os pedidos de cadastro são restritos',
    cDescription: 'Só para a administração.',
  },
  usernameTakenHint: 'Este nome de usuário foi ocupado desde então, por isso o pedido não pode ser aprovado.',
  invited: 'Com convite',
  fields: {
    note: 'Nota',
  },
  actions: {
    approve: 'Aprovar',
    reject: 'Recusar',
  },
  form: {
    noteHint: 'Opcional. Fica nos seus registros e não é mostrada à pessoa.',
  },
  confirmApprove: {
    cTitle: 'Aprovar este pedido?',
    cDescription: 'Cria uma conta para {{username}} e envia um e-mail para {{email}}.',
  },
  confirmReject: {
    cTitle: 'Recusar este pedido?',
    cDescription: 'Recusa {{username}} e envia um e-mail avisando a pessoa.',
  },
  alerts: {
    approved: 'Pedido de {{username}} aprovado',
    rejected: 'Pedido de {{username}} recusado',
  },
  errors: {
    browse: 'Não foi possível carregar os pedidos.',
    approve: 'Não foi possível aprovar o pedido.',
    reject: 'Não foi possível recusar o pedido.',
    // Says what to do instead, because retrying cannot work.
    usernameTaken: 'Esse nome de usuário foi ocupado enquanto o pedido esperava. Recuse o pedido e peça outro nome.',
    alreadyDecided: 'Outra pessoa da administração já respondeu a este pedido.',
    notVerified: 'A pessoa ainda não confirmou o endereço de e-mail.',
  },
};
