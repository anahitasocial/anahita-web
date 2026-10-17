export default {
  // What an article or a topic holds, under its opening in a list.
  summary: {
    photos_one: '{{count}} foto',
    photos_other: '{{count}} fotos',
    videos_one: '{{count}} vídeo',
    videos_other: '{{count}} vídeos',
    citations_one: '{{count}} citação',
    citations_other: '{{count}} citações',
  },
  // What an article shows within itself, and lists at its end.
  // A post's Cited by tab: what cites it here.
  citations: {
    citedBy: 'Citado por',
    noneCitedBy: 'Nada aqui cita isto ainda.',
  },
  embed: {
    in: 'em',
    citations: 'Citações',
    opensNewTab: 'Abre em uma nova aba',
    readMore: 'Ler mais',
    viewProfile: 'Ver perfil',
  },
  stepper: {
    position: '{{index}} de {{total}}',
    next: 'Próxima publicação',
    previous: 'Publicação anterior',
    permalink: 'Abrir o link permanente',
    home: 'Ir para o início',
    open: 'Abrir em tela cheia',
    zoomIn: 'Ampliar para o tamanho real',
    zoomOut: 'Reduzir para caber',
  },
  confirm: {
    delete: 'Você quer excluir esta publicação?',
  },
  // Pinning a post to the profile it is on.
  pin: {
    pin: 'Fixar no perfil',
    unpin: 'Desafixar',
    label: 'Fixado',
    pinned: 'Fixado. Agora aparece primeiro no perfil.',
    unpinned: 'Desafixado.',
    failed: 'Não foi possível fazer isso.',
  },
  // A post's interactions: who liked, reposted, quoted and replied.
  activity: {
    title: 'Interações',
    likes: 'Curtidas {{ count }}',
    reposts: 'Reposts {{ count }}',
    quotes: 'Citações {{ count }}',
    replies: 'Respostas {{ count }}',
    none: 'Nada aqui que você possa ver.',
    failed: 'Não foi possível carregar esta lista.',
    open: 'Abrir',
  },
  // An avatar or a cover the server would not take.
  image: {
    tooLarge: 'Esta imagem é grande demais. O limite é 10 MB.',
    unsupported: 'Só é possível enviar imagens JPEG e PNG.',
    unreadable: 'Não foi possível ler este arquivo como imagem.',
    failed: 'Não foi possível enviar a imagem.',
  },
  // Saving a post to find it again. Private to whoever saved it.
  saved: {
    title: 'Salvos',
    private: 'Só você pode ver os itens salvos',
    save: 'Salvar',
    remove: 'Remover dos salvos',
    saved: 'Salvo. Está em Salvos, no menu.',
    removed: 'Removido dos salvos.',
    failed: 'Não foi possível fazer isso.',
    empty: 'Nada salvo ainda.',
    loadFailed: 'Não foi possível carregar suas publicações salvas.',
  },
  // The language button in the composer.
  language: {
    label: 'Idioma: {{ name }}',
  },
  // Downloading a photo or a video, where whoever posted it allows it.
  download: {
    allowed: 'Downloads permitidos. Toque para impedir que as pessoas baixem isto.',
    notAllowed: 'Downloads não permitidos. Toque para deixar que quem pode ver isto possa baixar.',
    allow: 'Permitir download',
    stop: 'Não permitir download',
    failed: 'Não foi possível mudar isso.',
    photo: 'Foto {{number}} de {{count}}',
    default: {
      title: 'Downloads',
      label: 'Deixar as pessoas baixarem as fotos e os vídeos publicados aqui',
      help: 'O padrão de cada nova foto ou vídeo. Só quem pode ver uma publicação pode baixá-la, cada publicação pode ter sua própria configuração, e mudar isto não muda nada do que já foi publicado.',
      saved: 'Salvo.',
      notSaved: 'Não foi possível salvar.',
    },
  },
};
