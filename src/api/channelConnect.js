import axios from 'axios';

// A channel's website feed, from syndication-service (anahita-services
// roadmap row 147, phase 4): the site's feed found, its domain proved, and
// the feed connected to a channel its admins look after; shown and
// disconnected in the channel's settings. The channel itself is a profile
// like a group, under /channels/ (the `channels` namespace).
//
// Refusals say why as `error`: not_a_domain, no_feed, unreadable,
// feed_not_on_domain, private_feed, feed_taken, has_feed, not_proved.

// The site's feed, and the token to prove its domain with.
const start = (siteUrl) => {
  return axios.post('/channels/_connect', { siteUrl });
};

// Whether the token is in the TXT record or the file: { proved, method }.
const check = (connection) => {
  return axios.post(`/channels/_connect/${connection.id}/check`);
};

// The channel's feed: { feedUrl, siteUrl, state, readAt }; 404 with none.
const read = (channel) => {
  return axios.get(`/channels/_connect/feeds/${channel.id}`);
};

// The proved connection's feed, connected to the channel.
const connect = (channel, connection) => {
  return axios.put(`/channels/_connect/feeds/${channel.id}`, {
    connectionId: connection.id,
    feedUrl: connection.feedUrl,
  });
};

// Read no more; the posts it brought stay.
const disconnect = (channel) => {
  return axios.delete(`/channels/_connect/feeds/${channel.id}`);
};

export default {
  start,
  check,
  feed: { read, connect, disconnect },
};
