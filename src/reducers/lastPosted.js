// The post the viewer last made, from the + button or anywhere else: a
// note, photos, a video, an article or a topic, published, not a reply. An
// open feed it belongs in puts it at its head at once (feed/Leaders,
// feed/Actor), instead of when it next asks what is new, or never.
const POSTED = /^(NOTES|PHOTOS|VIDEOS|ARTICLES|TOPICS)_ADD_SUCCESS$/;

export default (state = null, action) => {
  if (!POSTED.test(action.type)) {
    return state;
  }
  const { node } = action;
  if (!node || !node.id || node.rootId || node.parentId || node.draft) {
    return state;
  }
  return node;
};
