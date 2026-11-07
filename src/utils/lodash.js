// The few lodash functions the app uses, each imported on its own, so that
// only these are in the app's first script and not the whole library
// (roadmap row 128). Imported as `_`, as lodash was: `_.snakeCase(name)`.
// A function not here is added here.
import camelCase from 'lodash/camelCase';
import every from 'lodash/every';
import filter from 'lodash/filter';
import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import keys from 'lodash/keys';
import mapValues from 'lodash/mapValues';
import omit from 'lodash/omit';
import snakeCase from 'lodash/snakeCase';
import union from 'lodash/union';
import uniq from 'lodash/uniq';
import values from 'lodash/values';

export default {
  camelCase,
  every,
  filter,
  find,
  findIndex,
  keys,
  mapValues,
  omit,
  snakeCase,
  union,
  uniq,
  values,
};
