export default {
  cTitle: 'Startseite',
  mTitle: 'Startseite',
  // The home page of somebody who is not signed in.
  guest: {
    signIn: 'Anmelden',
    join: 'Profil erstellen',
    people: '{{ formatted }} Person',
    people_other: '{{ formatted }} Personen',
    posts: '{{ formatted }} Beitrag',
    posts_other: '{{ formatted }} Beiträge',
    federated: 'Teil des Fediverse',
    bluesky: 'Mit Bluesky verbunden',
    reasons: {
      follow: {
        title: 'Personen, Gruppen und Veranstaltungen',
        body: 'Folge den Personen, Gruppen und Veranstaltungen, die dir wichtig sind, und lies an einem Ort, was sie veröffentlichen.',
      },
      feeds: {
        title: 'Feeds, die du selbst gestaltest',
        body: 'Stell dir eigene Feeds aus Hashtags, Orten und Profilen deiner Wahl zusammen. Nichts wird hinter deinem Rücken sortiert: Das Neueste kommt zuerst.',
      },
      yours: {
        title: 'Was du veröffentlichst, bleibt deins',
        body: 'Du entscheidest bei jedem Beitrag, wer ihn sieht, und du kannst jederzeit eine Kopie von allem mitnehmen, was du erstellt hast.',
      },
      // On an installation that takes part in other networks: which.
      networks: {
        both: {
          title: 'Teil des Fediverse',
          body: 'Folge Leuten auf Mastodon und Bluesky, und lass dir von ihnen folgen und antworten, ohne diese Website zu verlassen. Sie spricht beide Protokolle: ActivityPub und das AT Protocol.',
        },
        activitypub: {
          title: 'Teil des Fediverse',
          body: 'Folge Leuten auf Mastodon und den anderen Servern des Fediverse, und lass dir von ihnen folgen und antworten, ohne diese Website zu verlassen. Sie spricht ihr Protokoll, ActivityPub.',
        },
        atproto: {
          title: 'Mit Bluesky verbunden',
          body: 'Folge Leuten auf Bluesky und antworte ihnen mit deinem eigenen Bluesky-Konto, ohne diese Website zu verlassen. Sie spricht das Protokoll von Bluesky, das AT Protocol.',
        },
      },
    },
    lookAround: 'Schau dich um',
    places: {
      people: 'Personen',
      groups: 'Gruppen',
      hashtags: 'Hashtags',
      about: 'Über diese Website',
    },
    runsOn: 'Diese Website läuft mit',
    runsOnAfter: ', freier Software für Gemeinschaften.',
  },
  // Shown in place of every page to somebody who is not signed in, on an
  // installation that is members-only (SITE_READ_ACCESS=registered).
  membersOnly: {
    cTitle: 'Diese Website ist für ihre Mitglieder',
    cDescription: 'Melde dich an, um sie zu lesen. Wer nicht angemeldet ist, sieht hier nichts.',
    signIn: 'Anmelden',
  },
  // For somebody who is not signed in, on an installation that shows
  // visitors only the start of what is public (SITE_READ_ACCESS=preview).
  preview: {
    cTitle: 'Du siehst eine Vorschau',
    cDescription: 'Melde dich an, um ganze Beiträge, Antworten und alles nach der ersten Seite zu lesen.',
    signIn: 'Anmelden',
    readMore: 'Anmelden, um mehr zu lesen',
    comments: 'Anmelden, um die Antworten zu lesen',
    followers: 'Anmelden, um zu sehen, wer wem folgt',
  },
};
