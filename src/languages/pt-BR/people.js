export default {
  cTitle: 'Pessoas',
  mTitle: 'Pessoas',
  // Under the title of the list of people: whose list it is.
  browse: {
    title: 'Pessoas',
    local: 'Pessoas locais em {{ site }}.',
    localUnnamed: 'Pessoas locais nesta instância.',
    elsewhere: {
      both: 'Para encontrar alguém no fediverso ou no Bluesky, busque pelo identificador da pessoa.',
      activitypub: 'Para encontrar alguém no fediverso, busque pelo identificador da pessoa.',
      atproto: 'Para encontrar alguém no Bluesky, busque pelo identificador da pessoa.',
    },
  },
  add: {
    cTitle: 'Adicionar pessoa',
    mTitle: 'Adicionar pessoa',
  },
  settings: {
    authLogs: 'Autenticações',
    webauthn: 'Chaves de acesso',
    totp: '2FA',
    info: 'Informações',
    features: 'Recursos',
    permissions: 'Permissões',
    access: 'Acesso',
    reposts: 'Reposts',
    quotes: 'Citações',
    // Deletion copy, namespace-specific — groups carry their own in groups.js,
    // because the sign-in and passkey lines here are meaningless for a group.
    delete: 'Excluir',
    // The card title. Its text is in the accounts namespace, shared with
    // the accounts list.
    purge: 'Excluir permanentemente',
    // Archive. The copy does the work here: archive sits next to delete and
    // must never read as the gentler option. Permanence first, then what is
    // preserved — which is the reason to choose it, not a softener.
    archive: 'Arquivar',
    archivePrompts: {
      permanent: 'Arquivar não pode ser desfeito. Não há como trazer este perfil de volta.',
      personDescription: 'Nada é excluído. Cada publicação, resposta e foto fica exatamente onde está e mantém o seu endereço, então os links que as pessoas salvaram continuam funcionando. O que acaba é a atividade da conta: ela sai dos feeds e das sugestões, e não é mais possível entrar nela.',
      selfSignIn: 'Depois disso, você não vai poder entrar de novo, nem ninguém mais — o endereço de e-mail e o nome de usuário continuam reservados para que ninguém possa usá-los.',
      confirmLabel: 'Digite {{ alias }} para confirmar',
      action: 'Arquivar permanentemente',
      archived: 'Este perfil foi arquivado.',
      errors: {
        nothingToArchive: 'Nada para arquivar — este perfil já está arquivado ou com exclusão agendada.',
        forbidden: 'Você não tem permissão para arquivar este perfil.',
        lastSuperAdmin: 'Esta é a única pessoa com superadministração. Promova outra pessoa antes de arquivar este perfil.',
        generic: 'Não foi possível arquivar este perfil. Tente de novo.',
      },
    },
    // Disable. Deliberately light — it is a switch, and dressing it up like
    // the two below trains people to type confirmations without reading.
    disable: 'Desativar',
    disablePrompts: {
      description: 'Desativar esconde este perfil e desconecta a pessoa. Ela não vai poder entrar enquanto ele estiver desativado.',
      descriptionDisabled: 'Este perfil está desativado. A pessoa não pode entrar, e ele não aparece em lugar nenhum.',
      reversible: 'Isso pode ser desfeito a qualquer momento, e nada é excluído. Para remover um perfil de vez, arquive ou exclua.',
      action: 'Desativar',
      actionEnable: 'Ativar',
      disabled: 'Este perfil foi desativado.',
      enabled: 'Este perfil foi ativado.',
      errors: {
        forbidden: 'Você não tem permissão para mudar isso.',
        lastSuperAdmin: 'Esta é a única pessoa com superadministração e não pode ser desativada.',
        generic: 'Não foi possível mudar isso. Tente de novo.',
      },
    },
    deletePrompts: {
      counts: {
        intro: 'Neste perfil, agora:',
        posts: '{{ count }} publicação',
        posts_other: '{{ count }} publicações',
        replies: '{{ count }} resposta',
        replies_other: '{{ count }} respostas',
        followers: '{{ count }} seguidor',
        followers_other: '{{ count }} seguidores',
        admins: '{{ count }} admin',
        admins_other: '{{ count }} admins',
        following: 'seguindo {{ count }} pessoa',
        following_other: 'seguindo {{ count }} pessoas',
        groupsAdministered: 'admin de {{ count }} grupo',
        groupsAdministered_other: 'admin de {{ count }} grupos',
        memberSince: 'Membro desde {{ date }}.',
      },
      description: 'Excluir remove este perfil e tudo o que há nele: publicações, respostas, fotos, seguidores e os grupos que ele segue. As respostas que outras pessoas deixaram nesse conteúdo vão junto.',
      reversible: 'Não é imediato. O perfil fica oculto na hora e é apagado de vez depois de {{ count }} dias. Quem entrar antes disso poderá restaurá-lo.',
      revoked: 'As sessões em todos os dispositivos terminam agora, e todas as chaves de acesso são removidas. Restaurar não as traz de volta.',
      handle: 'O identificador {{ alias }} continua reservado depois, para que ninguém mais possa usá-lo.',
      scheduled: 'Este perfil está com exclusão agendada. Entre antes de {{ date }} para restaurá-lo.',
    },
    notifications: 'Configurações de notificação',
    followRequests: 'Pedidos para seguir',
    password: 'Senha',
    email: 'E-mail',
    username: 'Nome de usuário',
    // Section labels for the grouped person settings page. The keys above
    // are still used as the per-card titles inside a section.
    sections: {
      account: 'Conta',
      security: 'Segurança',
      access: 'Privacidade',
      permissions: 'Permissões',
      fediverse: 'Fediverso',
      administration: 'Administração',
      danger: 'Zona de perigo',
    },
  },
  notifications: {
    cTitle: 'Notificações',
    cDescription: 'Edite as suas configurações de notificação',
    mTitle: 'Notificações',
    email: 'Receber notificações por e-mail',
    optionsTitle: 'Receber notificações de',
    options: {
      all: 'Todas as publicações',
      following: 'Só as publicações que você está seguindo',
    },
  },
  person: {
    displayName: 'Nome de exibição',
    username: 'Nome de usuário',
    email: 'E-mail',
    body: 'Bio',
    pronouns: 'Pronomes',
    pronounsUnset: 'Prefiro não dizer',
    postingLanguage: 'Idioma em que você publica',
    postingLanguageUnset: 'O idioma do meu navegador',
    postingLanguageHint: 'O editor começa neste idioma. Você pode mudá-lo em qualquer publicação.',
    // The set that makes sense in THIS language. Other locales ship their own;
    // a language with no gendered third-person pronoun ships an empty list and
    // the field offers only "prefer not to say".
    pronounOptions: [
      'ele/dele',
      'ela/dela',
      'elu/delu',
      'ele/elu',
      'ela/elu',
    ],
    usertype: 'Tipo de usuário',
    usertypeOptions: {
      guest: 'Visitante',
      registered: 'Cadastrado',
      administrator: 'Admin',
      'super-administrator': 'Superadmin',
    },
    joinedDate: 'Entrou em {{ date }}',
    lastVisitOn: 'Última visita em {{ date }}',
  },
  confirm: {
    delete: 'Você quer excluir o perfil de {{ name }}?',
  },
  account: {
    prompts: {
      error: 'Algo deu errado.',
      errorUsernameTaken: 'Este nome de usuário já está em uso.',
      errorEmailTaken: 'Este e-mail já está cadastrado no nosso sistema.',
    },
  },

  // The Administration section: an administrator looking at somebody
  // else's account. Never the viewer's own — see containers/actors/
  // Settings/sections.js.
  agreements: {
    cTitle: 'Termos aceitos',
    tos: 'Termos de serviço',
    privacy: 'Política de privacidade',
    acceptedOn: 'Aceitos em {{date}}',
    never: 'Nunca aceitos',
    version: 'v{{version}}',
    unavailable: 'Não foi possível carregar os termos.',
  },
  metadata: {
    cTitle: 'Conta',
    joined: 'Entrou em',
    lastSignIn: 'Última entrada',
    unknown: 'Desconhecido',
  },
  revokePasskeys: {
    cTitle: 'Chaves de acesso',
    cDescription: 'Remover todas as chaves de acesso desta conta.',
    count: 'Esta conta tem {{count}} chave(s) de acesso.',
    unknown: 'Não foi possível ler o número de chaves de acesso.',
    actions: {
      revoke: 'Revogar',
    },
    confirm: {
      cTitle: 'Revogar todas as chaves de acesso?',
      cDescription: '{{name}} não vai mais poder entrar com uma chave de acesso. A senha continua funcionando, e você vai precisar confirmar a sua identidade antes.',
    },
    alerts: {
      revoked: 'Todas as chaves de acesso de {{name}} foram revogadas',
    },
    errors: {
      revoke: 'Não foi possível revogar as chaves de acesso.',
    },
  },
  revokeTotp: {
    cTitle: 'Autenticação de dois fatores',
    cDescription: 'Remover o autenticador desta conta.',
    enabled: 'Há um autenticador configurado nesta conta.',
    disabled: 'Não há autenticador configurado nesta conta.',
    unknown: 'Não foi possível ler o status do autenticador.',
    expired: 'Não verificado recentemente',
    actions: {
      revoke: 'Remover',
    },
    confirm: {
      cTitle: 'Remover o autenticador?',
      cDescription: '{{name}} vai entrar sem um segundo fator até configurar um novo. Faça isso quando alguém perder o dispositivo e os códigos de recuperação.',
    },
    alerts: {
      revoked: 'O autenticador de {{name}} foi removido',
    },
    errors: {
      revoke: 'Não foi possível remover o autenticador.',
    },
  },
};
