import axios from 'axios';

// People in a photo or a video (roadmap row 103). Tagged by the post's
// author, approved by the person unless they let anybody tag them; a tag
// waiting is listed for the two of them only, with `pending`.

// Who is in a post: [{ person, pending }].
const browse = (post) => {
  return axios.get(`/people/tagged-in/${post.id}`);
};

// 201 tagged, 202 waiting for them, 409 `not_taggable` or `too_many`.
const add = (person, post) => {
  return axios.post(`/people/${person.id}/tags/${post.id}`);
};

// The person tagged saying yes.
const approve = (person, post) => {
  return axios.put(`/people/${person.id}/tags/${post.id}`);
};

// The person declining or leaving, or the author taking them out.
const remove = (person, post) => {
  return axios.delete(`/people/${person.id}/tags/${post.id}`);
};

export default {
  browse,
  add,
  approve,
  remove,
};
