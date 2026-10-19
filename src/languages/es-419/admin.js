export default {
  cTitle: 'Administración',
  cDescription: 'Reportes, solicitudes de registro e invitaciones que atiende la administración.',
  mTitle: 'Administración',
  tabWithCount: '{{title}} ({{count}})',
  waiting_one: '{{count}} elemento pendiente',
  waiting_other: '{{count}} elementos pendientes',
  restricted: {
    cTitle: 'La administración está restringida',
    cDescription: 'Solo para admins.',
  },
  scheduled: {
    title: 'Eliminaciones programadas',
    description: 'Todos los perfiles que se van a eliminar, los más próximos primero. Cada uno se puede restaurar o eliminar para siempre desde su configuración mientras le queden días.',
    empty: 'No hay eliminaciones programadas.',
    settings: 'Configuración',
    loadError: 'No se pudieron cargar las eliminaciones programadas.',
    kinds: {
      person: 'Persona',
      group: 'Grupo',
      event: 'Evento',
      website: 'Sitio web',
    },
  },
};
