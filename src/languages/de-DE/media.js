export default {
  // What an article or a topic holds, under its opening in a list.
  summary: {
    photos_one: '{{count}} Foto',
    photos_other: '{{count}} Fotos',
    videos_one: '{{count}} Video',
    videos_other: '{{count}} Videos',
    citations_one: '{{count}} Quellenangabe',
    citations_other: '{{count}} Quellenangaben',
  },
  // What an article shows within itself, and lists at its end.
  // A post's Cited by tab: what cites it here.
  citations: {
    citedBy: 'Zitiert von',
    noneCitedBy: 'Noch zitiert nichts hier dies.',
  },
  embed: {
    in: 'in',
    citations: 'Quellenangaben',
    opensNewTab: 'Öffnet in einem neuen Tab',
    readMore: 'Weiterlesen',
    viewProfile: 'Profil ansehen',
  },
  stepper: {
    position: '{{index}} von {{total}}',
    next: 'Nächster Beitrag',
    previous: 'Vorheriger Beitrag',
    permalink: 'Permalink öffnen',
    home: 'Zur Startseite',
    open: 'In der Großansicht öffnen',
    zoomIn: 'Auf volle Größe vergrößern',
    zoomOut: 'Auf Fenstergröße verkleinern',
  },
  confirm: {
    delete: 'Willst du diesen Beitrag löschen?',
  },
  // Pinning a post to the profile it is on.
  pin: {
    pin: 'Am Profil anheften',
    unpin: 'Lösen',
    label: 'Angeheftet',
    pinned: 'Angeheftet. Er steht jetzt ganz oben im Profil.',
    unpinned: 'Gelöst.',
    failed: 'Das hat nicht geklappt.',
  },
  // A post's interactions: who liked, reposted, quoted and replied.
  activity: {
    title: 'Interaktionen',
    likes: 'Gefällt mir {{ count }}',
    reposts: 'Reposts {{ count }}',
    quotes: 'Zitate {{ count }}',
    replies: 'Antworten {{ count }}',
    none: 'Hier gibt es nichts, was du sehen kannst.',
    failed: 'Diese Liste konnte nicht geladen werden.',
    open: 'Öffnen',
  },
  // An avatar or a cover the server would not take.
  image: {
    tooLarge: 'Dieses Bild ist zu groß. Das Limit liegt bei 10 MB.',
    unsupported: 'Nur JPEG- und PNG-Bilder können hochgeladen werden.',
    unreadable: 'Diese Datei konnte nicht als Bild gelesen werden.',
    failed: 'Das Bild konnte nicht hochgeladen werden.',
  },
  // Saving a post to find it again. Private to whoever saved it.
  saved: {
    title: 'Gespeichert',
    private: 'Nur du kannst deine gespeicherten Beiträge sehen',
    save: 'Speichern',
    remove: 'Aus Gespeichert entfernen',
    saved: 'Gespeichert. Du findest es im Menü unter Gespeichert.',
    removed: 'Aus Gespeichert entfernt.',
    failed: 'Das hat nicht geklappt.',
    empty: 'Noch nichts gespeichert.',
    loadFailed: 'Deine gespeicherten Beiträge konnten nicht geladen werden.',
  },
  // The language button in the composer.
  language: {
    label: 'Sprache: {{ name }}',
  },
  // Downloading a photo or a video, where whoever posted it allows it.
  download: {
    allowed: 'Herunterladen erlaubt. Tippe, damit niemand dies mehr herunterladen kann.',
    notAllowed: 'Herunterladen nicht erlaubt. Tippe, damit alle, die dies sehen können, es herunterladen können.',
    allow: 'Herunterladen erlauben',
    stop: 'Herunterladen nicht erlauben',
    failed: 'Das konnte nicht geändert werden.',
    photo: 'Foto {{number}} von {{count}}',
    default: {
      title: 'Herunterladen',
      label: 'Leute dürfen die hier veröffentlichten Fotos und Videos herunterladen',
      help: 'Womit ein neues Foto oder Video beginnt. Nur wer einen Beitrag sehen kann, kann ihn herunterladen, jeder Beitrag lässt sich einzeln einstellen, und eine Änderung hier ändert nichts an dem, was schon veröffentlicht ist.',
      saved: 'Gespeichert.',
      notSaved: 'Das konnte nicht gespeichert werden.',
    },
  },
};
