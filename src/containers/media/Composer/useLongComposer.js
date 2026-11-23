import { useEffect, useRef, useState } from 'react';

import actions from '../../../actions';
import api from '../../../api';
import coverApi from '../../../api/cover';
import linkPreviewsApi from '../../../api/linkPreviews';
import { Medium as MEDIUM } from '../../../constants';
import i18n from '../../../languages';
import embeds from '../../../utils/embeds';
import uploads from '../../../utils/upload';
import warnings from '../../../utils/warnings';
import kinds from '../../../utils/postKinds';
import useComposer from './useComposer';
import useDraft from './useDraft';

const { CONTENT } = MEDIUM.FIELDS;

// How long the writer has to stop typing before the pages linked on lines
// of their own are read.
const PAUSE = 800;

// What the extended composer holds and the rules it keeps; Long.jsx draws
// it. Which kind it is, of those the profile takes (kinds.js); its title
// and its text, kept as a draft of their own in this browser (useDraft);
// the draft on the server it is, when it is one; and an article's cover.
//
// A title is needed, of any length, and the text, within what the server
// takes. It is posted, or saved as a draft on the server, seen by nobody
// else, to be taken up again here or on another device (the user,
// 2026-10-16).
//
// `kinds` is what the profile takes of article and topic. `carried` is
// what was written in the short box before it was expanded.
const useLongComposer = ({
  actor,
  kinds: takes,
  open,
  onClose,
  carried = '',
}) => {
  const base = useComposer({ actor, open });
  const { dispatch, choices, postLocations } = base;

  const [tab, setTab] = useState(takes[0]);
  useEffect(() => {
    if (takes.length > 0 && !takes.includes(tab)) {
      setTab(takes[0]);
    }
  }, [takes]);

  const [title, setTitle, clearTitle] = useDraft(actor.id, 'long-title');
  const [body, setBody, clearBody] = useDraft(actor.id, 'long-body');
  // The draft kept on the server that this is, as `<kind>:<id>`, when it
  // is one: saved with Save draft, or taken up again from Drafts.
  const [draftRef, setDraftRef, clearDraftRef] = useDraft(actor.id, 'long-draft');
  const [draftKind, draftNumber] = draftRef.split(':');
  const draftId = Number(draftNumber) || 0;
  const [isSaving, setIsSaving] = useState(false);
  // A draft is of the kind it was begun as.
  useEffect(() => {
    if (draftKind && takes.includes(draftKind) && tab !== draftKind) {
      setTab(draftKind);
    }
  }, [draftKind]);
  const [cover, setCover] = useState(null);
  const [isSending, setIsSending] = useState(false);
  // Whether Post or Save draft has been tried: what is missing is said only
  // after.
  const [tried, setTried] = useState(false);

  // What was written in the short box comes along, after what is here
  // already.
  useEffect(() => {
    if (open && carried && !body.includes(carried)) {
      setBody(body ? `${body}\n\n${carried}` : carried);
    }
  }, [open]);

  const busy = isSending || isSaving;
  const kind = tab;
  const about = kinds.of(kind);
  const { namespace } = kinds.wordsOf(kind);

  // A page elsewhere on a line of its own is shown by its card. Its preview
  // is asked for while the text is written, once each, so that it is there
  // to keep when the post is saved: the server keeps only what
  // link-preview-service has read. Nothing is shown here for it.
  const asked = useRef(new Set());
  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const timer = setTimeout(() => {
      embeds.pagesIn(body).forEach((page) => {
        if (!asked.current.has(page)) {
          asked.current.add(page);
          linkPreviewsApi.read(page).catch(() => {});
        }
      });
    }, PAUSE);
    return () => {
      clearTimeout(timer);
    };
  }, [body, open]);

  const name = title.trim();
  const text = body.trim();
  // A title is needed, of any length (the user, 2026-10-17: "Pulse" is a
  // title; nobody else asks for ten letters).
  const titleShort = name.trim() === '';
  const bodyMissing = !text;
  // The editor has no limit of its own, as a text box had: said as soon as
  // it is passed, since the server would refuse it.
  const bodyTooLong = text.length > CONTENT.MAX_LENGTH;
  const ready = !titleShort && !bodyMissing && !bodyTooLong;
  let bodyError = '';
  if (bodyTooLong) {
    bodyError = i18n.t('composer:tooLong', { count: CONTENT.MAX_LENGTH });
  } else if (tried && bodyMissing) {
    bodyError = i18n.t('composer:bodyNeeded');
  }

  // Begun again, empty: a new one, not the draft it was.
  const empty = () => {
    clearTitle();
    clearBody();
    clearDraftRef();
    setCover(null);
    setTried(false);
  };

  // Everything back to empty, closed. The choices of audience and language
  // stay, as in the short box.
  const reset = () => {
    empty();
    base.posted();
    onClose();
  };

  // An article's cover goes once the article exists, and before it is
  // published, so that it goes to Bluesky and the fediverse with it (roadmap
  // row 180): sent the moment it was made, it went without. Should it not
  // be taken, the article is posted all the same, and the cover can be
  // added on its page.
  const withCover = (node) => {
    if (!about.withCover || !cover || !node || !node.id) {
      return Promise.resolve(true);
    }
    return coverApi.add(node, cover).then(() => {
      return true;
    }).catch((failure) => {
      base.alertError(`${i18n.t(uploads.refusalKey(failure))} ${i18n.t('composer:coverRefused')}`);
      return false;
    });
  };

  // What a draft says now, saved over what it said.
  const saveOver = () => {
    return api[namespace].edit({
      id: draftId, title: name, content: text, language: choices.language,
    }).then((result) => {
      // Its content warning has an address of its own.
      return api.warnings.edit(result.data, choices.warning);
    });
  };

  // Kept on the server as a draft, seen by nobody else.
  const saveDraft = () => {
    setTried(true);
    if (!ready || busy) {
      return;
    }
    setIsSaving(true);
    const saving = draftId ?
      saveOver() :
      api[namespace].add({
        title: name, content: text, ...choices.request(), draft: true, ...base.locationIds(),
      }, actor).then((result) => {
        setDraftRef(`${kind}:${result.data.id}`);
      });
    saving.then(() => {
      setTried(false);
      base.alertSuccess(i18n.t('composer:drafts.saved'));
    }).catch(() => {
      base.alertError(i18n.t('composer:drafts.notSaved'));
    }).finally(() => {
      setIsSaving(false);
    });
  };

  // Its cover told of already, when it was refused.
  const posted = (coverTaken = true) => {
    if (coverTaken) {
      base.alertSuccess(i18n.t('prompts:posted.success'));
    }
    reset();
  };

  // A draft published, its cover put on it first.
  const publish = (id) => {
    return withCover({ id }).then((coverTaken) => {
      return api[namespace].publish({ id }, choices.access).then(() => {
        return posted(coverTaken);
      });
    });
  };

  const hasCover = Boolean(about.withCover && cover);

  // A draft taken up again: what it says now, then published, a post from
  // now and announced as one. Its locations tied before it is published,
  // as a new one's are as it is made, so that it goes to other servers with
  // them.
  //
  // A new one with a cover is made a draft first, given its cover, then
  // published; one without is posted as it always was.
  const send = () => {
    setIsSending(true);
    let posting;
    if (draftId) {
      posting = saveOver().then(() => {
        return postLocations.tag({ id: draftId });
      }).then(() => {
        return publish(draftId);
      });
    } else if (hasCover) {
      posting = api[namespace].add({
        title: name, content: text, ...choices.request(), draft: true, ...base.locationIds(),
      }, actor).then((result) => {
        return publish(result.data.id);
      });
    } else {
      posting = dispatch(actions[namespace].add({
        title: name, content: text, ...choices.request(), ...base.locationIds(),
      }, actor)).then(() => {
        return posted();
      });
    }
    posting.catch(() => {
      // What was written stays, to post again.
      base.alertError(i18n.t('prompts:posted.error'));
    }).finally(() => {
      setIsSending(false);
    });
  };

  const submit = (event) => {
    event.preventDefault();
    setTried(true);
    if (!ready || busy) {
      return;
    }
    base.rules.run(send);
  };

  return {
    ...base,
    kind,
    about,
    words: kinds.wordsOf(kind),
    setTab,
    title,
    setTitle,
    body,
    setBody,
    cover,
    setCover,
    draftId,
    isSaving,
    isSending,
    busy,
    tried,
    titleShort,
    bodyError,
    // It goes to other servers, and its locations with it, as a note does;
    // or it would, were it open to everybody. A topic stays here, and is
    // said nothing of.
    goesOut: about.federates && base.goesOut,
    staysHere: about.federates && base.staysHere,
    saveDraft,
    submit,
    // A draft taken up again from Drafts.
    openDraft: (draft) => {
      setTab(draft.kind);
      setTitle(draft.title || '');
      setBody(draft.content || '');
      setDraftRef(`${draft.kind}:${draft.id}`);
      choices.setWarning(warnings.of(draft));
      setTried(false);
    },
    newDraft: empty,
    close: () => {
      if (!busy) {
        onClose();
      }
    },
  };
};

export default useLongComposer;
