// How long what people write may be: the same numbers as the services'
// anahita-libs/constants/limits.go, and fit for the networks it goes to
// (the user, 2026-10-17). The services' docs/api.md lists them, and why.
//
// A browser counts an emoji as two where the services count one, so the
// browser is the stricter of the two, and never offers what is refused.
export default {
  // A person's, a group's, an event's name: Bluesky's 64.
  DISPLAY_NAME_MAX: 64,
  // A username, and so a handle: Mastodon's.
  USERNAME_MIN: 3,
  USERNAME_MAX: 30,
  // What a person or a group says of itself: Mastodon's 500.
  BIO_MAX: 500,
  // A post's title.
  TITLE_MAX: 100,
  // What a post says, a reply too; and an event's details.
  POST_BODY_MAX: 8000,
  // A place's name.
  PLACE_NAME_MAX: 100,
  // An image's description, as written here: what Bluesky's app takes.
  ALT_TEXT_MAX: 2000,
  // What other networks show of a post (bsky.PostMax and ap.PicturesShownMax
  // in the services): Bluesky's 300 letters, and the four pictures of a
  // stock Mastodon server and Bluesky. A post over either goes out with a
  // link to the rest here.
  BLUESKY_POST_MAX: 300,
  PICTURES_SHOWN_MAX: 4,
};
