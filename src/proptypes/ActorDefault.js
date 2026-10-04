import personDefault from './PersonDefault';
import imageUrlsDefault from './ImageUrlsDefault';

export default {
  id: null,
  type: 'node.actor.person-service.person.v1',
  name: '',
  alias: '',
  body: '',
  features: [],
  commands: [],
  avatarUrls: imageUrlsDefault,
  coverUrls: imageUrlsDefault,
  administrators: [],
  followerCount: 0,
  subscriberCount: 0,
  isSubscribedByViewer: false,
  author: personDefault,
  createdAt: '0000-00-00 00:00:00',
  editor: personDefault,
  updatedAt: '0000-00-00 00:00:00',
  isAdministrated: false,
  isLeader: false,
  websiteUrl: '',
};
