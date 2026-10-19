export default {
  cTitle: 'Administração',
  cDescription: 'Denúncias, pedidos de cadastro e convites que ficam a cargo da administração.',
  mTitle: 'Administração',
  tabWithCount: '{{title}} ({{count}})',
  waiting_one: '{{count}} item pendente',
  waiting_other: '{{count}} itens pendentes',
  restricted: {
    cTitle: 'A administração é restrita',
    cDescription: 'Só para a administração.',
  },
  scheduled: {
    title: 'Exclusões programadas',
    description: 'Todos os perfis que serão excluídos, os mais próximos primeiro. Cada um pode ser restaurado ou removido para sempre nas suas configurações enquanto restarem dias.',
    empty: 'Nenhuma exclusão programada.',
    settings: 'Configurações',
    loadError: 'Não foi possível carregar as exclusões programadas.',
    kinds: {
      person: 'Pessoa',
      group: 'Grupo',
      event: 'Evento',
      website: 'Site',
    },
  },
};
