// The composer: the one box a post is written in, and the extended composer
// for writing at length.
export default {
  newPost: 'Neuer Beitrag',
  thread: {
    add: 'Zum Thread hinzufügen',
    placeholder: 'Weiterschreiben…',
    part: 'Beitrag {{number}} des Threads',
    remove: 'Aus dem Thread entfernen',
  },
  close: 'Schließen',
  // Opens the extended composer from the short box: an article or a topic.
  longContent: 'Langer Beitrag',
  // What can be added to a post: the words beside each icon where there is
  // room, and the icon's name where it stands alone, on a phone.
  photo: 'Foto',
  gif: 'GIF',
  addGif: 'GIF hinzufügen',
  video: 'Video',
  addVideo: 'Video hinzufügen',
  // The extended composer's heading, and the button where a profile takes
  // only long writing.
  // Said under the box where a profile takes pictures and videos but not
  // words alone.
  needsPicture: 'Füge ein Bild oder ein Video hinzu, um hier zu veröffentlichen.',
  // Under the title and the text of an article or a topic, when posting
  // without them.
  titleNeeded: 'Ein Titel fehlt.',
  bodyNeeded: 'Schreib zuerst etwas.',
  // An article's cover, chosen in the extended composer.
  removeCover: 'Titelbild entfernen',
  // After why the server would not take it.
  coverRefused: 'Der Artikel wird ohne Titelbild veröffentlicht; du kannst es beim Artikel hinzufügen.',
  // The extended composer's tabs.
  // The extended composer's text, and the buttons above it.
  tooLong: 'Höchstens {{count}} Zeichen.',
  editor: {
    bold: 'Fett',
    italic: 'Kursiv',
    heading: 'Überschrift',
    bullets: 'Aufzählung',
    numbers: 'Nummerierte Liste',
    quote: 'Zitat',
    code: 'Code',
    link: 'Link',
    linkAddress: 'Adresse',
    unlink: 'Link entfernen',
    apply: 'Übernehmen',
    resize: 'Ziehen, um die Höhe zu ändern',
    removeEmbed: 'Entfernen',
    showAsLink: 'Als Link zeigen',
    media: 'Fotos und Videos',
  },
  // The library of one's own photos and videos, in the editor.
  library: {
    title: 'Deine Medien',
    photos: 'Fotos',
    videos: 'Videos',
    upload: 'Hochladen',
    uploadNote: 'Was du hier hochlädst, ist nur in deiner Mediathek und in diesem Text: nicht in deinem Feed und nicht auf deinem Profil.',
    insert: 'Einfügen',
    chooseVideo: 'GIF oder Video',
    preparing: 'Dein Video wird vorbereitet. Es wird eingefügt, sobald es fertig ist.',
    none: {
      photos: 'Noch keine Fotos.',
      videos: 'Noch keine Videos.',
    },
    untitled: {
      photos: 'Foto',
      videos: 'Video',
    },
  },
  // What a post's fields are called, the same in every form: a title; the
  // content of writing; the description of a photo or a video, as
  // WordPress says.
  fields: {
    title: 'Titel',
    content: 'Inhalt',
    description: 'Beschreibung',
  },
  // Drafts: articles and topics still being written, kept on the server.
  drafts: {
    title: 'Entwürfe',
    save: 'Entwurf speichern',
    saved: 'Entwurf gespeichert. Nur du kannst ihn sehen.',
    notSaved: 'Der Entwurf konnte nicht gespeichert werden.',
    none: 'Hier gibt es noch keine Entwürfe.',
    new: 'Neuen beginnen',
    remove: 'Entwurf löschen',
    untitled: 'Ohne Titel',
  },
  kinds: {
    article: 'Artikel',
    topic: 'Thema',
  },
  // A video handed over without a title, in the list of those being
  // prepared.
  untitledVideo: 'Video',
  // Hashtags offered while writing (roadmap row 78).
  hashtags: {
    label: 'Hashtags',
    suggested: 'Vorgeschlagene Hashtags',
    writeMore: 'Sie erscheinen, während du schreibst.',
    none: 'Noch passt kein verwendeter Hashtag zu dem, was du geschrieben hast.',
    full: 'Nur die ersten {{ count }} Hashtags zählen.',
    // `short` is the count as a few characters: 1.2K.
    uses_one: '{{ short }} Beitrag',
    uses_other: '{{ short }} Beiträge',
    followed: 'Du folgst ihm',
  },
  locations: {
    add: 'Ort hinzufügen',
    nearMe: 'In meiner Nähe',
    photoSuggest: 'Dieses Foto hat einen Standort. Orte in der Nähe vorschlagen?',
    nearPhoto: 'In der Nähe des Fotos',
    hint: 'Gib einen Namen ein oder tippe auf In meiner Nähe.',
    addNew: '„{{name}}“ als neuen Ort hinzufügen',
    addTitle: 'Ort hinzufügen',
    goesOut: 'Geht mit dem Beitrag an andere Server im Fediverse.',
  },
  // The short composer's two steps (roadmap row 114): Next, from the post
  // itself to the choices that go with it, each a row; back returns.
  // One video at a time: said by the Video button while one is sent.
  videoOnItsWay: 'Ein Video ist unterwegs: Ein weiteres kann hinzugefügt werden, sobald es veröffentlicht ist.',
  next: 'Weiter',
  details: {
    back: 'Zurück',
    audience: 'Wer es sehen kann',
    language: 'Sprache',
    replies: 'Wer antworten kann',
    location: 'Ort',
  },
};
