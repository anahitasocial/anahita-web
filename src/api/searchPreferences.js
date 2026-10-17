import axios from 'axios';

// The viewer's own weights for search's "Most relevant": how much each
// sign that something was found useful counts for them, as a step that
// multiplies the installation's own (docs/search.md).

// What they have set, what may be set, and to what.
const read = () => {
  return axios.get('/search/preferences');
};

// All of them at once, replacing what there was: one left out is as the
// installation has it.
const edit = (steps) => {
  return axios.put('/search/preferences', { steps });
};

export default {
  read,
  edit,
};
