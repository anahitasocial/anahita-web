export default {
  medium: {
    description: 'Description',
    title: 'Title',
  },
  stepper: {
    position: '{{index}} of {{total}}',
    next: 'Next post',
    previous: 'Previous post',
    permalink: 'Open permalink',
    home: 'Go home',
    open: 'Open in the lightbox',
    zoomIn: 'Zoom in to full size',
    zoomOut: 'Zoom out to fit',
  },
  confirm: {
    delete: 'Do you want to delete this post?',
  },
  // Pinning a post to the profile it is on.
  pin: {
    pin: 'Pin to profile',
    unpin: 'Unpin',
    label: 'Pinned',
    pinned: 'Pinned. It now comes first on the profile.',
    unpinned: 'Unpinned.',
    failed: 'That could not be done.',
  },
  // A post's interactions: who liked, reposted, quoted and replied.
  activity: {
    title: 'Interactions',
    likes: 'Likes {{ count }}',
    reposts: 'Reposts {{ count }}',
    quotes: 'Quotes {{ count }}',
    replies: 'Replies {{ count }}',
    none: 'Nothing here that you can see.',
    failed: 'This list could not be loaded.',
    open: 'Open',
  },
  // Saving a post to find it again. Private to whoever saved it.
  saved: {
    save: 'Save',
    remove: 'Remove from saved',
    saved: 'Saved. It is in the Saved tab of your profile.',
    removed: 'Removed from saved.',
    failed: 'That could not be done.',
    empty: 'Nothing saved yet.',
    private: 'Only you can see what you save. Nobody is told that you saved their post.',
    loadFailed: 'Your saved posts could not be loaded.',
  },
  // The language button in the composer.
  language: {
    label: 'Language: {{ name }}',
  },
};
