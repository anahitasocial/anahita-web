export default {
  story: {
    title: 'Storys',
    description: 'Teile vergängliche Neuigkeiten mit deinen Followern.',
    addPermissions: {},
  },
  feed: {
    title: 'Feed',
    description: 'Erhalte Neuigkeiten aus deinem sozialen Netz in chronologischer Reihenfolge.',
    addPermissions: {},
  },
  socialgraph: {
    title: 'Soziales Netz',
    description: 'Sieh dein soziales Netz an und verwalte deine Follower.',
    addPermissions: {
      title: 'Berechtigungen',
      follower: 'Wer kann Follower hinzufügen?',
      invite: 'Wer kann Leute zum Folgen einladen?',
      mention: 'Wer kann dich erwähnen?',
    },
  },
  text: {
    title: 'Text',
    description: 'Textbeiträge, die du mit deinen Followern teilst.',
    addPermissions: {
      title: 'Berechtigungen',
      note: 'Wer kann eine Notiz veröffentlichen?',
      article: 'Wer kann einen Artikel veröffentlichen?',
      topic: 'Wer kann ein Thema starten?',
      comment: 'Wer kann antworten?',
      like: 'Wer kann mit „Gefällt mir“ markieren?',
    },
  },
  photo: {
    title: 'Fotos',
    description: 'Teile deine Fotos mit deinen Followern.',
    addPermissions: {
      title: 'Berechtigungen',
      photo: 'Wer kann ein Foto veröffentlichen?',
      comment: 'Wer kann antworten?',
      like: 'Wer kann mit „Gefällt mir“ markieren?',
    },
  },
};
