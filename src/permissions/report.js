import utils from '../utils';

const {
  isActor,
  isRegistered,
} = utils.node;

// Who answers for a node: the actor itself for a person or a group, the
// author for a post or a comment, and nobody for a hashtag or a place.
const responsibleId = (node) => {
  if (isActor(node)) {
    return node.id;
  }

  return (node.author && node.author.id) || 0;
};

// Whether to offer "Report" on a node.
//
// Anybody signed in may report anything they can see, except themselves
// and what they wrote. The server enforces the same, and the further rule
// that it must be something they may see; this only decides whether the
// menu item is drawn.
const canAdd = (viewer, node) => {
  if (!isRegistered(viewer) || !node || !node.id) {
    return false;
  }

  return responsibleId(node) !== viewer.id;
};

export default {
  canAdd,
};
