export default {
  cTitle: 'Photos',
  mTitle: 'Photos',
  // The photos card on a profile: its link to the Photos tab.
  seeAll: 'See all',
  composer: {
    namePlaceholder: "Photo's title ...",
    bodyPlaceholder: 'Write a description ...',
  },
  editor: {
    title: 'Photos in this post',
    edit: 'Edit photos',
    add: 'Add photos',
    // Where a post may hold a video instead.
    addOrVideo: 'Add photos or a video',
    addMore: 'Add another',
    limit: 'Up to {{max}} photos in a post. The first is shown first.',
    first: 'First',
    leftOut_one: 'A post holds {{max}} photos, so 1 of the ones you picked was left out.',
    leftOut_other: 'A post holds {{max}} photos, so {{count}} of the ones you picked were left out.',
    remove: 'Remove this photo',
    earlier: 'Move earlier',
    later: 'Move later',
    alt: 'ALT',
    describe: 'Describe this photo',
    described: 'Change the description',
    describeTitle: 'Describe this photo',
    altLabel: 'Alt description',
    askAlt: 'Add alt text',
    askAltWhy: 'It is read out to people who cannot see the photo, and shown when a photo does not load.',
    altWhy: 'Read out to people who cannot see the photo. This is not the caption: say what is in the picture.',
    altHelp: 'For example: a dwarf banana tree by a window, beside a grey armchair.',
    undescribed_one: '1 photo has no alt description yet.',
    undescribed_other: '{{count}} photos have no alt description yet.',
    uploading: 'Uploading',
    failed: 'This photo was not uploaded.',
    retry: 'Try again',
    unsupported: 'Only JPEG and PNG photos can be uploaded.',
    tooLarge: 'This photo is too large. The limit is 10 MB.',
    unreadable: 'This file could not be read as a photo.',
    stillUploading: 'The photos are still uploading. Try again in a moment.',
    needOne: 'A photo post needs at least one photo.',
    tooMany: 'That is more photos than a post can hold.',
    gone: 'One of the photos is no longer there. Close this and try again.',
    altTooLong: 'One of the descriptions is too long.',
    saved: 'The photos were updated.',
    notSaved: 'The photos could not be updated.',
  },
  // On a photo that has a description, for somebody who can see it.
  alt: {
    show: 'Read the description of this photo',
    title: 'Alt description',
  },
  // In place of the pictures of a post from another server that are no
  // longer stored here.
  removed: {
    kept: 'This post has a picture that is no longer kept here.',
    kept_other: 'This post has {{count}} pictures that are no longer kept here.',
    show: 'Show the picture',
    show_other: 'Show the pictures',
    gone: 'The picture of this post is no longer available on {{domain}}.',
    gone_other: 'The {{count}} pictures of this post are no longer available on {{domain}}.',
    failed: 'They could not be fetched just now. Try again in a moment.',
  },
  slides: {
    position: '{{index}} of {{total}}',
    next: 'Next photo',
    previous: 'Previous photo',
    // A slide on a profile whose post holds more photos.
    album: 'Several photos',
  },
  settings: {
    photo: {
      add: 'Who can post photos on this profile?',
      addcomment: 'Who can reply to photos?',
    },
    set: {
      add: 'Who can create sets on this profile?',
      addcomment: 'Who can reply to photo sets?',
    },
  },
};
