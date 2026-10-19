// The composer: the one box a post is written in, and the extended composer
// for writing at length.
export default {
  newPost: 'Nova publicação',
  close: 'Fechar',
  // Opens the extended composer from the short box: an article or a topic.
  longContent: 'Texto longo',
  // What can be added to a post: the words beside each icon where there is
  // room, and the icon's name where it stands alone, on a phone.
  photo: 'Foto',
  gif: 'GIF',
  addGif: 'Adicionar um GIF',
  video: 'Vídeo',
  addVideo: 'Adicionar um vídeo',
  // The extended composer's heading, and the button where a profile takes
  // only long writing.
  writeLong: 'Escrever um texto longo',
  // Said under the box where a profile takes pictures and videos but not
  // words alone.
  needsPicture: 'Adicione uma imagem ou um vídeo para publicar aqui.',
  // Under the title and the text of an article or a topic, when posting
  // without them.
  titleNeeded: 'É preciso um título.',
  bodyNeeded: 'Escreva algo primeiro.',
  // An article's cover, chosen in the extended composer.
  removeCover: 'Remover a capa',
  // After why the server would not take it.
  coverRefused: 'O artigo é publicado sem ela; você pode adicionar uma capa no artigo.',
  // The extended composer's tabs.
  // The extended composer's text, and the buttons above it.
  tooLong: 'No máximo {{count}} caracteres.',
  editor: {
    bold: 'Negrito',
    italic: 'Itálico',
    heading: 'Título',
    bullets: 'Lista com marcadores',
    numbers: 'Lista numerada',
    quote: 'Citação',
    code: 'Código',
    link: 'Link',
    linkAddress: 'Endereço',
    unlink: 'Remover link',
    apply: 'Aplicar',
    resize: 'Arraste para mudar a altura',
    removeEmbed: 'Remover',
    showAsLink: 'Mostrar como link',
    media: 'Fotos e vídeos',
  },
  // The library of one's own photos and videos, in the editor.
  library: {
    title: 'Sua mídia',
    photos: 'Fotos',
    videos: 'Vídeos',
    upload: 'Enviar',
    uploadNote: 'O que você envia aqui fica na sua biblioteca e só neste texto: não no seu feed nem no seu perfil.',
    insert: 'Inserir',
    chooseVideo: 'Escolha um GIF ou um vídeo',
    preparing: 'Preparando seu vídeo. Ele entra assim que estiver pronto.',
    none: {
      photos: 'Nenhuma foto ainda.',
      videos: 'Nenhum vídeo ainda.',
    },
    untitled: {
      photos: 'Foto',
      videos: 'Vídeo',
    },
  },
  // What a post's fields are called, the same in every form: a title; the
  // content of writing; the description of a photo or a video, as
  // WordPress says.
  fields: {
    title: 'Título',
    content: 'Conteúdo',
    description: 'Descrição',
  },
  // Drafts: articles and topics still being written, kept on the server.
  drafts: {
    title: 'Rascunhos',
    save: 'Salvar rascunho',
    saved: 'Rascunho salvo. Só você pode vê-lo.',
    notSaved: 'Não foi possível salvar o rascunho.',
    none: 'Nenhum rascunho aqui ainda.',
    new: 'Começar um novo',
    remove: 'Excluir rascunho',
    untitled: 'Sem título',
  },
  kinds: {
    article: 'Artigo',
    topic: 'Tópico',
  },
  // A video handed over without a title, in the list of those being
  // prepared.
  untitledVideo: 'Vídeo',
  // Hashtags offered while writing (roadmap row 78).
  hashtags: {
    label: 'Hashtags',
    suggested: 'Hashtags sugeridas',
    writeMore: 'Elas aparecem enquanto você escreve.',
    none: 'Nenhuma em uso combina com o que você escreveu ainda.',
    full: 'Só as primeiras {{ count }} hashtags contam.',
    // `short` is the count as a few characters: 1.2K.
    uses_one: '{{ short }} publicação',
    uses_other: '{{ short }} publicações',
    followed: 'Você segue',
  },
  locations: {
    add: 'Adicionar local',
    nearMe: 'Perto de mim',
    hint: 'Digite um nome ou toque em Perto de mim.',
    addNew: 'Adicionar “{{name}}” como novo local',
    addTitle: 'Adicionar local',
    goesOut: 'Vai com a publicação para outros servidores do fediverso.',
  },
};
