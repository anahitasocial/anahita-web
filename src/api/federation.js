import axios from 'axios';

// Being on the fediverse: found and followed from Mastodon and the other
// servers that speak ActivityPub.
//
// The service is optional. Where there is none the gateway answers with an
// error, and whoever asked takes that as there being no fediverse here and
// draws nothing: see utils/federation.js#isAbsent.

// Whether the viewer is on the fediverse, whether they could be, and what
// they are or would be called there.
const settings = () => {
  return axios.get('/activitypub/settings');
};

const setEnabled = (enabled) => {
  return axios.put('/activitypub/settings', { enabled: Boolean(enabled) });
};

// Somebody on another server, by their handle (@alice@mastodon.example) or
// the address of their profile. The answer is the person, kept here.
const lookup = (query) => {
  return axios.get('/activitypub/lookup', { params: { q: query } });
};

export default {
  settings,
  setEnabled,
  lookup,
};
