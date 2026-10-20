export default {
  cTitle: 'Grupos',
  mTitle: 'Grupos',
  add: {
    cTitle: 'Crear grupo',
    mTitle: 'Crear grupo',
  },
  settings: {
    info: 'Información',
    admins: 'Admins',
    features: 'Funciones',
    permissions: 'Permisos',
    rules: 'Reglas',
    reports: 'Reportes',
    access: 'Privacidad',
    // Deletion copy, namespace-specific. The shared actor:delete strings told
    // group administrators to "sign in to restore", which a group cannot do,
    // and that their passkeys would be removed, which a group has none of.
    delete: 'Eliminar',
    // The card title. Its text is in the accounts namespace, shared with
    // the accounts list.
    purge: 'Eliminar definitivamente',
    // Archive. The copy does the work here: archive sits next to delete and
    // must never read as the gentler option. Permanence first, then what is
    // preserved — which is the reason to choose it, not a softener.
    archive: 'Archivar',
    archivePrompts: {
      permanent: 'Archivar no se puede deshacer. No hay forma de recuperar este grupo.',
      groupDescription: 'No se elimina nada. Cada publicación, foto y conversación se queda exactamente donde está y conserva su dirección, así que los enlaces que la gente haya guardado seguirán funcionando. Lo que termina es la actividad del grupo: sale de los feeds, las sugerencias y la búsqueda, y nadie puede volver a publicar en él.',
      confirmLabel: 'Escribe {{ alias }} para confirmar',
      action: 'Archivar definitivamente',
      archived: 'Este grupo se archivó.',
      errors: {
        nothingToArchive: 'No hay nada que archivar: este grupo ya está archivado o programado para eliminarse.',
        forbidden: 'No tienes permiso para archivar este grupo.',
        lastSuperAdmin: 'Esta es la única cuenta de superadmin. Asciende a otra persona antes de archivar este grupo.',
        generic: 'No se pudo archivar este grupo. Inténtalo de nuevo.',
      },
    },
    // Disable. Deliberately light — it is a switch, and dressing it up like
    // the two below trains people to type confirmations without reading.
    disable: 'Desactivar',
    disablePrompts: {
      description: 'Desactivar oculta este grupo a todo el mundo. Mientras esté desactivado, sus seguidores no pueden publicar en él ni encontrarlo.',
      descriptionDisabled: 'Este grupo está desactivado. No aparece en ningún lugar y nadie puede publicar en él.',
      reversible: 'Se puede deshacer en cualquier momento, y no se elimina nada. Para quitar un perfil definitivamente, archívalo o elimínalo.',
      action: 'Desactivar',
      actionEnable: 'Activar',
      disabled: 'Este grupo se desactivó.',
      enabled: 'Este grupo se activó.',
      errors: {
        forbidden: 'No tienes permiso para cambiar esto.',
        lastSuperAdmin: 'Esta es la única cuenta de superadmin y no se puede desactivar.',
        generic: 'No se pudo cambiar. Inténtalo de nuevo.',
      },
    },
    deletePrompts: {
      counts: {
        intro: 'En este grupo ahora mismo:',
        posts: '{{ count }} publicación',
        posts_other: '{{ count }} publicaciones',
        replies: '{{ count }} respuesta',
        replies_other: '{{ count }} respuestas',
        followers: '{{ count }} seguidor',
        followers_other: '{{ count }} seguidores',
        admins: '{{ count }} admin',
        admins_other: '{{ count }} admins',
        memberSince: 'Creado el {{ date }}.',
      },
      description: 'Eliminar quita este grupo y todo lo que contiene: publicaciones, fotos, respuestas y la lista de seguidores. El contenido que aportaron sus seguidores se va con él.',
      reversible: 'No es inmediato. El grupo se oculta enseguida y se borra definitivamente después de {{ count }} días. Hasta entonces, cualquier admin puede restaurarlo desde esta página.',
      revoked: 'Sus seguidores pierden el acceso de inmediato, y el grupo desaparece de sus perfiles y feeds.',
      handle: 'El nombre {{ alias }} queda reservado después, para que ningún otro grupo pueda usarlo.',
      scheduled: 'Este grupo está programado para eliminarse y se borrará el {{ date }}.',
      restore: 'Restaurar este grupo',
      restored: 'Este grupo se restauró.',
      errors: {
        restoreFailed: 'No se pudo restaurar este grupo. Es posible que ya se haya borrado definitivamente.',
      },
    },
    // Labels the tab; the card inside it still reads "Delete".
    sections: {
      danger: 'Zona de peligro',
    },
    followRequests: 'Solicitudes de seguimiento',
  },
  confirm: {
    delete: '¿Quieres eliminar el perfil de {{ name }}?',
  },
};
