export default {
  settings: {
    title: 'Fediverse',
    enable: 'Let people on other servers find and follow me',
    help: 'People on Mastodon and other servers of the fediverse can then find you by your handle and follow you, and your public notes are sent to them. You can also follow people there.',
    handle: 'Your handle',
    warning: 'What is sent to another server cannot be called back. Deleting a note asks those servers to delete it too, and most do, but none has to.',
    leavesWhenPrivate: 'If you stop your profile being open to everybody, or your profile is disabled or deleted, you leave the fediverse as well, as if you had turned this off.',
    leave: {
      title: 'Leave the fediverse?',
      body: 'Every server that knows you will be told to remove you, your notes and your followers there, and you will stop following people on other servers. This cannot be undone from here: if you turn this on again later, servers that removed you may not take you back, and nobody who followed you will be following you.',
      confirm: 'Leave',
    },
    saved: 'Saved.',
    notSaved: 'That could not be saved. Please try again.',
    unavailable: {
      site_private: 'This site keeps what is on it to its members, so nobody on it is on the fediverse.',
      site_unreachable: 'This site has no address other servers can reach, so nobody on it is on the fediverse.',
      profile_not_public: 'Only a profile that everybody can see can be on the fediverse. Yours is not open to everybody: you can change that above, under "Access".',
    },
  },
  composer: {
    staysHere: 'This note will not be shared with the fediverse: only a note open to everybody is.',
  },
  leaving: {
    byClosing: 'This profile is on the fediverse, where only a profile open to everybody can be. Saving this takes it off the fediverse: other servers are told to remove it, its notes and its followers there, and may not take it back if it is opened again.',
    byClosingConfirm: 'Closing this profile also takes it off the fediverse. Every server that knows it will be told to remove it, its notes and its followers there. Opening the profile again later will not undo that: servers that removed it may not take it back.',
    confirm: 'Save and leave',
  },
  remote: {
    badge: 'From {{ domain }}',
    onAnotherServer: 'This person is on another server, {{ domain }}. What you see here is what that server shares with everybody.',
    viewOriginal: 'View on {{ domain }}',
    replyThere: 'Reply on {{ domain }}',
  },
  lookup: {
    title: 'On another server',
    prompt: 'Look up {{ query }} on its own server',
    button: 'Look up',
    looking: 'Asking {{ domain }}…',
    errors: {
      lookup_unreadable: 'That is not a handle or the address of a profile.',
      lookup_is_here: 'That is somebody on this site. Search for them by name.',
      lookup_not_found: 'Nobody was found by that name.',
      lookup_refused: 'This site does not connect to that server.',
      lookup_not_a_person: 'That is not somebody who can be followed from here.',
      lookup_failed: 'That server could not be reached, or did not answer in a way this site understands.',
      too_many_lookups: 'That is a lot of lookups. Please wait a few minutes.',
      site_private: 'This site keeps what is on it to its members, and does not look people up on other servers.',
      site_unreachable: 'This site cannot reach other servers.',
      failed: 'That did not work. Please try again.',
    },
  },
};
