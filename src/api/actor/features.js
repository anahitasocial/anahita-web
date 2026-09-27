/* eslint camelcase: "off" */
import axios from 'axios';

// Takes the node rather than (id, features) so it fits the shared edit action
// in actions/create.js, which calls api.edit(node). An empty features list
// clears the actor's override and the server defaults apply again.
const edit = (namespace) => {
  return (node) => {
    return axios.patch(`/${namespace}/${node.id}/features`, {
      id: node.id,
      features: node.features,
    });
  };
};

export default (namespace) => {
  return {
    edit: edit(namespace),
  };
};
