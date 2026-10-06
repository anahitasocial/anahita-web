// Quote posts: who may quote, and what a note says about the post it quotes.
//
// The server decides both (anahita-services, permissions/quote.go). This
// holds the values, and reads the answers.

const ANYONE = 'anyone';
const FOLLOWERS = 'followers';
const NOBODY = 'nobody';

// In the order they are offered: widest first.
const POLICIES = [ANYONE, FOLLOWERS, NOBODY];

// A policy as this app holds it. Something unknown is "not said".
const normalize = (value) => {
  return POLICIES.includes(value) ? value : '';
};

// The policy a post is quoted under: its own, or its author's, or anyone.
const effective = (postPolicy, authorPolicy) => {
  return normalize(postPolicy) || normalize(authorPolicy) || ANYONE;
};

// Whether the viewer may quote a post, as the server answered on it. A post
// that carries no answer cannot be quoted from here: the button is for where
// the answer is known.
const canQuote = (post) => {
  return Boolean(post && post.authorized && post.authorized.quote === true);
};

// What a note carries about the post it quotes: 'shown', 'unavailable',
// 'detached', or '' for a note that quotes nothing or whose quote was not
// sent.
const stateOf = (quote) => {
  if (!quote) {
    return '';
  }
  if (quote.state) {
    return quote.state;
  }
  return quote.post && quote.post.id ? 'shown' : '';
};

// Whether the viewer wrote the post a note quotes, and so may take it out.
const isQuotedAuthor = (quote, viewer) => {
  return Boolean(
    stateOf(quote) === 'shown' &&
    viewer && viewer.id &&
    quote.post.author && quote.post.author.id === viewer.id,
  );
};

// Why the server refused a quote, as a string to show.
const refusalKey = (error) => {
  const data = error && error.response && error.response.data;
  const reason = data && data.error === 'quote_not_allowed' ? data.reason : '';
  const known = ['policy', 'not_public', 'blocked', 'unavailable'];
  return known.includes(reason) ?
    `replies:quote.refused.${reason}` :
    'replies:quote.refused.other';
};

export default {
  ANYONE,
  FOLLOWERS,
  NOBODY,
  POLICIES,
  canQuote,
  effective,
  isQuotedAuthor,
  normalize,
  refusalKey,
  stateOf,
};
