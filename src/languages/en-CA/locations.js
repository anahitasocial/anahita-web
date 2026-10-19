export default {
  cTitle: 'Locations',
  mTitle: 'Locations',
  location: {
    name: 'Name',
    address: 'Address',
    city: 'City',
    province: 'Province',
    country: 'Country',
  },
  add: {
    search: 'Search for a location',
    noneFound: 'No location called “{{ name }}” yet.',
    noneNearby: 'No locations nearby yet. Search for one, or add it.',
    create: 'Add “{{ name }}”',
    cTitle: 'Add locations',
    mTitle: 'Add locations',
    // At the most locations a post may be tied to (Medium.MAX_LOCATIONS).
    full: 'A post can have up to {{ count }} locations.',
  },
  confirm: {
    delete: 'Do you want to delete this location?',
  },
  // The lists of the Locations page.
  lists: {
    search: 'Search locations',
    noneFound: 'No locations match.',
    noneNearby: 'No locations near you yet.',
    asking: 'Finding where you are…',
    denied: 'Let your browser share your location to see locations near you.',
    tryAgain: 'Try again',
  },
};
