import utils from '../utils';

const {
  isSuperAdmin,
} = utils.node;

// The accounts list, and removing accounts for good.
//
// Super administrators only, which is what the API enforces on both:
// GET /accounts and every purge route refuse anybody else. An
// administrator can delete an account, which can be undone for thirty
// days. This cannot.
const canBrowse = (viewer) => {
  return isSuperAdmin(viewer);
};

// Whether the viewer may remove this actor for good from its own
// settings page. Never themselves: the API refuses that too.
const canPurge = (viewer, actor) => {
  return isSuperAdmin(viewer) && Boolean(actor) && actor.id !== viewer.id;
};

const PERSON_HERE = 'node.actor.person-service.person.v1';

// The types a person may be given, in the order they are offered.
const PERSON_TYPES = ['registered', 'administrator', 'super-administrator'];

// Whether somebody of viewerType may change a person from one type to
// another (the user, 2026-10-18). Mirrors MayChangePersonType in
// anahita-libs/constants/person_types.go, which graph-grpc and auth-service
// both ask: an administrator makes administrators of registered people, and
// the rest is a super administrator's.
const mayChangePersonType = (viewerType, from, to) => {
  if (from === to || !PERSON_TYPES.includes(from) || !PERSON_TYPES.includes(to)) {
    return false;
  }
  if (viewerType === 'super-administrator') {
    return true;
  }
  if (viewerType === 'administrator') {
    return from === 'registered' && to === 'administrator';
  }
  return false;
};

// The types the viewer may offer for this person: the one they have and
// those it may be changed to. Empty when there is nothing to change: the
// viewer's own type, which nobody changes, or a profile that is not a person
// here.
const personTypesFor = (viewer, person) => {
  if (!viewer || !person || person.id === viewer.id || person.type !== PERSON_HERE) {
    return [];
  }
  const from = person.personType || 'registered';
  const choices = PERSON_TYPES.filter((to) => {
    return to === from || mayChangePersonType(viewer.personType, from, to);
  });
  return choices.length > 1 ? choices : [];
};

export default {
  canBrowse,
  canPurge,
  PERSON_TYPES,
  mayChangePersonType,
  personTypesFor,
};
