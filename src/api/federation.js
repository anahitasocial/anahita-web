import axios from 'axios';
import federation from '../utils/federation';

// Being on the fediverse: found and followed from Mastodon and the other
// servers that speak ActivityPub. And reading Bluesky, which is a service
// of its own.
//
// Each service is optional. Where there is none the gateway answers with an
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

// The viewer's own choice, or, with a website, its administrators'.
const setEnabled = (enabled, profile = null) => {
  const params = profile && profile.id ? { person_id: profile.id } : undefined;
  return axios.put('/activitypub/settings', { enabled: Boolean(enabled) }, { params });
};

// Somebody on another server, by their handle (@alice@mastodon.example,
// alice.bsky.social) or the address of their profile. The answer is the
// person, kept here. Which service is asked is told by how the handle is
// written: see utils/federation.js#lookupKind.
const lookup = (query) => {
  const service = federation.lookupKind(query) === federation.ATPROTO ? 'atproto' : 'activitypub';
  return axios.get(`/${service}/lookup`, { params: { q: query } });
};

// The viewer's own Bluesky account, connected or not: what they do here to
// things from Bluesky is done there as it. Where the installation does not
// write to Bluesky, the answer is an error, taken for there being nothing
// to show.
//
// `profileId`, when given, is a website the viewer looks after: its own
// Bluesky account, which its notes are posted to.
const forProfile = (profileId) => {
  return profileId ? { params: { profile_id: profileId } } : {};
};

const blueskySettings = (profileId = 0) => {
  return axios.get('/atproto/settings', forProfile(profileId));
};

// `appPassword` is a password made for an app, on Bluesky. The server
// exchanges it for a token and does not keep it.
const connectBluesky = ({ handle, appPassword }, profileId = 0) => {
  return axios.put('/atproto/settings', { handle, app_password: appPassword }, forProfile(profileId));
};

const disconnectBluesky = (profileId = 0) => {
  return axios.delete('/atproto/settings', forProfile(profileId));
};

// Follows here the accounts the viewer's Bluesky account follows already.
// It is begun and not waited for: a long list takes minutes.
//
// `limit` is how many, beginning with the ones followed most lately.
const importBlueskyFollows = (limit) => {
  return axios.post('/atproto/settings/import-follows', { limit });
};

// What that would do, before it is done: how many accounts the viewer
// follows on Bluesky, and the most that are followed here in one go.
const previewBlueskyFollows = () => {
  return axios.get('/atproto/settings/import-follows');
};

// The pictures of a post from another server, copied here again after
// they were removed for its age. Asked of whichever service the post came
// through, which is told by its address.
const restorePictures = (medium) => {
  const service = (medium.uri || '').startsWith('at://') ? 'atproto' : 'activitypub';
  return axios.post(`/${service}/posts/${medium.id}/pictures`);
};

// The servers this installation refuses: nothing is taken from them or
// sent to them. For super administrators, in the site's settings.
//
// A page at a time, by name: an installation that takes somebody else's
// list of servers to refuse has thousands. `q` narrows it to the names and
// reasons it is found in.
const blocks = ({ q = '', limit = 50, offset = 0 } = {}) => {
  return axios.get('/activitypub/blocks', {
    params: { q, limit, start: offset },
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
  restorePictures,
  blueskySettings,
  connectBluesky,
  disconnectBluesky,
  importBlueskyFollows,
  previewBlueskyFollows,
  blocks,
  addBlock,
  removeBlock,
};
