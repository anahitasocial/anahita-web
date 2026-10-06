// Whether the viewer may like a post or a reply.
//
// The server answers it as authorized.like — from the check like-service
// enforces — on posts, feed items and replies. Where a response does not
// carry the answer, liking stays offered and the server still
// refuses what it must.
//
// Only liking is gated. Taking a like back is always allowed, so callers pass
// whether the viewer has already liked it.
const canLike = (node) => {
  const answer = node && node.authorized && node.authorized.like;

  if (typeof answer === 'boolean') {
    return answer;
  }

  return true;
};

export default {
  canLike,
};
