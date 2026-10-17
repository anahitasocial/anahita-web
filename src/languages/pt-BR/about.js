// The public About page. Not a setting — see containers/about.
export default {
  cTitle: 'Sobre',
  mTitle: 'Sobre',
  cDescription: 'O que este site está executando.',
  unavailable: 'Este site não retornou seu documento NodeInfo.',
  readOnly: 'Informado pelo servidor. Altere estes valores na configuração do servidor.',
  // Two headings and one set of bare field labels, so a row says
  // "Repository" rather than "Server repository" under a heading
  // that already said Server.
  server: {
    mTitle: 'Servidor',
  },
  client: {
    mTitle: 'Cliente',
  },
  fields: {
    name: 'Nome',
    version: 'Versão',
    license: 'Licença',
    repository: 'Repositório',
  },
  usage: {
    mTitle: 'Uso',
    people: 'Pessoas',
    activeMonth: 'Ativas neste mês',
    activeHalfyear: 'Ativas em seis meses',
    localPosts: 'Publicações',
  },
  registration: {
    mTitle: 'Cadastro',
    mode: 'Modo',
    open: 'Aberto',
    closed: 'Fechado',
    approvalRequired: 'Requer aprovação',
    invitationsAccepted: 'Aceita convites',
  },
  contact: {
    mTitle: 'Contato e informações legais',
    supportEmail: 'E-mail de suporte',
    supportPhone: 'Telefone de suporte',
    termsOfService: 'Termos de uso',
    privacyPolicy: 'Política de privacidade',
  },
};
