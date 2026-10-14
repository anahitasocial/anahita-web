import { Search as SEARCH } from '../constants';

// The search page's place, in its address: what was searched for, under
// which tab, in which order, and how far. Reloading, going back, and a
// link somebody sends all open the page as it was.
//
// What is as it comes is left out, so the plain address stays plain:
// `/search?q=seeds`, not `/search?q=seeds&scope=all&sort=relevant&km=125`.

const { SCOPE, SORTING } = SEARCH;

// The distances offered, in kilometres. The last is "anywhere".
const DISTANCES = [25, 50, 75, 100, 125];
const ANYWHERE = 125;

const SCOPES = Object.values(SCOPE);
const ORDERS = [SORTING.RELEVANT, SORTING.RECENT];

// What the address says, with anything it does not say, or says wrongly,
// as it comes.
const read = (search) => {
  const params = new URLSearchParams(search || '');
  const scope = params.get('scope');
  const sort = params.get('sort');
  const km = Number(params.get('km'));

  return {
    q: params.has('q') ? params.get('q') : undefined,
    scope: SCOPES.includes(scope) ? scope : SCOPE.ALL,
    sort: ORDERS.includes(sort) ? sort : SORTING.RELEVANT,
    km: DISTANCES.includes(km) ? km : ANYWHERE,
  };
};

// The address of a search.
const of = ({
  q = '',
  scope = SCOPE.ALL,
  sort = SORTING.RELEVANT,
  km = ANYWHERE,
}) => {
  const params = new URLSearchParams();
  params.set('q', q);
  if (scope && scope !== SCOPE.ALL && SCOPES.includes(scope)) {
    params.set('scope', scope);
  }
  if (sort && sort !== SORTING.RELEVANT && ORDERS.includes(sort)) {
    params.set('sort', sort);
  }
  if (km !== ANYWHERE && DISTANCES.includes(km)) {
    params.set('km', `${km}`);
  }
  return `/search?${params.toString()}`;
};

export default {
  DISTANCES,
  ANYWHERE,
  read,
  of,
};
