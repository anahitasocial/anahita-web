// The composer: the one box a post is written in, and the extended composer
// for writing at length.
export default {
  newPost: 'New post',
  close: 'Close',
  // Opens the extended composer from the short box: an article or a topic.
  longContent: 'Long content',
  // The same button's word in the open box, where the row is full.
  expand: 'Expand',
  // What can be added to a post: the words beside each icon where there is
  // room, and the icon's name where it stands alone, on a phone.
  photo: 'Photo',
  gif: 'GIF',
  addGif: 'Add a GIF',
  video: 'Video',
  addVideo: 'Add a video',
  // The extended composer's heading, and the button where a profile takes
  // only long writing.
  writeLong: 'Write at length',
  // Said under the box where a profile takes pictures and videos but not
  // words alone.
  needsPicture: 'Add a picture or a video to post here.',
  // Under the title and the text of an article or a topic, when posting
  // without them.
  titleNeeded: 'A title of at least {{count}} characters.',
  bodyNeeded: 'Write something first.',
  // An article's cover, chosen in the extended composer.
  removeCover: 'Remove the cover',
  // After why the server would not take it.
  coverRefused: 'The article is posted without it; you can add a cover on the article.',
  // The extended composer's tabs.
  // The extended composer's text, and the buttons above it.
  tooLong: 'At most {{count}} characters.',
  editor: {
    bold: 'Bold',
    italic: 'Italic',
    heading: 'Heading',
    bullets: 'Bulleted list',
    numbers: 'Numbered list',
    quote: 'Quote',
    code: 'Code',
    link: 'Link',
    linkAddress: 'Address',
    unlink: 'Remove link',
    apply: 'Apply',
    resize: 'Drag to change the height',
    removeEmbed: 'Remove',
    showAsLink: 'Show as a link',
    media: 'Photos and videos',
  },
  // The library of one's own photos and videos, in the editor.
  library: {
    title: 'Your media',
    photos: 'Photos',
    videos: 'Videos',
    upload: 'Upload',
    uploadNote: 'Put up here, it is in your library and in this writing only: not in your feed or on your profile.',
    insert: 'Insert',
    chooseVideo: 'Choose a GIF or a video',
    preparing: 'Preparing your video. It goes in as soon as it is ready.',
    none: {
      photos: 'No photos yet.',
      videos: 'No videos yet.',
    },
    untitled: {
      photos: 'Photo',
      videos: 'Video',
    },
  },
  // What a post's fields are called, the same in every form: a title; the
  // content of writing; the description of a photo or a video, as
  // WordPress says.
  fields: {
    title: 'Title',
    content: 'Content',
    description: 'Description',
  },
  // Drafts: articles and topics still being written, kept on the server.
  drafts: {
    title: 'Drafts',
    save: 'Save draft',
    saved: 'Draft saved. Only you can see it.',
    notSaved: 'The draft could not be saved.',
    none: 'No drafts here yet.',
    new: 'Start a new one',
    remove: 'Delete draft',
    untitled: 'Untitled',
  },
  kinds: {
    article: 'Article',
    topic: 'Topic',
  },
  // A video handed over without a title, in the list of those being
  // prepared.
  untitledVideo: 'Video',
};
