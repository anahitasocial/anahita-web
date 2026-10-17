export default {
  about: 'Acerca de',
  name: 'Nombre',
  alias: 'Alias',
  website: 'Sitio web',
  body: 'Descripción',
  unknown: 'Desconocido',
  // A profile the viewer may not see, which lets people ask to follow it.
  limited: {
    private: 'Este perfil es privado. Sus seguidores pueden verlo.',
    request: 'Solicitar seguir',
    requested: 'Solicitado',
    withdraw: 'Retirar la solicitud',
    failed: 'No se pudo hacer.',
  },
  featured: {
    feature: 'Destacar',
    unfeature: 'Dejar de destacar',
    errors: {
      generic: 'No se pudo cambiar si este perfil está destacado. Inténtalo de nuevo.',
      conflict: 'Un perfil desactivado o archivado no se puede destacar.',
    },
  },
  delete: {
    // The card said nothing about what deletion does, whether it is
    // reversible, or when it takes effect — it offered one text field and a
    // red button. These strings are the disclosure.
    prompts: {
      challenge: 'Escribe {{ alias }} para confirmar',
      inProgress: 'Eliminando...',
    },
    errors: {
      generic: 'No se pudo eliminar este perfil. Inténtalo de nuevo.',
      forbidden: 'No tienes permiso para eliminar este perfil.',
      // Fallback only. The server sends a message naming the way out, and
      // it is more specific than this can be.
      lastSuperAdmin: 'Esta es la única cuenta de superadmin. Asciende a otra persona, o cambia esta cuenta a admin, antes de eliminarla.',
    },
  },
  access: {
    title: 'Acceso',
    cDescription: 'Quién puede ver este perfil.',
    // One sentence per level, because the label alone does not say who
    // it means — "Mutuals" and "Following" are the site's words, not
    // everybody's.
    descriptions: {
      public: 'Cualquier persona, con sesión iniciada o no.',
      registered: 'Cualquier persona con una cuenta aquí.',
      followers: 'Las personas que siguen este perfil.',
      leaders: 'Las personas a las que sigue este perfil.',
      mutuals: 'Las personas que siguen este perfil y a las que este perfil sigue.',
      admins: 'La administración de este grupo.',
      myself: 'Nadie más.',
    },
    labels: {
      whoCanSee: '¿Quién puede ver este perfil?',
      othersCanRequestToFollow: 'Otras personas pueden solicitar seguirlo',
      whoCanAddFollowers: '¿Quién puede añadir seguidores?',
    },
    alerts: {
      success: 'Se actualizó el acceso',
      error: 'No se pudo actualizar el acceso.',
    },
  },
  permissions: {
    title: 'Permisos',
    cDescription: 'Quién puede publicar, responder y dar Me gusta aquí. Hasta que se guarden, se aplican los valores predeterminados del sitio.',
    empty: 'Aquí no hay nada con permisos que configurar.',
    restoreDefaults: 'Restablecer valores predeterminados',
    // Per actor type, because "Admins" of a person is that person.
    choices: {
      person: {
        registered: 'Cualquier persona con sesión iniciada',
        followers: 'Seguidores',
        leaders: 'Seguidos',
        mutuals: 'Mutuos',
        admins: 'Solo yo',
      },
      group: {
        registered: 'Cualquier persona con sesión iniciada',
        followers: 'Seguidores',
        admins: 'Admins',
      },
    },
    // Shown under each choice in the open list — "Following" and "Mutuals"
    // are the site's words, not everybody's.
    descriptions: {
      person: {
        registered: 'Cualquier persona con una cuenta aquí.',
        followers: 'Las personas que te siguen.',
        leaders: 'Las personas a las que sigues.',
        mutuals: 'Las personas que te siguen y a las que tú también sigues.',
        admins: 'Nadie más.',
      },
      group: {
        registered: 'Cualquier persona con una cuenta aquí.',
        followers: 'Las personas que siguen este grupo.',
        admins: 'La administración de este grupo.',
      },
    },
    // Replies on a profile narrower than registered follow its access.
    commentLocked: {
      followers: 'Seguidores: este perfil solo es visible para sus seguidores.',
      readers: 'Cualquier persona que pueda ver este perfil, según lo configurado en Acceso.',
    },
  },
  tabs: 'Pestañas del perfil',
  addAdmins: 'Añadir admins',
};
