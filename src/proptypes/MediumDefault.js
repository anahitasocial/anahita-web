import ActorDefault from './ActorDefault';
import PersonDefault from './PersonDefault';
import ImageUrlsDefault from './ImageUrlsDefault';

export default {
  id: null,
  objectType: '',
  name: '',
  alias: '',
  body: '',
  portraitURL: ImageUrlsDefault,
  coverURL: ImageUrlsDefault,
  commands: [],
  subscriberCount: 0,
  isSubscribedByViewer: false,
  owner: ActorDefault,
  author: PersonDefault,
  createdAt: '0000-00-00 00:00:00',
  editor: PersonDefault,
  updatedAt: '0000-00-00 00:00:00',
  likesCount: 0,
  dislikesCount: 0,
  isLikedByViewer: false,
  repostCount: 0,
  isRepostedByViewer: false,
  quoteCount: 0,
  isQuotedByViewer: false,
  commentCount: 0,
  commentStatus: false,
};
