// Whether the viewer may comment on a post.
//
// The server answers it as authorized.comment on the post — from the check
// comment-service enforces, which depends on the profile's access, the
// viewer's relationship to it and the profile's permissions. Worked out here
// it drifted; read from there it cannot.
//
// A post whose response does not carry the answer yet (stories) keeps the old
// rule, any saved post, and the server still refuses what it must.
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
