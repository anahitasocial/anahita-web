import {
  shape,
  number,
  string,
} from 'prop-types';

import ImageUrls from './ImageUrls';

// One outstanding invitation.
//
// No token. The secret is in the email that was sent and nowhere else —
// a list of pending invites has no business carrying links that let
// whoever opens it claim any of them.
//
// author is still sent, and is now always the viewer: the browse
// endpoint scopes on created_by. Kept on the shape because the
// response carries it, but the screen no longer renders it — the same
// name on every row is not information.
export default shape({
  id: number,
  recipientEmail: string,
  // pending, used, or expired.
  status: string,
  createdAt: string,
  author: shape({
    id: number,
    type: string,
    alias: string,
    name: string,
    avatarUrls: ImageUrls,
  }),
});
