export default {
  // What an article or a topic holds, under its opening in a list.
  summary: {
    photos_one: '{{count}} photo',
    photos_other: '{{count}} photos',
    videos_one: '{{count}} video',
    videos_other: '{{count}} videos',
    citations_one: '{{count}} citation',
    citations_other: '{{count}} citations',
  },
  // What an article shows within itself, and lists at its end.
  embed: {
    in: 'in',
    citations: 'Citations',
    opensNewTab: 'Opens in a new tab',
    readMore: 'Read more',
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
  // An avatar or a cover the server would not take.
  image: {
    tooLarge: 'This image is too large. The limit is 10 MB.',
    unsupported: 'Only JPEG and PNG images can be uploaded.',
    unreadable: 'This file could not be read as an image.',
    failed: 'The image could not be uploaded.',
  },
  // Saving a post to find it again. Private to whoever saved it.
  saved: {
    title: 'Saved',
    private: 'Only you can see the saved items',
    save: 'Save',
    remove: 'Remove from saved',
    saved: 'Saved. It is under Saved in the menu.',
    removed: 'Removed from saved.',
    failed: 'That could not be done.',
    empty: 'Nothing saved yet.',
    loadFailed: 'Your saved posts could not be loaded.',
  },
  // The language button in the composer.
  language: {
    label: 'Language: {{ name }}',
  },
  // Downloading a photo or a video, where whoever posted it allows it.
  download: {
    allowed: 'Downloads allowed. Press to stop people downloading this.',
    notAllowed: 'Downloads not allowed. Press to let people who can see this download it.',
    allow: 'Allow download',
    stop: 'Do not allow download',
    failed: 'That could not be changed.',
    photo: 'Photo {{number}} of {{count}}',
    default: {
      title: 'Downloads',
      label: 'Let people download the photos and videos posted here',
      help: 'What a new photo or video starts with. Only people who can see a post can download it, each post can be set its own way, and changing this changes nothing already posted.',
      saved: 'Saved.',
      notSaved: 'That could not be saved.',
    },
  },
};
