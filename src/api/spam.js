import axios from 'axios';

// Removing a person or a group as spam (roadmap row 102): a moderator's
// decision, at once and for good, with no thirty days. Administrators and
// super administrators; never somebody who runs the site, nor oneself.
// Answered 202 with the batch it was queued in.
const remove = (actor) => {
  const namespace = String(actor.type || '').includes('group') ? 'groups' : 'people';
  return axios.post(`/${namespace}/${actor.id}/spam`);
};

export default {
  remove,
};
