export default {
  cTitle: 'Personas',
  mTitle: 'Personas',
  // Under the title of the list of people: whose list it is.
  browse: {
    title: 'Personas',
    local: 'Personas locales en {{ site }}.',
    localUnnamed: 'Personas locales en esta instancia.',
    elsewhere: {
      both: 'Para encontrar a alguien en el fediverso o en Bluesky, busca su identificador.',
      activitypub: 'Para encontrar a alguien en el fediverso, busca su identificador.',
      atproto: 'Para encontrar a alguien en Bluesky, busca su identificador.',
    },
  },
  add: {
    cTitle: 'Agregar persona',
    mTitle: 'Agregar persona',
  },
  settings: {
    authLogs: 'Inicios de sesión',
    webauthn: 'Llaves de acceso',
    totp: '2FA',
    info: 'Información',
    features: 'Funciones',
    permissions: 'Permisos',
    access: 'Acceso',
    reposts: 'Reposts',
    quotes: 'Citas',
    // Deletion copy, namespace-specific — groups carry their own in groups.js,
    // because the sign-in and passkey lines here are meaningless for a group.
    delete: 'Eliminar',
    // The card title. Its text is in the accounts namespace, shared with
    // the accounts list.
    purge: 'Eliminar de forma permanente',
    // Archive. The copy does the work here: archive sits next to delete and
    // must never read as the gentler option. Permanence first, then what is
    // preserved — which is the reason to choose it, not a softener.
    archive: 'Archivar',
    archivePrompts: {
      permanent: 'Archivar no se puede deshacer. No hay forma de recuperar este perfil.',
      personDescription: 'No se elimina nada. Cada publicación, respuesta y foto se queda exactamente donde está y conserva su dirección, así que los enlaces que la gente guardó seguirán funcionando. Lo que termina es la actividad de la cuenta: sale de los feeds y las sugerencias, y ya no se puede iniciar sesión con ella.',
      selfSignIn: 'Después de esto no podrás volver a iniciar sesión, ni nadie más: el correo electrónico y el nombre de usuario quedan reservados para que nadie pueda usarlos.',
      confirmLabel: 'Escribe {{ alias }} para confirmar',
      action: 'Archivar de forma permanente',
      archived: 'Este perfil se archivó.',
      errors: {
        nothingToArchive: 'No hay nada que archivar: este perfil ya está archivado o tiene la eliminación programada.',
        forbidden: 'No tienes permiso para archivar este perfil.',
        lastSuperAdmin: 'Esta es la única persona con rol de superadmin. Asigna ese rol a alguien más antes de archivar este perfil.',
        generic: 'No se pudo archivar este perfil. Inténtalo de nuevo.',
      },
    },
    // Disable. Deliberately light — it is a switch, and dressing it up like
    // the two below trains people to type confirmations without reading.
    disable: 'Desactivar',
    disablePrompts: {
      description: 'Al desactivar este perfil, se oculta y se cierra la sesión de la persona. No podrá iniciar sesión mientras esté desactivado.',
      descriptionDisabled: 'Este perfil está desactivado. La persona no puede iniciar sesión y el perfil no aparece en ningún lado.',
      reversible: 'Esto se puede deshacer en cualquier momento y no se elimina nada. Para quitar un perfil de forma permanente, archívalo o elimínalo.',
      action: 'Desactivar',
      actionEnable: 'Activar',
      disabled: 'Este perfil se desactivó.',
      enabled: 'Este perfil se activó.',
      errors: {
        forbidden: 'No tienes permiso para cambiar esto.',
        lastSuperAdmin: 'Esta es la única persona con rol de superadmin y no se puede desactivar.',
        generic: 'No se pudo cambiar esto. Inténtalo de nuevo.',
      },
    },
    deletePrompts: {
      counts: {
        intro: 'En este perfil ahora mismo:',
        posts: '{{ count }} publicación',
        posts_other: '{{ count }} publicaciones',
        replies: '{{ count }} respuesta',
        replies_other: '{{ count }} respuestas',
        followers: '{{ count }} seguidor',
        followers_other: '{{ count }} seguidores',
        admins: '{{ count }} admin',
        admins_other: '{{ count }} admins',
        following: 'sigue a {{ count }} persona',
        following_other: 'sigue a {{ count }} personas',
        groupsAdministered: 'admin de {{ count }} grupo',
        groupsAdministered_other: 'admin de {{ count }} grupos',
        memberSince: 'Miembro desde el {{ date }}.',
      },
      description: 'Al eliminar este perfil, se quita junto con todo lo que contiene: publicaciones, respuestas, fotos, seguidores y los grupos que sigue. Las respuestas que otras personas dejaron en este contenido también se eliminan.',
      reversible: 'No es inmediato. El perfil se oculta de inmediato y se borra de forma permanente después de {{ count }} días. Si se inicia sesión antes, se ofrecerá restaurarlo.',
      revoked: 'Las sesiones en todos los dispositivos terminan ahora, y se quitan las llaves de acceso. Restaurar el perfil no las recupera.',
      handle: 'El identificador {{ alias }} queda reservado después, para que nadie más pueda usarlo.',
      scheduled: 'Este perfil tiene la eliminación programada. Inicia sesión antes del {{ date }} para restaurarlo.',
    },
    followRequests: 'Solicitudes de seguimiento',
    password: 'Contraseña',
    email: 'Correo electrónico',
    username: 'Nombre de usuario',
    // Section labels for the grouped person settings page. The keys above
    // are still used as the per-card titles inside a section.
    sections: {
      account: 'Cuenta',
      security: 'Seguridad',
      access: 'Privacidad',
      permissions: 'Permisos',
      fediverse: 'Fediverso',
      administration: 'Administración',
      danger: 'Zona de peligro',
    },
  },
  person: {
    displayName: 'Nombre visible',
    username: 'Nombre de usuario',
    email: 'Correo electrónico',
    body: 'Biografía',
    pronouns: 'Pronombres',
    pronounsUnset: 'Prefiero no decirlo',
    postingLanguage: 'Idioma en el que publicas',
    postingLanguageUnset: 'El idioma de mi navegador',
    postingLanguageHint: 'El editor empieza en este idioma. Puedes cambiarlo en cada publicación.',
    // The set that makes sense in THIS language. Other locales ship their own;
    // a language with no gendered third-person pronoun ships an empty list and
    // the field offers only "prefer not to say".
    pronounOptions: [
      'él',
      'ella',
      'elle',
      'él/elle',
      'ella/elle',
    ],
    usertype: 'Tipo de cuenta',
    usertypeOptions: {
      guest: 'Invitado',
      registered: 'Registrado',
      administrator: 'Admin',
      'super-administrator': 'Superadmin',
    },
    joinedDate: 'Se unió el {{ date }}',
    lastVisitOn: 'Última visita el {{ date }}',
  },
  confirm: {
    delete: '¿Quieres eliminar el perfil de {{ name }}?',
  },
  account: {
    prompts: {
      error: '¡Algo salió mal!',
      errorUsernameTaken: '¡Ese nombre de usuario ya está en uso!',
      errorEmailTaken: '¡Ese correo electrónico ya está registrado!',
    },
  },

  // The Administration section: an administrator looking at somebody
  // else's account. Never the viewer's own — see containers/actors/
  // Settings/sections.js.
  agreements: {
    cTitle: 'Acuerdos',
    tos: 'Términos del servicio',
    privacy: 'Política de privacidad',
    acceptedOn: 'Aceptado el {{date}}',
    never: 'Nunca aceptado',
    version: 'v{{version}}',
    unavailable: 'No se pudieron cargar los acuerdos.',
  },
  metadata: {
    cTitle: 'Cuenta',
    joined: 'Se unió',
    lastSignIn: 'Último inicio de sesión',
    unknown: 'Desconocido',
  },
  revokePasskeys: {
    cTitle: 'Llaves de acceso',
    cDescription: 'Quitar todas las llaves de acceso de esta cuenta.',
    count: 'Esta cuenta tiene {{count}} llave(s) de acceso.',
    unknown: 'No se pudo leer el número de llaves de acceso.',
    actions: {
      revoke: 'Revocar',
    },
    confirm: {
      cTitle: '¿Revocar todas las llaves de acceso?',
      cDescription: '{{name}} ya no podrá iniciar sesión con una llave de acceso. Todavía puede usar su contraseña, y primero se te pedirá que confirmes tu identidad.',
    },
    alerts: {
      revoked: 'Se revocaron todas las llaves de acceso de {{name}}',
    },
    errors: {
      revoke: 'No se pudieron revocar las llaves de acceso.',
    },
  },
  revokeTotp: {
    cTitle: 'Autenticación de dos factores',
    cDescription: 'Quitar la app de autenticación de esta cuenta.',
    enabled: 'Esta cuenta tiene una app de autenticación configurada.',
    disabled: 'Esta cuenta no tiene una app de autenticación configurada.',
    unknown: 'No se pudo leer el estado de la app de autenticación.',
    expired: 'Sin verificar recientemente',
    actions: {
      revoke: 'Quitar',
    },
    confirm: {
      cTitle: '¿Quitar la app de autenticación?',
      cDescription: '{{name}} iniciará sesión sin un segundo factor hasta que configure uno nuevo. Hazlo cuando alguien perdió su dispositivo y sus códigos de recuperación.',
    },
    alerts: {
      revoked: 'Se quitó la app de autenticación de {{name}}',
    },
    errors: {
      revoke: 'No se pudo quitar la app de autenticación.',
    },
  },
  accountType: {
    cTitle: 'Tipo de cuenta',
    action: 'Cambiar tipo de cuenta',
    title: 'Cambiar el tipo de cuenta de {{name}}',
    registered: 'Registrado',
    registeredHelp: 'Participa como cualquier persona con sesión iniciada.',
    administrator: 'Admin',
    administratorHelp: 'Puede actuar en cualquier perfil y publicación, sin importar su configuración, decide los reportes y da el rol de admin a personas registradas.',
    superAdministrator: 'Superadmin',
    superAdministratorHelp: 'Además se ocupa de la instalación: da el rol de superadmin, quita tipos de cuenta, ve la lista de cuentas y elimina cuentas para siempre.',
    when: 'El cambio surte efecto la próxima vez que se renueve su sesión, en menos de 15 minutos.',
    cancel: 'Cancelar',
    save: 'Guardar',
    done: 'Se cambió el tipo de cuenta de {{name}}.',
    notYours: 'Solo una cuenta con rol de superadmin puede cambiar el tipo de cuenta de un admin.',
    errors: {
      notAllowed: 'Solo una cuenta con rol de superadmin puede dar ese rol o quitar un tipo de cuenta.',
      own: 'Nadie cambia su propio tipo de cuenta. Otra cuenta con rol de superadmin puede cambiarlo.',
      generic: 'No se pudo cambiar el tipo de cuenta.',
    },
  },
};
