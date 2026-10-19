export default {
  TYPES: {
    ACTOR: [
      'node.actor.group-service.group.v1',
      'node.actor.person-service.person.v1',
    ],
    // Every kind of post there is: notes, articles and topics are
    // text-service's. The PHP application's names (note-service and the
    // rest) were here, and left Get notifications and Who can reply out of
    // every post's menu but a photo's.
    MEDIUM: [
      'node.medium.text-service.note.v1',
      'node.medium.text-service.article.v1',
      'node.medium.text-service.topic.v1',
      'node.medium.photo-service.photo.v1',
      'node.medium.video-service.video.v1',
    ],
    FEED: [
      'node.base.feed-service.repost.v1',
    ],
  },
  SERVICES: {
    ACTOR: [
      'group-service',
      'person-service',
    ],
    MEDIUM: [
      'text-service',
      'photo-service',
      'video-service',
    ],
  },
};
