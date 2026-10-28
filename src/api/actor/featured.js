import axios from 'axios';

// Whether the installation features this actor: offered to new members during
// onboarding. Super administrators only; the server refuses anybody else.
//
// 200 when it changed, 204 when it was already so, 409 for an actor that is
// disabled, archived or deleted and so cannot be featured.
const edit = (namespace) => {
  return (actor, featured) => {
    return axios.patch(`/${namespace}/${actor.id}/featured`, { featured });
  };
};

// The ones the installation features, for onboarding: the ordinary list told
// featured, but for events, which have no list of every one, and so one of
// their own (GET /events/featured).
const browse = (namespace) => {
  return (params = {}) => {
    return namespace === 'events'
      ? axios.get('/events/featured', { params })
      : axios.get(`/${namespace}/`, { params: { ...params, featured: true } });
  };
};

export default (namespace) => {
  return {
    edit: edit(namespace),
    browse: browse(namespace),
  };
};
