import axios from 'axios';

// Suggestions of who to follow, from the installation's recommendation
// service.
//
// The service is optional. Where there is none the gateway answers with an
// error, and whoever asked takes that as there being no suggestions and
// draws nothing: see utils/recommendations.js#isAbsent.

// Who the viewer might follow, best first. `kind` is 'person' or 'group'.
const actors = ({ kind = 'person', limit = 10, context = 'home' } = {}) => {
  return axios.get('/recommendations/actors', { params: { kind, limit, context } });
};

const preferences = () => {
  return axios.get('/recommendations/preferences');
};

// Changes the choices sent, and leaves the others as they were.
const setPreferences = (choices) => {
  return axios.put('/recommendations/preferences', choices);
};

// The profiles the viewer said they were not interested in.
const dismissals = () => {
  return axios.get('/recommendations/dismissals');
};

// Not interested in this one, or taking that back.
const setDismissed = (actor, isDismissed) => {
  return isDismissed ?
    axios.post('/recommendations/dismissals', { actorId: actor.id }) :
    axios.delete(`/recommendations/dismissals/${actor.id}`);
};

export default {
  actors,
  preferences,
  setPreferences,
  dismissals,
  setDismissed,
};
