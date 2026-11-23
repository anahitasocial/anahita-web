import async from './async';

const cover = async('cover');

// How wide a cover is to how tall. A profile's is a band across its page.
// An article's is the shape link cards are shown in, on Bluesky, Mastodon
// and wherever its link is pasted, so that its author sees the picture as
// everybody else will (the user, 2026-11-23).
export const PROFILE_COVER_RATIO = '3 / 1';
export const ARTICLE_COVER_RATIO = '1.91 / 1';

export default {
  EDIT: cover('edit'),
  ADD: cover('add'),
  DELETE: cover('delete'),
};
