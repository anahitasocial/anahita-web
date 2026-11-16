// Avisos de conteúdo (anahita-services, linha 122).
export default {
  label: 'Aviso de conteúdo',
  none: 'Nenhum',
  title: 'Aviso de conteúdo',
  help: 'As pessoas verão seu conteúdo desfocado, e atrás de um aviso.',
  kinds: {
    adult: 'Conteúdo adulto',
    suggestive: 'Sexualmente sugestivo',
    graphic: 'Imagens fortes',
    nudity: 'Nudez não sexual',
    other: 'Outro',
    ai: 'Feito com IA',
  },
  lines: {
    adult: 'Imagens sexuais explícitas',
    suggestive: 'Sexual, sem nudez',
    graphic: 'Violência, sangue ou imagens perturbadoras',
    nudity: 'Nus artísticos, por exemplo',
    other: 'Com suas palavras: spoilers, luto…',
    ai: 'Imagens ou vídeo feitos ou alterados com IA',
  },
  words: 'O que ela contém',
  wordsNeeded: 'Diga o que a publicação contém.',
  remove: 'Remover o aviso',
  view: 'Ver',
  byModerator: 'Os administradores deram este aviso à publicação, então ele não pode ser mudado aqui.',
  // In the dialog, for an administrator giving one as the site's.
  moderatorHelp: 'Dado pelos administradores: quem escreveu é avisado, e não pode removê-lo.',
  // A file chosen in the composer says it was made with AI.
  aiFound: 'Este arquivo diz que foi feito com IA, então a publicação está marcada como Feito com IA.',
  saved: 'Aviso de conteúdo salvo.',
  notSaved: 'Não foi possível salvar o aviso de conteúdo.',
  // A post the reader chose to hide, as one line in a list.
  hidden: 'Oculto: {{ warning }}',
  // What each reader chooses, in their settings (row 122, phase 2).
  choices: {
    title: 'Avisos de conteúdo',
    help: 'O que você vê de uma publicação com um aviso',
    show: 'Mostrar',
    warn: 'Avisar',
    hide: 'Ocultar',
    // Other's line, for a reader: the kinds' own lines say the rest.
    otherLine: 'Com as palavras de quem escreveu: spoilers, luto…',
  },
};
