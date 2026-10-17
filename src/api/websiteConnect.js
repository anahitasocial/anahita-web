import axios from 'axios';

// Connecting a website, from syndication-service: its feed found, its
// domain proved, and the website made. A website once made is a profile like a
// group, read and changed under /websites/ (api/create, the `websites`
// namespace).
//
// Refusals say why as `error`: not_a_domain, no_feed, unreadable,
// feed_not_on_domain, feed_taken, handle_taken, not_proved.

// The site's feed, and the token to prove its domain with.
const start = (siteUrl) => {
  return axios.post('/websites/_connect', { siteUrl });
};

// Whether the token is in the TXT record or the file: { proved, method }.
const check = (connection) => {
  return axios.post(`/websites/_connect/${connection.id}/check`);
};

// The website, once the domain is proved: { id, alias }.
const make = (connection, { name, alias, body }) => {
  return axios.post(`/websites/_connect/${connection.id}`, {
    feedUrl: connection.feedUrl,
    name,
    alias,
    body,
  });
};

export default {
  start,
  check,
  make,
};
