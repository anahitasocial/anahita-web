export default {
  story: {
    title: 'Historias',
    description: 'Comparte novedades efímeras con tus seguidores.',
    addPermissions: {},
  },
  feed: {
    title: 'Feed',
    description: 'Recibe novedades de las personas que sigues, primero lo más reciente.',
    addPermissions: {},
  },
  socialgraph: {
    title: 'Red social',
    description: 'Mira tu red social y gestiona tus seguidores.',
    addPermissions: {
      title: 'Permisos',
      follower: '¿Quién puede agregar un seguidor?',
      invite: '¿Quién puede invitar a seguir?',
      mention: '¿Quién puede mencionarte?',
      tag: '¿Quién puede etiquetarte en fotos y videos?',
    },
  },
  text: {
    title: 'Texto',
    description: 'Publicaciones de texto para compartir con tus seguidores.',
    addPermissions: {
      title: 'Permisos',
      note: '¿Quién puede publicar una nota?',
      article: '¿Quién puede publicar un artículo?',
      topic: '¿Quién puede iniciar un tema?',
      comment: '¿Quién puede responder?',
      like: '¿Quién puede dar Me gusta?',
    },
  },
  photo: {
    title: 'Fotos',
    description: 'Comparte tus fotos con tus seguidores.',
    addPermissions: {
      title: 'Permisos',
      photo: '¿Quién puede publicar una foto?',
      comment: '¿Quién puede responder?',
      like: '¿Quién puede dar Me gusta?',
    },
  },
};
