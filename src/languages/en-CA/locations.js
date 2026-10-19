export default {
  cTitle: 'Locations',
  mTitle: 'Locations',
  location: {
    name: 'Name',
    address: 'Address',
    city: 'City',
    province: 'Province',
    postalCode: 'Postal code',
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
  // The pin on the map of the Add and Edit forms.
  point: {
    label: 'Where the location is',
    hint: 'Tap the map to place the pin, then drag it to move it.',
    useMine: 'Use my position',
    denied: 'Your browser did not share your position.',
    needed: 'Place the pin, or give an address to find it by.',
  },
};
