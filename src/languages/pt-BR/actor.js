export default {
  scheduledDeletion_one: 'Exclusão programada · falta {{count}} dia',
  scheduledDeletion_other: 'Exclusão programada · faltam {{count}} dias',
  about: 'Sobre',
  name: 'Nome',
  alias: 'Nome de usuário',
  website: 'Site',
  body: 'Descrição',
  unknown: 'Desconhecido',
  // A profile the viewer may not see, which lets people ask to follow it.
  limited: {
    private: 'Este perfil é privado. Os seguidores podem vê-lo.',
    request: 'Pedir para seguir',
    requested: 'Pedido enviado',
    withdraw: 'Cancelar pedido',
    failed: 'Não foi possível fazer isso.',
  },
  featured: {
    feature: 'Destacar',
    unfeature: 'Deixar de destacar',
    errors: {
      generic: 'Não foi possível mudar o destaque deste perfil. Tente de novo.',
      conflict: 'Um perfil desativado ou arquivado não pode ser destacado.',
    },
  },
  delete: {
    // The card said nothing about what deletion does, whether it is
    // reversible, or when it takes effect — it offered one text field and a
    // red button. These strings are the disclosure.
    prompts: {
      challenge: 'Digite {{ alias }} para confirmar',
      inProgress: 'Excluindo…',
    },
    errors: {
      generic: 'Não foi possível excluir este perfil. Tente de novo.',
      forbidden: 'Você não tem permissão para excluir este perfil.',
      // Fallback only. The server sends a message naming the way out, and
      // it is more specific than this can be.
      lastSuperAdmin: 'Este é o único superadmin. Promova outra pessoa, ou mude esta conta para admin, antes de excluí-la.',
    },
  },
  access: {
    title: 'Acesso',
    cDescription: 'Quem pode ver este perfil.',
    // One sentence per level, because the label alone does not say who
    // it means — "Mutuals" and "Following" are the site's words, not
    // everybody's.
    descriptions: {
      public: 'Qualquer pessoa, conectada ou não.',
      registered: 'Qualquer pessoa com conta aqui.',
      followers: 'Pessoas que seguem este perfil.',
      leaders: 'Pessoas que este perfil segue.',
      mutuals: 'Pessoas que seguem este perfil e são seguidas de volta.',
      admins: 'A administração deste grupo.',
      myself: 'Mais ninguém.',
    },
    labels: {
      whoCanSee: 'Quem pode ver este perfil?',
      othersCanRequestToFollow: 'Outras pessoas podem pedir para seguir',
      whoCanAddFollowers: 'Quem pode adicionar seguidores?',
    },
    alerts: {
      success: 'O acesso foi atualizado',
      error: 'Não foi possível atualizar o acesso.',
    },
  },
  permissions: {
    title: 'Permissões',
    cDescription: 'Quem pode publicar, responder e curtir aqui. Até que isto seja salvo, valem os padrões do site.',
    empty: 'Não há nada aqui com permissões para definir.',
    restoreDefaults: 'Restaurar os padrões',
    // Per actor type, because "Admins" of a person is that person.
    choices: {
      person: {
        registered: 'Qualquer pessoa conectada',
        followers: 'Seguidores',
        leaders: 'Seguindo',
        mutuals: 'Mútuos',
        admins: 'Só eu',
      },
      group: {
        registered: 'Qualquer pessoa conectada',
        followers: 'Seguidores',
        admins: 'Admins',
      },
    },
    // Shown under each choice in the open list — "Following" and "Mutuals"
    // are the site's words, not everybody's.
    descriptions: {
      person: {
        registered: 'Qualquer pessoa com conta aqui.',
        followers: 'Pessoas que seguem você.',
        leaders: 'Pessoas que você segue.',
        mutuals: 'Pessoas que seguem você e que você segue de volta.',
        admins: 'Mais ninguém.',
      },
      group: {
        registered: 'Qualquer pessoa com conta aqui.',
        followers: 'Pessoas que seguem este grupo.',
        admins: 'A administração deste grupo.',
      },
    },
    // Replies on a profile narrower than registered follow its access.
    commentLocked: {
      followers: 'Seguidores — este perfil só é visível para seguidores.',
      readers: 'Qualquer pessoa que possa ver este perfil, conforme definido em Acesso.',
    },
  },
  tabs: 'Abas do perfil',
  addAdmins: 'Adicionar admins',
};
