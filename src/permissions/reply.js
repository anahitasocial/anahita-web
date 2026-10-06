// Whether the viewer may reply to a post.
//
// The server answers it as authorized.comment on the post, from the rule for
// replies: the profile's access, the viewer's relationship to it, the
// profile's permissions, and who the post's author lets reply. The name of
// the field is from when replies were comments. Worked out here it drifted;
// read from there it cannot.
//
// A post whose response does not carry the answer keeps the old rule, any
// saved post, and the server still refuses what it must.
const canAdd = (node) => {
  const answer = node && node.authorized && node.authorized.comment;

  if (typeof answer === 'boolean') {
    return answer;
  }

  return Boolean(node) && node.id > 0;
};

export default {
  canAdd,
};
