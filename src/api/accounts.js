import axios from 'axios';

// The administration list of accounts, and removing accounts for good.
// Super administrators only. See anahita-services docs/account-lifecycle.md.

// 'person' or 'group' -> the namespace its purge routes live under.
const NAMESPACES = {
  person: 'people',
  group: 'groups',
};

// As many accounts as one purge request may name, and so the most one
// browse returns.
const BATCH_MAX = 500;

// People or groups, least recently active first.
//
// The names on the right are the API's: query strings are not rewritten
// the way request bodies are. A filter left out, or false, is not sent at
// all. The three "only" filters are sent as the literal `false` the API
// asks for: "people whose email_verified is false".
const browse = (filters = {}) => {
  const {
    kind = 'person',
    q = '',
    tier = '',
    state = '',
    lastActiveBefore = '',
    createdBefore = '',
    onlyUnverified = false,
    onlyNotOnboarded = false,
    onlyWithoutContent = false,
    onlyWithoutAdmin = false,
    limit = 50,
    offset = 0,
  } = filters;

  return axios.get('/accounts', {
    params: {
      kind,
      q: q || undefined,
      tier: tier || undefined,
      state: state || undefined,
      last_active_before: lastActiveBefore || undefined,
      created_before: createdBefore || undefined,
      email_verified: onlyUnverified ? 'false' : undefined,
      onboarded: onlyNotOnboarded ? 'false' : undefined,
      content_max: onlyWithoutContent ? 0 : undefined,
      has_admin: onlyWithoutAdmin ? 'false' : undefined,
      limit,
      offset,
    },
  });
};

// Removes many accounts at once. `confirm` is their number, typed out,
// which the server checks against the list.
//
// 202 queued, with a batchId to ask about; 200 nothing to do; 403
// `step_up_required` prove who you are first; 409 `purge_refused` with
// the reason for each account that stopped it, and nothing touched.
const purgeBatch = (kind, ids) => {
  return axios.post(`/${NAMESPACES[kind]}/purge-batch`, {
    ids,
    confirm: `PURGE ${ids.length}`,
  });
};

// Removes one account by name. Unlike a batch, this may remove an
// administrator, though never the last super administrator.
const purgeOne = (namespace, id) => {
  return axios.delete(`/${namespace}/${id}/purge`);
};

// How far a request has got: total, queued, done, failed, and each
// account's state.
const purgeProgress = (namespace, batchId) => {
  return axios.get(`/${namespace}/purge-batch/${batchId}`);
};

export default {
  NAMESPACES,
  BATCH_MAX,
  browse,
  purgeBatch,
  purgeOne,
  purgeProgress,
};
