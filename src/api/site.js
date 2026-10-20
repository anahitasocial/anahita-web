import axios from 'axios';

// What the site says about itself (roadmap row 102): its rules, with the
// version agreed to, its promises, and the rules a new group may start from
// (`rules`, `promises`, `rule_suggestions`). Every text in every language it
// is written in, keyed by the language's name ("en-CA", "es-419").
//
// Its own instance, as api/publicClient's and api/reauth's are, for both of
// their reasons: it sends no credentials, since the answer is public and
// open to any origin, which a browser refuses a credentialed request for;
// and its keys are left as they come, since a language's name rewritten
// into camelCase ("enCa") is no longer one.
const client = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  withCredentials: false,
});

const read = () => {
  return client.get('/site');
};

export default {
  read,
};
