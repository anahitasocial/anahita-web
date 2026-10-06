import {
  shape,
  number,
  string,
  arrayOf,
  bool,
  object,
} from 'prop-types';

import ActorType from './Actor';
import PersonType from './Person';
import ImageUrls from './ImageUrls';

export default shape({
  id: number,
  owner: ActorType,
  type: string,
  name: string,
  alias: string,
  body: string,
  imageURLs: ImageUrls,
  coverURLs: ImageUrls,
  administrators: arrayOf(PersonType),
  followerCount: number,
  subscriberCount: number,
  author: PersonType,
  createdAt: string,
  editor: PersonType,
  updatedAt: string,
  isAdministrated: bool,
  isLeader: bool,
  isSubscribedByViewer: bool,
  repostCount: number,
  isRepostedByViewer: bool,
  quoteCount: number,
  isQuotedByViewer: bool,
  commentCount: number,
  // On a reply: the post at the top of its thread, with its owner.
  rootId: number,
  root: object,
});
