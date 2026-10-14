export default {
  cTitle: 'Search',
  mTitle: 'Search',
  filterRadius: '{{ radius }} km',
  sort: 'Sort by',
  sortOptions: {
    relevant: 'Most relevant',
    recent: 'Most recent',
  },
  filterNodeTypes: {
    all: 'All',
    media: 'Media',
    actors: 'Actors',
    feeds: 'Feeds',
  },
  boxPlaceholder: 'Search...',
  recent: {
    title: 'Recent searches',
    forget: 'Forget "{{ term }}"',
    clear: 'Clear recent searches',
  },
  distance: {
    unavailable: 'This browser cannot say where you are, so this search is not limited by distance.',
    refused: 'Your browser did not share where you are, so this search is not limited by distance. Allow this site to know your location to search nearby.',
  },
  nothingFound: 'Nothing matches “{{ term }}”.',
  foundUnder_one: '{{ count }} under {{ tab }}',
  foundUnder_other: '{{ count }} under {{ tab }}',
};
