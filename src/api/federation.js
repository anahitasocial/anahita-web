import axios from 'axios';

// Being on the fediverse: found and followed from Mastodon and the other
// servers that speak ActivityPub.
//
// The service is optional. Where there is none the gateway answers with an
// error, and whoever asked takes that as there being no fediverse here and
// draws nothing: see utils/federation.js#isAbsent.

// Whether the viewer is on the fediverse, whether they could be, and what
// they are or would be called there.
//
// With a person, it is asked about them: for themselves, or for an
// administrator, who can read it and not change it.
const settings = (person) => {
  const params = person && person.id ? { person_id: person.id } : undefined;
  return axios.get('/activitypub/settings', { params });
};

const setEnabled = (enabled) => {
  return axios.put('/activitypub/settings', { enabled: Boolean(enabled) });
};

// Somebody on another server, by their handle (@alice@mastodon.example) or
// the address of their profile. The answer is the person, kept here.
const lookup = (query) => {
  return axios.get('/activitypub/lookup', { params: { q: query } });
};

// The servers this installation refuses: nothing is taken from them or
// sent to them. For super administrators, in the site's settings.
//
// A page at a time, by name: an installation that takes somebody else's
// list of servers to refuse has thousands. `q` narrows it to the names and
// reasons it is found in.
const blocks = ({ q = '', limit = 50, offset = 0 } = {}) => {
  return axios.get('/activitypub/blocks', {
    params: { q, limit, offset },
  });
};

// `domain` may be typed as a name, an address or a handle; the server keeps
// the name.
const addBlock = ({ domain, reason = '' }) => {
  return axios.post('/activitypub/blocks', { domain, reason });
};

const removeBlock = (domain) => {
  return axios.delete(`/activitypub/blocks/${encodeURIComponent(domain)}`);
};

export default {
  settings,
  setEnabled,
  lookup,
  blocks,
  addBlock,
  removeBlock,
};
