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

export default (namespace) => {
  return {
    edit: edit(namespace),
  };
};
