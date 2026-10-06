import axios from 'axios';
import utils from '../utils';

// Pins a post to the profile it is on, so that it leads the profile, or
// takes the pin off. A profile has one pin: pinning moves it.
const set = (medium, pinned) => {
  const namespace = utils.node.getNamespace(medium);
  const path = `/${namespace}/${medium.id}/pin`;
  return pinned ? axios.put(path) : axios.delete(path);
};

export default {
  set,
};
