export default {
  story: {
    title: 'Stories',
    description: 'Compartilhe novidades passageiras com seus seguidores.',
    addPermissions: {},
  },
  feed: {
    title: 'Feed',
    description: 'Receba as novidades das pessoas que você segue, das mais recentes para as mais antigas.',
    addPermissions: {},
  },
  socialgraph: {
    title: 'Rede de contatos',
    description: 'Veja sua rede de contatos e gerencie seus seguidores.',
    addPermissions: {
      title: 'Permissões',
      follower: 'Quem pode adicionar um seguidor?',
      invite: 'Quem pode convidar pessoas para seguir?',
      mention: 'Quem pode mencionar você?',
    },
  },
  text: {
    title: 'Texto',
    description: 'Publicações de texto para compartilhar com seus seguidores.',
    addPermissions: {
      title: 'Permissões',
      note: 'Quem pode publicar uma nota?',
      article: 'Quem pode publicar um artigo?',
      topic: 'Quem pode abrir um tópico?',
      comment: 'Quem pode responder?',
      like: 'Quem pode curtir?',
    },
  },
  photo: {
    title: 'Fotos',
    description: 'Compartilhe suas fotos com seus seguidores.',
    addPermissions: {
      title: 'Permissões',
      photo: 'Quem pode publicar uma foto?',
      comment: 'Quem pode responder?',
      like: 'Quem pode curtir?',
    },
  },
};
