import axios from 'axios';

// The signed-in viewer's onboarding. No person id on either: the server acts
// on whoever is signed in, like /agreements.

// read returns { data: { invitedBy } }: the alias of whoever invited the
// viewer, or null. The inviter's profile is read through /people/:alias, so
// blocks and disabled accounts are handled there.
const read = () => {
  return axios.get('/onboarding');
};

// complete records that the viewer has been through the flow, whether they
// filled the steps in or skipped them.
const complete = () => {
  return axios.patch('/onboarding');
};

export default {
  read,
  complete,
};
