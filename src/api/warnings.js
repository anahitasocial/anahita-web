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

// The viewer's choice of Show, Warn or Hide for each kind (row 122, phase
// 2): every kind, Warn where they have not chosen.
const preferences = (personId) => {
  return axios.get(`/people/${personId}/content-preferences`);
};

// Changes the kinds named; the others stay as they were.
const editPreferences = (personId, choices) => {
  return axios.patch(`/people/${personId}/content-preferences`, { choices });
};

export default {
  edit,
  preferences,
  editPreferences,
};
