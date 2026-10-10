export default {
  story: {
    title: 'Stories',
    description: 'Share ephemeral updates with your followers.',
    addPermissions: {},
  },
  feed: {
    title: 'Feed',
    description: 'Recieve updates from your socialgraph in chronological order.',
    addPermissions: {},
  },
  socialgraph: {
    title: 'Social Graph',
    description: 'See your social graph and manage your followers.',
    addPermissions: {
      title: 'Permissions',
      follower: 'Who can add a follower?',
      invite: 'Who can invite people to follow?',
    },
  },
  text: {
    title: 'Text',
    description: 'Text-based posts to share with your followers.',
    addPermissions: {
      title: 'Permissions',
      note: 'Who can post a note?',
      article: 'Who can post an article?',
      topic: 'Who can start a topic?',
      comment: 'Who can reply?',
      like: 'Who can like?',
    },
  },
  photo: {
    title: 'Photos',
    description: 'Share your photos with your followers.',
    addPermissions: {
      title: 'Permissions',
      photo: 'Who can post a photo?',
      comment: 'Who can reply?',
      like: 'Who can like?',
    },
  },
};
