// People in a photo or a video (roadmap row 103).
export default {
  with: 'With {{people}}',
  waiting: 'waiting',
  accept: 'Accept',
  decline: 'Decline',
  removeMe: 'Remove me',
  menu: 'Tag people',
  dialog: {
    title: 'Tag people',
    description: 'Say who is in this photo or video. Each person decides: some are tagged at once, some are asked first, and some cannot be tagged.',
    who: 'People in it',
    hint: 'Up to {{max}}.',
  },
  alerts: {
    saved: 'Saved.',
    asked_one: '{{names}} is asked first.',
    asked_other: '{{names}} are asked first.',
    refused_one: "{{names}} can't be tagged.",
    refused_other: "{{names}} can't be tagged.",
    accepted: "You're in this post.",
    declined: 'You were taken out.',
    error: 'That did not work. Please try again.',
  },
};
