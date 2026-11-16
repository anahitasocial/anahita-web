// A channel, as a kind of profile (roadmap row 147): for now a website's feed
// to follow, here and from the fediverse (docs/channels.md in
// anahita-services). It was a Website, and before that Pulse.
export default {
  cTitle: 'Kanäle',
  mTitle: 'Kanäle',
  // What a website is here, where somebody meets the list.
  description: 'Der Feed einer Website als Kanal, dem man hier und aus dem Fediverse folgen kann.',
  connect: {
    cTitle: 'Verbinde deine Website',
    mTitle: 'Verbinde deine Website',
    intro: 'Jeder Website mit einem RSS-, Atom- oder JSON-Feed kann man hier folgen: einer WordPress- oder anderen Website, einer statischen Website, dem Changelog einer App, einem Podcast. Ihre Beiträge erreichen Leute hier und im Fediverse und führen sie zurück zu deiner Website.',
    steps: {
      site: 'Deine Website',
      proof: 'Zeig, dass sie dir gehört',
      website: 'Ihr Kanal hier',
    },
    site: {
      label: 'Adresse deiner Website',
      placeholder: 'example.com',
      help: 'Die Website oder ihr Feed. Der Feed muss auf derselben Domain liegen.',
      find: 'Feed suchen',
    },
    found: 'Feed „{{ title }}“ gefunden.',
    proof: {
      intro: 'Nur wer {{ domain }} verwaltet, kann sie verbinden. Leg dieses Token an einer der beiden Stellen ab, wo es dir leichter fällt, und prüf es dann.',
      token: 'Token',
      dnsTitle: 'Ein DNS-Eintrag',
      dns: 'Füge einen TXT-Eintrag mit diesem Namen hinzu, der das Token enthält:',
      fileTitle: 'Eine Datei auf deiner Website',
      file: 'Oder veröffentliche das Token, in einer eigenen Zeile, unter dieser Adresse:',
      check: 'Prüfen',
      notYet: 'Das Token ist noch an keiner der beiden Stellen. Ein neuer DNS-Eintrag kann eine Weile brauchen, bis er sichtbar ist: Prüf es in ein paar Minuten noch einmal.',
      proved: 'Nachgewiesen über {{ method }}.',
      methods: {
        dns: 'den DNS-Eintrag',
        file: 'die Datei auf deiner Website',
      },
      again: 'Das wird jeden Tag erneut geprüft. Fehlt es eine Woche lang, wird nichts mehr veröffentlicht, bis es wieder da ist.',
    },
    website: {
      name: 'Name',
      alias: 'Handle',
      aliasHelp: 'Ihre Adresse hier und im Fediverse: {{ handle }}. Buchstaben, Ziffern, - und _.',
      body: 'Beschreibung',
      connect: 'Verbinden',
      seen: 'Deine zehn neuesten Beiträge erscheinen sofort; was du ab jetzt veröffentlichst, folgt.',
    },
    copy: 'Kopieren',
    copied: 'Kopiert',
    done: 'Deine Website ist verbunden.',
    errors: {
      not_a_domain: 'Das ist keine Adresse einer Website.',
      no_feed: 'Dort wurde kein Feed gefunden. Gib die Adresse des Feeds selbst an, wenn die Website sie nicht nennt.',
      unreadable: 'Die Website konnte nicht gelesen werden. Prüf die Adresse und versuch es noch einmal.',
      feed_not_on_domain: 'Der Feed liegt auf einer anderen Domain, und du kannst nicht nachweisen, dass sie dir gehört.',
      private_feed: 'Dieser Feed ist privat: Er braucht eine Anmeldung, oder seine Adresse enthält ein Geheimnis. Die Beiträge eines Kanals sind öffentlich, deshalb kann nur ein öffentlicher Feed verbunden werden.',
      feed_taken: 'Dieser Feed ist schon verbunden.',
      handle_taken: 'Dieses Handle ist schon vergeben.',
      not_proved: 'Weise zuerst nach, dass die Domain dir gehört.',
      tooMany: 'Zu viele Versuche. Versuch es in einer Stunde noch einmal.',
      generic: 'Etwas ist schiefgelaufen. Bitte versuch es noch einmal.',
    },
  },
  // In its About card.
  about: {
    verified: 'Bestätigt',
  },
  settings: {
    info: 'Infos',
    admins: 'Admins',
    access: 'Blockiert',
    website: 'Auf deiner Website',
    fediverse: 'Fediverse',
    // Its card under Fediverse: off until one of its administrators turns
    // it on, as a person's is.
    fediverseCard: {
      enable: 'Leute auf anderen Servern sie finden und ihr folgen lassen',
      help: 'Leute auf Mastodon und anderen Servern des Fediverse können den Kanal dann über sein Handle finden und ihm folgen, und seine Notizen werden an sie geschickt.',
      handle: 'Ihr Handle',
      leavesWhenPrivate: 'Wird der Kanal ausgeschaltet oder gelöscht, verlässt er auch das Fediverse, als hättest du das hier ausgeschaltet.',
      leave: {
        title: 'Den Kanal aus dem Fediverse nehmen?',
        body: 'Jeder Server, der den Kanal kennt, wird gebeten, ihn, seine Notizen und seine Follower dort zu entfernen. Das lässt sich hier nicht rückgängig machen: Schaltest du es später wieder ein, nehmen Server, die ihn entfernt haben, ihn vielleicht nicht wieder auf, und niemand, der ihm gefolgt ist, folgt ihm dann noch.',
        confirm: 'Herausnehmen',
      },
      unavailable: {
        site_private: 'Diese Website behält ihre Inhalte für ihre Mitglieder, deshalb ist kein Kanal hier im Fediverse.',
        site_unreachable: 'Diese Website hat keine Adresse, die andere Server erreichen können, deshalb ist kein Kanal hier im Fediverse.',
        profile_not_public: 'Solange der Kanal ausgeschaltet oder gelöscht ist, kann er nicht im Fediverse sein.',
      },
    },
    blueskyHelp: 'Verbinde das eigene Bluesky-Konto des Kanals, auf Wunsch mit deiner Domain als Handle (@example.com): Seine Notizen werden auch dort veröffentlicht, und Leute auf Bluesky folgen ihm dort. Verwende ein App-Passwort, nicht das Passwort des Kontos selbst.',
    websiteIntro: 'Füge das in deine Website ein, um deine Leser:innen hierher zu führen.',
    snippetLabel: 'Folge unserem Kanal im Fediverse',
    disable: 'Ausschalten',
    disablePrompts: {
      description: 'Ausschalten verbirgt diesen Kanal vor allen, und die neuen Beiträge deiner Website erscheinen hier nicht mehr.',
      descriptionDisabled: 'Dieser Kanal ist ausgeschaltet. Er erscheint nirgends und veröffentlicht nichts.',
      reversible: 'Das lässt sich jederzeit rückgängig machen, und nichts wird gelöscht.',
      action: 'Ausschalten',
      actionEnable: 'Einschalten',
      disabled: 'Dieser Kanal wurde ausgeschaltet.',
      enabled: 'Dieser Kanal wurde eingeschaltet.',
      errors: {
        forbidden: 'Du darfst das nicht ändern.',
        lastSuperAdmin: 'Das ist die einzige Super-Administrator:in und kann nicht ausgeschaltet werden.',
        generic: 'Das konnte nicht geändert werden. Bitte versuch es noch einmal.',
      },
    },
    delete: 'Löschen',
    purge: 'Endgültig löschen',
    deletePrompts: {
      counts: {
        intro: 'In diesem Kanal, gerade jetzt:',
        posts: '{{ count }} Beitrag',
        posts_other: '{{ count }} Beiträge',
        replies: '{{ count }} Antwort',
        replies_other: '{{ count }} Antworten',
        followers: '{{ count }} Follower',
        followers_other: '{{ count }} Follower',
        admins: '{{ count }} Admin',
        admins_other: '{{ count }} Admins',
        memberSince: 'Verbunden am {{ date }}.',
      },
      description: 'Beim Löschen werden dieser Kanal hier, die Beiträge aus dem Feed deiner Website und die Antworten darunter entfernt. Deine Website selbst bleibt unberührt.',
      reversible: 'Das passiert nicht sofort. Sie wird gleich verborgen und nach {{ count }} Tagen endgültig gelöscht. Bis dahin können alle Admins sie auf dieser Seite wiederherstellen.',
      revoked: 'Ihre Follower hier und im Fediverse verlieren sie sofort.',
      handle: 'Das Handle {{ alias }} bleibt danach reserviert.',
      scheduled: 'Dieser Kanal ist zum Löschen vorgemerkt und wird am {{ date }} gelöscht.',
      restore: 'Diesen Kanal wiederherstellen',
      restored: 'Dieser Kanal wurde wiederhergestellt.',
      errors: {
        restoreFailed: 'Dieser Kanal konnte nicht wiederhergestellt werden. Vielleicht wurde er schon endgültig gelöscht.',
      },
    },
    sections: {
      danger: 'Gefahrenbereich',
    },
  },
  confirm: {
    delete: 'Möchtest du {{ name }} löschen?',
  },
};
