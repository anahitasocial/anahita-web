// A channel, as a kind of profile (roadmap row 147): for now a website's feed
// to follow, here and from the fediverse (docs/channels.md in
// anahita-services). It was a Website, and before that Pulse.
export default {
  cTitle: 'Canais',
  mTitle: 'Canais',
  // What a website is here, where somebody meets the list.
  description: 'O feed de um site como canal, para seguir aqui e do fediverso.',
  connect: {
    cTitle: 'Conecte seu site',
    mTitle: 'Conecte seu site',
    intro: 'Qualquer site com um feed RSS, Atom ou JSON pode ser seguido aqui: um site WordPress ou outro, um site estático, o histórico de mudanças de um app, um podcast. As publicações dele chegam às pessoas aqui e no fediverso, e as trazem de volta ao seu site.',
    steps: {
      site: 'Seu site',
      proof: 'Prove que é seu',
      website: 'O canal dele aqui',
    },
    site: {
      label: 'O endereço do seu site',
      placeholder: 'example.com',
      help: 'O site, ou o feed dele. O feed precisa estar no mesmo domínio.',
      find: 'Encontrar o feed',
    },
    found: 'Encontramos o feed “{{ title }}”.',
    proof: {
      intro: 'Só quem controla {{ domain }} pode conectá-lo. Coloque este token em um destes dois lugares, o que for mais fácil, e depois verifique.',
      token: 'Token',
      dnsTitle: 'Um registro DNS',
      dns: 'Adicione um registro TXT com este nome, contendo o token:',
      fileTitle: 'Um arquivo no seu site',
      file: 'Ou publique o token, sozinho em uma linha, neste endereço:',
      check: 'Verificar',
      notYet: 'O token ainda não está em nenhum dos dois lugares. Um registro DNS novo pode demorar para ser visto: verifique de novo daqui a alguns minutos.',
      proved: 'Comprovado pelo {{ method }}.',
      methods: {
        dns: 'registro DNS',
        file: 'arquivo no seu site',
      },
      again: 'A verificação é refeita todos os dias. Se o token sumir por uma semana, as publicações param até ele voltar.',
    },
    website: {
      name: 'Nome',
      alias: 'Identificador',
      aliasHelp: 'O endereço dele aqui e no fediverso: {{ handle }}. Letras, algarismos, - e _.',
      body: 'Descrição',
      connect: 'Conectar',
      seen: 'Suas dez publicações mais recentes aparecem na hora; o que você publicar a partir de agora vem em seguida.',
    },
    copy: 'Copiar',
    copied: 'Copiado',
    done: 'Seu site está conectado.',
    errors: {
      not_a_domain: 'Isso não é o endereço de um site.',
      no_feed: 'Nenhum feed foi encontrado ali. Informe o endereço do próprio feed se o site não o indicar.',
      unreadable: 'Não foi possível ler o site. Confira o endereço e tente de novo.',
      feed_not_on_domain: 'O feed está em outro domínio, que você não tem como provar que é seu.',
      private_feed: 'Esse feed é privado: ele exige login, ou o endereço dele contém um segredo. As publicações de um canal são públicas, então só um feed público pode ser conectado.',
      feed_taken: 'Esse feed já está conectado.',
      handle_taken: 'Esse identificador já está em uso.',
      not_proved: 'Primeiro prove que o domínio é seu.',
      tooMany: 'Tentativas demais. Tente de novo daqui a uma hora.',
      generic: 'Algo deu errado. Tente de novo.',
    },
  },
  // In its About card.
  about: {
    verified: 'Verificado',
  },
  settings: {
    info: 'Informações',
    admins: 'Admins',
    access: 'Bloqueados',
    website: 'No seu site',
    fediverse: 'Fediverso',
    // Its card under Fediverse: off until one of its administrators turns
    // it on, as a person's is.
    fediverseCard: {
      enable: 'Deixar que pessoas de outros servidores o encontrem e sigam',
      help: 'Assim, pessoas no Mastodon e em outros servidores do fediverso podem encontrar o canal pelo identificador e segui-lo, e as notas dele são enviadas a elas.',
      handle: 'O identificador dele',
      leavesWhenPrivate: 'Se o canal for desativado ou excluído, ele também sai do fediverso, como se você tivesse desligado esta opção.',
      leave: {
        title: 'Tirar o canal do fediverso?',
        body: 'Todo servidor que conhece o canal será avisado para remover ele, as notas dele e os seguidores dele por lá. Isso não pode ser desfeito daqui: se você ligar esta opção de novo mais tarde, os servidores que o removeram podem não aceitá-lo de volta, e ninguém que o seguia continuará seguindo.',
        confirm: 'Tirar',
      },
      unavailable: {
        site_private: 'Este site reserva o que tem para os membros, então nenhum canal dele está no fediverso.',
        site_unreachable: 'Este site não tem um endereço que outros servidores consigam alcançar, então nenhum canal dele está no fediverso.',
        profile_not_public: 'Enquanto o canal estiver desativado ou excluído, ele não pode estar no fediverso.',
      },
    },
    blueskyHelp: 'Conecte a conta do Bluesky do próprio canal, com o seu domínio como identificador se quiser (@example.com): as notas dele são publicadas lá também, e as pessoas no Bluesky o seguem por lá. Use uma senha criada para um app, não a senha da própria conta.',
    websiteIntro: 'Cole isto no seu site para trazer seus leitores até ele aqui.',
    snippetLabel: 'Siga nosso canal no fediverso',
    disable: 'Desativar',
    disablePrompts: {
      description: 'Desativar esconde este canal de todo mundo e faz as novas publicações do seu site pararem de aparecer aqui.',
      descriptionDisabled: 'Este canal está desativado. Ele não aparece em lugar nenhum e não publica nada.',
      reversible: 'Isso pode ser desfeito a qualquer momento, e nada é excluído.',
      action: 'Desativar',
      actionEnable: 'Ativar',
      disabled: 'Este canal foi desativado.',
      enabled: 'Este canal foi ativado.',
      errors: {
        forbidden: 'Você não tem permissão para mudar isto.',
        lastSuperAdmin: 'Este perfil é o único superadmin e não pode ser desativado.',
        generic: 'Não foi possível mudar isto. Tente de novo.',
      },
    },
    delete: 'Excluir',
    purge: 'Excluir definitivamente',
    deletePrompts: {
      counts: {
        intro: 'Neste canal, agora:',
        posts: '{{ count }} publicação',
        posts_other: '{{ count }} publicações',
        replies: '{{ count }} resposta',
        replies_other: '{{ count }} respostas',
        followers: '{{ count }} seguidor',
        followers_other: '{{ count }} seguidores',
        admins: '{{ count }} admin',
        admins_other: '{{ count }} admins',
        memberSince: 'Conectado em {{ date }}.',
      },
      description: 'Excluir remove este canal daqui, as publicações que ele fez a partir do feed do seu site e as respostas a elas. O seu site em si não é afetado.',
      reversible: 'Isso não é imediato. Ele fica oculto na hora e é apagado definitivamente depois de {{ count }} dias. Qualquer admin pode restaurá-lo nesta página antes disso.',
      revoked: 'Os seguidores dele aqui e no fediverso o perdem na hora.',
      handle: 'O identificador {{ alias }} continua reservado depois.',
      scheduled: 'Este canal está programado para exclusão e será apagado em {{ date }}.',
      restore: 'Restaurar este canal',
      restored: 'Este canal foi restaurado.',
      errors: {
        restoreFailed: 'Não foi possível restaurar este canal. Talvez ele já tenha sido apagado definitivamente.',
      },
    },
    sections: {
      danger: 'Zona de perigo',
    },
  },
  confirm: {
    delete: 'Quer excluir {{ name }}?',
  },
};
