import {
  shape,
  number,
  string,
  arrayOf,
  bool,
  object,
} from 'prop-types';

import ActorType from './Actor';
import CommentType from './Comment';
import PersonType from './Person';
import ImageUrls from './ImageUrls';

export default shape({
  id: number,
  type: string,
  name: string,
  alias: string,
  body: string,
  portraitUrls: ImageUrls,
  // The images of a photo post, in order. The first is the one
  // portraitUrls shows. Not sent for other kinds of post.
  files: arrayOf(shape({
    id: string,
    position: number,
    altText: string,
    width: number,
    height: number,
    urls: object,
  })),
  coverUrls: ImageUrls,
  commands: arrayOf(string),
  subscriberCount: number,
  isSubscribedByViewer: bool,
  owner: ActorType,
  author: PersonType,
  createdAt: string,
  editor: PersonType,
  updatedAt: string,
  lastComment: CommentType,
  lastCommenter: PersonType,
  lastCommentTime: string,
  likesCount: number,
  dislikesCount: number,
  isLikedByViewer: bool,
  repostCount: number,
  isRepostedByViewer: bool,
  quoteCount: number,
  isQuotedByViewer: bool,
  commentCount: number,
  commentStatus: bool,
  // Who may reply: "anyone", "nobody", or groups joined by commas.
  replyAccess: string,
});
