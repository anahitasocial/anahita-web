// The card a note carries for a link in it: finding the link, and where
// the card's picture is read from.

const LINK = /https?:\/\/[^\s<>"')\]]+/i;

// The first link in a text, as it was typed, or ''. What follows a link in
// a sentence, a full stop or a comma, is not part of it. The server finds
// it the same way: anahita-libs/linkpreviews#FirstURL.
const firstURL = (text = '') => {
  const found = String(text || '').match(LINK);
  return found ? found[0].replace(/[.,;:!?]+$/, '') : '';
};

// The link a card may be asked for, or '' when the text has none. A
// YouTube or Vimeo link is one like any other: nothing plays another site's
// videos here, so its card is what leads to it.
const urlToPreview = (text = '') => {
  return firstURL(text);
};

// Whether a note's card is drawn: it has one, with a title.
const isShown = (preview) => {
  return Boolean(preview && preview.url && preview.title);
};

// The picture is this installation's own copy, sent as a path under the
// API.
const imageOf = (preview, base = process.env.REACT_APP_API_BASE_URL || '') => {
  if (!preview || !preview.image) {
    return '';
  }
  if (/^https?:\/\//i.test(preview.image)) {
    return preview.image;
  }
  return `${String(base).replace(/\/+$/, '')}/${String(preview.image).replace(/^\/+/, '')}`;
};

// The site a card is from, where the page did not say: its host, without
// the www.
const siteOf = (preview) => {
  if (!preview) {
    return '';
  }
  if (preview.siteName) {
    return preview.siteName;
  }
  try {
    return new URL(preview.url).hostname.replace(/^www\./, '');
  } catch (e) {
    return '';
  }
};

export default {
  firstURL,
  urlToPreview,
  isShown,
  imageOf,
  siteOf,
};
