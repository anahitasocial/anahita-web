export default {
  mTitle: 'Senha',
  cTitle: 'Senha',
  cDesc: 'Altere a senha que você usa para entrar.',
  description: 'Sua nova senha precisa ter pelo menos {{count}} caracteres. Use uma frase secreta única, que você não use em nenhum outro lugar.',
  fields: {
    new: 'Nova senha',
  },
  toggle: {
    show: 'Mostrar senha',
    hide: 'Ocultar senha',
  },
  submit: 'Atualizar senha',
  update: 'Atualizar',
  submitting: 'Atualizando…',
  success: 'Sua senha foi atualizada. Enviamos um e-mail de confirmação.',
  // The bare key for one and `key_other` for more, as in ../en-CA.
  successSessions: 'Sua senha foi atualizada e {{count}} outra sessão foi encerrada. Enviamos um e-mail de confirmação.',
  successSessions_other: 'Sua senha foi atualizada e {{count}} outras sessões foram encerradas. Enviamos um e-mail de confirmação.',
  errors: {
    newRequired: 'Digite uma nova senha.',
    newTooShort: 'A nova senha precisa ter pelo menos {{count}} caracteres.',
    newTooLong: 'A nova senha pode ter no máximo {{count}} caracteres.',
    reused: 'Sua nova senha precisa ser diferente da senha atual.',
    generic: 'Não foi possível atualizar sua senha. Tente de novo.',
    // No duration named: see ../en-CA/password.js.
    tooMany: 'Tentativas demais. Aguarde alguns minutos e tente de novo.',
  },
};
