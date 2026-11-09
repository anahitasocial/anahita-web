import axios from 'axios';

import utils from '../utils';
import warnings from '../utils/warnings';

// A post's content warning (anahita-services row 122), given, changed or
// taken off, under its own kind's address. `medium` needs its id and type.
const edit = (medium, warning) => {
  const namespace = utils.node.getNamespace(medium);
  return axios.patch(`/${namespace}/${medium.id}/warning`, {
    warning: warning.kind || '',
    ...(warning.kind === warnings.OTHER ? { warningText: warning.text } : {}),
  });
};

export default {
  edit,
};
