// The kinds of notification the services send (`type`), as
// anahita-services' docs/notifications.md lists them. Each has its words in
// the `notifications` strings, by its name in camel case (`reply_add`,
// `replyAdd`), and a test keeps it so; a kind the app does not know is shown
// with the words `other`. An edit tells nobody (the user, 2026-10-19).
const KINDS = [
  'note_add',
  'article_add',
  'photo_add',
  'topic_add',
  'video_add',
  'reply_add',
  'quote_add',
  'repost_add',
  'voteup',
  'actor_mention',
  'actor_mention_reply',
  // Somebody in a photo or a video (roadmap row 103): asked, tagged at
  // once, and the author told of a yes.
  'actor_tag_request',
  'actor_tag',
  'actor_tag_accept',
  'actor_follow',
  'actor_follow_request',
  'actor_follow_request_accept',
  'actor_invite',
  'actor_invite_accept',
  'admin_add',
  'event_rsvp',
  'event_changed',
  'event_cancelled',
  'event_reminder',
];

export default {
  KINDS,
};
