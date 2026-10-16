import React, { useEffect, useState } from 'react';

import DownloadOptionButton from '../../../components/DownloadOptionButton';
import LanguageButton from '../../../components/LanguageButton';
import ReplyAccessButton from '../../../components/ReplyAccessButton';
import ComposerAudience from './Audience';

import audience from '../../../utils/audience';
import postLanguage from '../../../utils/postLanguage';
import replyAccess from '../../../utils/replyAccess';

// The choices that go with a post, the same in the short box and the
// extended composer: who can see it, its language, who may reply and quote
// it, and for pictures and a video whether they may be downloaded.
//
// Who can see it starts on the last choice for this kind of place
// (utils/audience) and its language on the last one written in; who may
// reply is asked of each post, since a post closed to replies by habit is a
// surprise.
const usePostChoices = (actor, viewer) => {
  const [access, setAccess] = useState(() => {
    return audience.defaultFor(actor, viewer);
  });
  useEffect(() => {
    setAccess(audience.defaultFor(actor, viewer));
  }, [actor.id, actor.access, viewer.id]);

  const [language, setLanguage] = useState(() => {
    return postLanguage.defaultFor(viewer);
  });
  useEffect(() => {
    setLanguage(postLanguage.defaultFor(viewer));
  }, [viewer.id, viewer.language]);

  const [whoReplies, setWhoReplies] = useState(replyAccess.ANYONE);
  const [whoQuotes, setWhoQuotes] = useState('');
  const [allowDownload, setAllowDownload] = useState(Boolean(actor.allowDownload));
  useEffect(() => {
    setAllowDownload(Boolean(actor.allowDownload));
  }, [actor.id, actor.allowDownload]);

  return {
    access,
    language,
    allowDownload,
    direction: postLanguage.directionOf(language),
    // What goes with a post of any kind, as the server reads it.
    request: () => {
      return {
        access,
        language,
        ...replyAccess.toRequest(whoReplies),
        ...(whoQuotes ? { quote_policy: whoQuotes } : {}),
      };
    },
    // After posting: who may reply and quote are asked again; the audience
    // is remembered, now that it has been used.
    posted: () => {
      audience.remember(actor, viewer, access);
      setWhoReplies(replyAccess.ANYONE);
      setWhoQuotes('');
    },
    // The buttons, beside each other.
    render: ({ busy = false, withDownload = false } = {}) => {
      return (
        <>
          <ComposerAudience
            actor={actor}
            viewer={viewer}
            value={access}
            onChange={setAccess}
            disabled={busy}
          />
          <LanguageButton value={language} onChange={setLanguage} disabled={busy} />
          <ReplyAccessButton
            value={whoReplies}
            onChange={setWhoReplies}
            quotePolicy={whoQuotes}
            defaultQuotePolicy={viewer.quotePolicy}
            onQuotePolicyChange={setWhoQuotes}
            disabled={busy}
          />
          {withDownload &&
            <DownloadOptionButton
              value={allowDownload}
              onChange={setAllowDownload}
              disabled={busy}
            />}
        </>
      );
    },
  };
};

export default usePostChoices;
