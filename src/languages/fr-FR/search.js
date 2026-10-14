export default {
  cTitle: 'Recherche',
  mTitle: 'Recherche',
  filterRadius: '{{ radius }} km',
  sort: 'Trier par',
  sortOptions: {
    relevant: 'Les plus pertinents',
    recent: 'Les plus récents',
  },
  filterNodeTypes: {
    all: 'Tout',
    media: 'Médias',
    actors: 'Profils',
    feeds: 'Fils',
  },
  boxPlaceholder: 'Rechercher...',
  recent: {
    title: 'Recherches récentes',
    forget: 'Oublier « {{ term }} »',
    clear: 'Effacer les recherches récentes',
  },
  distance: {
    unavailable: 'Ce navigateur ne peut pas indiquer où vous êtes : cette recherche n’est donc pas limitée par la distance.',
    refused: 'Votre navigateur n’a pas indiqué où vous êtes : cette recherche n’est donc pas limitée par la distance. Autorisez ce site à connaître votre position pour chercher à proximité.',
  },
  nothingFound: 'Rien ne correspond à « {{ term }} ».',
  foundUnder_one: '{{ count }} dans {{ tab }}',
  foundUnder_other: '{{ count }} dans {{ tab }}',
};
