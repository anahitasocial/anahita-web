export default {
  cTitle: 'Grupos',
  mTitle: 'Grupos',
  add: {
    cTitle: 'Criar grupo',
    mTitle: 'Criar grupo',
  },
  settings: {
    info: 'Informações',
    admins: 'Admins',
    features: 'Recursos',
    permissions: 'Permissões',
    rules: 'Regras',
    access: 'Privacidade',
    // Deletion copy, namespace-specific. The shared actor:delete strings told
    // group administrators to "sign in to restore", which a group cannot do,
    // and that their passkeys would be removed, which a group has none of.
    delete: 'Excluir',
    // The card title. Its text is in the accounts namespace, shared with
    // the accounts list.
    purge: 'Excluir permanentemente',
    // Archive. The copy does the work here: archive sits next to delete and
    // must never read as the gentler option. Permanence first, then what is
    // preserved — which is the reason to choose it, not a softener.
    archive: 'Arquivar',
    archivePrompts: {
      permanent: 'Arquivar não pode ser desfeito. Não há como trazer este grupo de volta.',
      groupDescription: 'Nada é excluído. Cada publicação, foto e discussão fica exatamente onde está e mantém o endereço, então os links que as pessoas salvaram continuam funcionando. O que acaba é a atividade do grupo: ele sai dos feeds, das sugestões e da busca, e ninguém pode publicar nele de novo.',
      confirmLabel: 'Digite {{ alias }} para confirmar',
      action: 'Arquivar permanentemente',
      archived: 'Este grupo foi arquivado.',
      errors: {
        nothingToArchive: 'Nada para arquivar — este grupo já está arquivado ou com exclusão agendada.',
        forbidden: 'Você não tem permissão para arquivar este grupo.',
        lastSuperAdmin: 'Este é o único superadmin. Promova outra pessoa antes de arquivar este grupo.',
        generic: 'Não foi possível arquivar este grupo. Tente de novo.',
      },
    },
    // Disable. Deliberately light — it is a switch, and dressing it up like
    // the two below trains people to type confirmations without reading.
    disable: 'Desativar',
    disablePrompts: {
      description: 'Desativar esconde este grupo de todo mundo. Os seguidores não podem publicar nele nem encontrá-lo enquanto estiver desativado.',
      descriptionDisabled: 'Este grupo está desativado. Ele não aparece em lugar nenhum e ninguém pode publicar nele.',
      reversible: 'Isso pode ser desfeito a qualquer momento, e nada é excluído. Para remover um perfil permanentemente, arquive ou exclua.',
      action: 'Desativar',
      actionEnable: 'Ativar',
      disabled: 'Este grupo foi desativado.',
      enabled: 'Este grupo foi ativado.',
      errors: {
        forbidden: 'Você não tem permissão para mudar isso.',
        lastSuperAdmin: 'Este é o único superadmin e não pode ser desativado.',
        generic: 'Não foi possível mudar isso. Tente de novo.',
      },
    },
    deletePrompts: {
      counts: {
        intro: 'Neste grupo agora:',
        posts: '{{ count }} publicação',
        posts_other: '{{ count }} publicações',
        replies: '{{ count }} resposta',
        replies_other: '{{ count }} respostas',
        followers: '{{ count }} seguidor',
        followers_other: '{{ count }} seguidores',
        admins: '{{ count }} admin',
        admins_other: '{{ count }} admins',
        memberSince: 'Criado em {{ date }}.',
      },
      description: 'Excluir remove este grupo e tudo o que há nele: publicações, fotos, respostas e a lista de seguidores. O conteúdo que os seguidores contribuíram vai junto.',
      reversible: 'Isso não é imediato. O grupo é escondido na hora e apagado permanentemente depois de {{ count }} dias. Até lá, qualquer admin pode restaurá-lo nesta página.',
      revoked: 'Os seguidores perdem o acesso na hora, e o grupo some dos perfis e dos feeds deles.',
      handle: 'O nome {{ alias }} continua reservado depois, para que nenhum outro grupo possa usá-lo.',
      scheduled: 'Este grupo está com exclusão agendada e será apagado em {{ date }}.',
      restore: 'Restaurar este grupo',
      restored: 'Este grupo foi restaurado.',
      errors: {
        restoreFailed: 'Não foi possível restaurar este grupo. Ele pode já ter sido apagado permanentemente.',
      },
    },
    // Labels the tab; the card inside it still reads "Delete".
    sections: {
      danger: 'Zona de perigo',
    },
    followRequests: 'Pedidos para seguir',
  },
  confirm: {
    delete: 'Você quer excluir o perfil de {{ name }}?',
  },
};
