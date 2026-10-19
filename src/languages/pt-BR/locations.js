export default {
  cTitle: 'Locais',
  mTitle: 'Locais',
  location: {
    name: 'Nome',
    address: 'Endereço',
    city: 'Cidade',
    province: 'Estado',
    postalCode: 'CEP',
    country: 'País',
  },
  add: {
    search: 'Buscar um local',
    noneFound: 'Ainda não há nenhum local chamado “{{ name }}”.',
    noneNearby: 'Ainda não há locais por perto. Busque um ou adicione-o.',
    create: 'Adicionar “{{ name }}”',
    cTitle: 'Adicionar locais',
    mTitle: 'Adicionar locais',
    // At the most places a post may be tied to (Medium.MAX_LOCATIONS).
    full: 'Uma publicação pode ter até {{ count }} locais.',
  },
  confirm: {
    delete: 'Quer excluir este local?',
  },
  // The lists of the Locations page.
  lists: {
    search: 'Buscar locais',
    noneFound: 'Nenhum local corresponde.',
    noneNearby: 'Ainda não há locais perto de você.',
    asking: 'Descobrindo onde você está…',
    denied: 'Permita que seu navegador compartilhe sua localização para ver locais perto de você.',
    tryAgain: 'Tentar de novo',
  },
  point: {
    label: 'Onde fica o local',
    hint: 'Toque no mapa para colocar o alfinete e arraste-o para movê-lo.',
    useMine: 'Usar minha localização',
    denied: 'Seu navegador não compartilhou sua localização.',
    needed: 'Coloque o alfinete ou informe um endereço para encontrá-lo.',
  },
};
