export default {
  mTitle: 'Nome de usuário',
  cTitle: 'Nome de usuário',
  title: 'Nome de usuário',
  description: 'Seu nome de usuário serve para entrar e forma o endereço do seu perfil. Ao mudá-lo, o antigo fica livre, e os links para o endereço antigo do seu perfil deixam de funcionar.',
  changed: 'Seu nome de usuário agora é {{username}}. Enviamos um e-mail de confirmação.',
  change: 'Mudar nome de usuário',
  fields: {
    current: 'Nome de usuário atual',
    new: 'Novo nome de usuário',
  },
  helper: 'Só letras, números, hífens e sublinhados.',
  submit: 'Mudar nome de usuário',
  submitting: 'Mudando…',
  errors: {
    required: 'Digite um novo nome de usuário.',
    tooShort: 'O nome de usuário precisa ter pelo menos {{count}} caracteres.',
    tooLong: 'O nome de usuário pode ter no máximo {{count}} caracteres.',
    invalid: 'Use só letras, números, hífens e sublinhados.',
    sameAsCurrent: 'Esse já é o seu nome de usuário.',
    taken: 'Esse nome de usuário já está em uso.',
    generic: 'Não foi possível mudar seu nome de usuário. Tente de novo.',
  },
};
