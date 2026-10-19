// A website, as a kind of profile: a site's feed to follow, here and from
// the fediverse (docs/websites.md in anahita-services). Named Website on
// 2026-10-16, a plain word for the thing, for trademarks; it was Pulse.
export default {
  cTitle: 'Sitios web',
  mTitle: 'Sitios web',
  // What a website is here, where somebody meets the list.
  description: 'El feed de un sitio web, para seguirlo aquí y desde el fediverso.',
  connect: {
    cTitle: 'Conecta tu sitio web',
    mTitle: 'Conecta tu sitio web',
    intro: 'Cualquier sitio con un feed RSS, Atom o JSON se puede seguir aquí: un sitio de WordPress u otro, un sitio estático, el registro de cambios de una app, un pódcast. Sus publicaciones llegan a las personas de aquí y del fediverso, y las llevan de vuelta a tu sitio.',
    steps: {
      site: 'Tu sitio web',
      proof: 'Demuestra que es tuyo',
      website: 'Su perfil aquí',
    },
    site: {
      label: 'La dirección de tu sitio web',
      placeholder: 'example.com',
      help: 'El sitio o su feed. El feed debe estar en el mismo dominio.',
      find: 'Buscar su feed',
    },
    found: 'Se encontró el feed «{{ title }}».',
    proof: {
      intro: 'Solo quien controla {{ domain }} puede conectarlo. Pon este token en uno de estos dos lugares, el que te resulte más fácil, y luego comprueba.',
      token: 'Token',
      dnsTitle: 'Un registro DNS',
      dns: 'Agrega un registro TXT con este nombre, que contenga el token:',
      fileTitle: 'Un archivo en tu sitio',
      file: 'O publica el token, solo en una línea, en esta dirección:',
      check: 'Comprobar',
      notYet: 'El token todavía no está en ninguno de los dos lugares. Un registro DNS nuevo puede tardar en verse: vuelve a comprobar en unos minutos.',
      proved: 'Demostrado con el {{ method }}.',
      methods: {
        dns: 'registro DNS',
        file: 'archivo en tu sitio',
      },
      again: 'Se vuelve a comprobar cada día. Si desaparece durante una semana, deja de publicar hasta que vuelva.',
    },
    website: {
      name: 'Nombre',
      alias: 'Identificador',
      aliasHelp: 'Su dirección aquí y en el fediverso: {{ handle }}. Letras, dígitos, - y _.',
      body: 'Descripción',
      connect: 'Conectar',
      seen: 'Tus diez publicaciones más recientes aparecen de inmediato; lo que publiques a partir de ahora llegará después.',
    },
    copy: 'Copiar',
    copied: 'Copiado',
    done: 'Tu sitio web está conectado.',
    errors: {
      not_a_domain: 'Esa no es la dirección de un sitio web.',
      no_feed: 'No se encontró ningún feed ahí. Indica la dirección del feed si el sitio no la menciona.',
      unreadable: 'No se pudo leer el sitio. Revisa la dirección e inténtalo de nuevo.',
      feed_not_on_domain: 'El feed está en otro dominio, y no puedes demostrar que es tuyo.',
      private_feed: 'Ese feed es privado: requiere iniciar sesión, o su dirección lleva un secreto. Las publicaciones de un sitio web son públicas, así que solo se puede conectar un feed público.',
      feed_taken: 'Ese feed ya está conectado.',
      handle_taken: 'Ese identificador ya está en uso.',
      not_proved: 'Primero demuestra que el dominio es tuyo.',
      tooMany: 'Demasiados intentos. Inténtalo de nuevo en una hora.',
      generic: 'Algo salió mal. Inténtalo de nuevo.',
    },
  },
  // In its About card.
  about: {
    verified: 'Verificado',
  },
  settings: {
    info: 'Información',
    admins: 'Admins',
    access: 'Bloqueados',
    website: 'En tu sitio',
    fediverse: 'Fediverso',
    // Its card under Fediverse: off until one of its administrators turns
    // it on, as a person's is.
    fediverseCard: {
      enable: 'Permitir que personas de otros servidores lo encuentren y lo sigan',
      help: 'Así, las personas de Mastodon y de otros servidores del fediverso pueden encontrar el sitio web por su identificador y seguirlo, y les llegan sus notas.',
      handle: 'Su identificador',
      leavesWhenPrivate: 'Si el sitio web se desactiva o se elimina, también sale del fediverso, como si hubieras desactivado esto.',
      leave: {
        title: '¿Sacar el sitio web del fediverso?',
        body: 'Se pedirá a cada servidor que conoce el sitio web que lo elimine, junto con sus notas y sus seguidores allí. Esto no se puede deshacer desde aquí: si vuelves a activarlo más adelante, puede que los servidores que lo eliminaron no lo acepten de nuevo, y nadie que lo seguía lo seguirá.',
        confirm: 'Sacarlo',
      },
      unavailable: {
        site_private: 'Este sitio reserva su contenido a sus miembros, así que ningún sitio web de aquí está en el fediverso.',
        site_unreachable: 'Este sitio no tiene una dirección a la que otros servidores puedan llegar, así que ningún sitio web de aquí está en el fediverso.',
        profile_not_public: 'Mientras el sitio web esté desactivado o eliminado, no puede estar en el fediverso.',
      },
    },
    blueskyHelp: 'Conecta la cuenta de Bluesky del propio sitio web, con tu dominio como identificador si quieres (@example.com): sus notas también se publican ahí, y las personas de Bluesky lo siguen ahí. Usa una contraseña creada para una app, no la de la cuenta.',
    websiteIntro: 'Pega esto en tu sitio para llevar hasta aquí a quienes te leen.',
    snippetLabel: 'Sigue nuestro sitio web en el fediverso',
    disable: 'Desactivar',
    disablePrompts: {
      description: 'Al desactivarlo, este sitio web queda oculto para todo el mundo y las nuevas publicaciones de tu sitio dejan de aparecer aquí.',
      descriptionDisabled: 'Este sitio web está desactivado. No aparece en ningún lugar y no publica nada.',
      reversible: 'Se puede deshacer en cualquier momento, y no se elimina nada.',
      action: 'Desactivar',
      actionEnable: 'Activar',
      disabled: 'Se desactivó este sitio web.',
      enabled: 'Se activó este sitio web.',
      errors: {
        forbidden: 'No tienes permiso para cambiar esto.',
        lastSuperAdmin: 'Es la única persona con rol de superadmin y no se puede desactivar.',
        generic: 'No se pudo cambiar. Inténtalo de nuevo.',
      },
    },
    delete: 'Eliminar',
    purge: 'Eliminar definitivamente',
    deletePrompts: {
      counts: {
        intro: 'En este sitio web, aquí y ahora:',
        posts: '{{ count }} publicación',
        posts_other: '{{ count }} publicaciones',
        replies: '{{ count }} respuesta',
        replies_other: '{{ count }} respuestas',
        followers: '{{ count }} seguidor',
        followers_other: '{{ count }} seguidores',
        admins: '{{ count }} admin',
        admins_other: '{{ count }} admins',
        memberSince: 'Conectado el {{ date }}.',
      },
      description: 'Al eliminarlo, se borran el perfil de este sitio web aquí, las publicaciones que hizo a partir del feed de tu sitio y las respuestas que tienen. Tu sitio en sí no se toca.',
      reversible: 'No es inmediato. Se oculta enseguida y se borra definitivamente después de {{ count }} días. Antes de eso, cualquier admin puede restaurarlo desde esta página.',
      revoked: 'Sus seguidores de aquí y del fediverso lo pierden de inmediato.',
      handle: 'El identificador {{ alias }} queda reservado después.',
      scheduled: 'Este sitio web está programado para eliminarse y se borrará el {{ date }}.',
      restore: 'Restaurar este sitio web',
      restored: 'Se restauró este sitio web.',
      errors: {
        restoreFailed: 'No se pudo restaurar este sitio web. Puede que ya se haya borrado definitivamente.',
      },
    },
    sections: {
      danger: 'Zona de peligro',
    },
  },
  confirm: {
    delete: '¿Quieres eliminar {{ name }}?',
  },
};
