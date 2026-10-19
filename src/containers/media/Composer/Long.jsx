import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/SaveOutlined';

import actions from '../../../actions';
import api from '../../../api';
import coverApi from '../../../api/cover';
import linkPreviewsApi from '../../../api/linkPreviews';
import CoverPicker from './CoverPicker';
import DraftsMenu from './DraftsMenu';
import LongEditor from './LazyLongEditor';
import SuggestedHashtags from './SuggestedHashtags';
import useDraft from './useDraft';
import useOnFediverse from './useOnFediverse';
import usePostChoices from './usePostChoices';
import usePostLocations from './usePostLocations';

import embeds from '../../../utils/embeds';
import { appendHashtag } from '../../../utils/hashtagTyping';
import uploads from '../../../utils/upload';
import ActorType from '../../../proptypes/Actor';
import { Medium as MEDIUM } from '../../../constants';
import i18n from '../../../languages';

const { TITLE, CONTENT } = MEDIUM.FIELDS;

// The words of the title and the content, as each kind of writing has them.
const WORDS = {
  article: {
    namespace: 'articles',
    body: 'composer:fields.content',
    titlePlaceholder: 'articles:composer.titlePlaceholder',
    bodyPlaceholder: 'articles:composer.bodyPlaceholder',
  },
  topic: {
    namespace: 'topics',
    body: 'composer:fields.content',
    titlePlaceholder: 'topics:composer.titlePlaceholder',
    bodyPlaceholder: 'topics:composer.bodyPlaceholder',
  },
};

// The extended composer: writing at length, with a title, in a dialog as
// tall as the screen allows and full screen on a phone.
//
// It is an article or a topic, chosen by the tabs where the profile takes
// both, and either needs its title. In an article, pictures, a GIF or a
// video go into the content as blocks where the caret is, from the
// editor's library or the buttons at the bottom alike, and it may have a
// cover; a topic is talked about, with links pasted in, a post here or a
// page elsewhere, and has neither (the user, 2026-10-16). A photo or video
// post of its own, with a title, is the short box's.
//
// `kinds` is what this profile takes of article and topic. `body` is what
// was written in the short box before it was expanded. The title and the
// content are kept as a draft of their own.
const LongComposer = ({
  actor,
  kinds,
  open,
  onClose,
  body: carried = '',
}) => {
  const dispatch = useDispatch();
  const viewer = useSelector((state) => { return state.session.viewer; });
  const phone = useMediaQuery((theme) => { return theme.breakpoints.down('sm'); });
  const choices = usePostChoices(actor, viewer);
  // Locations to tag it with, the same list as the short box's, so they
  // come along when it becomes this.
  const postLocations = usePostLocations(actor.id);
  // An article open to everybody on the writer's own profile goes to their
  // followers on other servers, as a note does; said before posting when it
  // will not. A topic stays here, and is said nothing of.
  const onFediverse = useOnFediverse(viewer);

  const [tab, setTab] = useState(kinds[0]);
  useEffect(() => {
    if (kinds.length > 0 && !kinds.includes(tab)) {
      setTab(kinds[0]);
    }
  }, [kinds]);

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
    if (draftKind && kinds.includes(draftKind) && tab !== draftKind) {
      setTab(draftKind);
    }
  }, [draftKind]);
  const [cover, setCover] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [tried, setTried] = useState(false);

  // What was written in the short box comes along, after what is here
  // already.
  useEffect(() => {
    if (open && carried && !body.includes(carried)) {
      setBody(body ? `${body}\n\n${carried}` : carried);
    }
    if (open) {
      postLocations.reload();
    }
  }, [open]);

  // The height of what can be seen, which a phone's keyboard takes from, as
  // in the short box: the bottom row stays above the keyboard.
  const [visible, setVisible] = useState(0);
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!phone || !open || !viewport) {
      return undefined;
    }
    const measure = () => {
      setVisible(Math.round(viewport.height));
    };
    measure();
    viewport.addEventListener('resize', measure);
    return () => {
      viewport.removeEventListener('resize', measure);
    };
  }, [phone, open]);

  // The text starts a few lines tall, and grows as somebody writes or as
  // its corner is dragged (LongEditor).
  const bodyRows = 8;

  const busy = isSending || isSaving;
  const kind = tab;
  const words = WORDS[kind] || WORDS.article;

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
    }, 800);
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

  const alertSuccess = (message) => {
    dispatch(actions.app.alert.success(message));
  };
  const alertError = (message) => {
    dispatch(actions.app.alert.error(message));
  };

  // Everything back to empty, closed. The choices of audience and language
  // stay, as in the short box.
  const reset = () => {
    clearTitle();
    clearBody();
    clearDraftRef();
    setCover(null);
    setTried(false);
    choices.posted();
    postLocations.clear();
    onClose();
  };

  // An article's cover goes once the article exists. Should it not be
  // taken, the article is posted all the same, and the cover can be added
  // on its page. A draft's goes when it is published.
  const withCover = (node) => {
    if (kind !== 'article' || !cover || !node || !node.id) {
      return Promise.resolve(true);
    }
    return coverApi.add(node, cover).then(() => {
      return true;
    }).catch((failure) => {
      alertError(`${i18n.t(uploads.refusalKey(failure))} ${i18n.t('composer:coverRefused')}`);
      return false;
    });
  };

  const { namespace } = words;

  // What a draft says now, saved over what it said.
  const saveOver = () => {
    return api[namespace].edit({
      id: draftId, title: name, content: text, language: choices.language,
    });
  };

  // Kept on the server as a draft, seen by nobody else, to be taken up
  // again here or on another device (the user, 2026-10-16).
  const saveDraft = () => {
    setTried(true);
    if (!ready || busy) {
      return;
    }
    setIsSaving(true);
    const saving = draftId ?
      saveOver() :
      api[namespace].add({
        title: name, content: text, ...choices.request(), draft: true,
      }, actor).then((result) => {
        setDraftRef(`${kind}:${result.data.id}`);
      });
    saving.then(() => {
      setTried(false);
      alertSuccess(i18n.t('composer:drafts.saved'));
    }).catch(() => {
      alertError(i18n.t('composer:drafts.notSaved'));
    }).finally(() => {
      setIsSaving(false);
    });
  };

  // Its cover, then its locations, once it exists. A location that fails
  // does not lose the post: it is said, and can be added from its page.
  const posted = (node) => {
    return withCover(node).then((ok) => {
      return postLocations.tag(node).then((failed) => {
        if (failed > 0) {
          alertError(i18n.t('composer:locations.failed', { count: failed }));
        } else if (ok) {
          alertSuccess(i18n.t('prompts:posted.success'));
        }
        reset();
      });
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setTried(true);
    if (!ready || busy) {
      return;
    }

    setIsSending(true);
    // A draft taken up again: what it says now, then published, a post
    // from now and announced as one.
    const posting = draftId ?
      saveOver().then(() => {
        return api[namespace].publish({ id: draftId }, choices.access);
      }).then((result) => {
        return posted(result.data);
      }) :
      dispatch(actions[namespace].add({ title: name, content: text, ...choices.request() }, actor))
        .then(posted);
    posting.catch(() => {
      // What was written stays, to post again.
      alertError(i18n.t('prompts:posted.error'));
    }).finally(() => {
      setIsSending(false);
    });
  };

  // As tall as the screen allows on a desktop, less the dialog's margins;
  // on a phone, what the keyboard leaves.
  let paper = { height: 'calc(100% - 64px)' };
  if (phone) {
    paper = visible ? { height: visible, maxHeight: visible } : {};
  }

  const close = () => {
    if (!busy) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      fullScreen={phone}
      fullWidth
      maxWidth="md"
      slotProps={{ paper: { sx: paper } }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        {/* Close and Post at the top, as in the short box on a phone. */}
        <Toolbar sx={{ gap: 1, px: 1 }}>
          <IconButton
            edge="start"
            aria-label={i18n.t('composer:close')}
            disabled={busy}
            onClick={close}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }} noWrap>
            {i18n.t('composer:longContent')}
          </Typography>
          <DraftsMenu
            actor={actor}
            kinds={kinds}
            phone={phone}
            currentId={draftId}
            disabled={busy}
            onOpen={(draft) => {
              setTab(draft.kind);
              setTitle(draft.title || '');
              setBody(draft.content || '');
              setDraftRef(`${draft.kind}:${draft.id}`);
              setTried(false);
            }}
            onNew={() => {
              clearTitle();
              clearBody();
              clearDraftRef();
              setCover(null);
              setTried(false);
            }}
          />
          {/* Its words where there is room; on a phone, the icon. */}
          {phone ?
            <Tooltip title={i18n.t('composer:drafts.save')}>
              <span>
                <IconButton
                  aria-label={i18n.t('composer:drafts.save')}
                  onClick={saveDraft}
                  disabled={busy}
                >
                  {isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
                </IconButton>
              </span>
            </Tooltip> :
            <Button
              variant="outlined"
              onClick={saveDraft}
              disabled={busy}
              sx={{ minWidth: 88, flexShrink: 0 }}
            >
              {!isSaving && i18n.t('composer:drafts.save')}
              {isSaving && <CircularProgress size={20} />}
            </Button>}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={busy}
            sx={{ minWidth: 88 }}
          >
            {!isSending && i18n.t('actions:post')}
            {isSending && <CircularProgress size={20} />}
          </Button>
        </Toolbar>
        {/* Article or Topic, where the profile takes both. */}
        {kinds.length > 1 &&
          <Tabs
            value={tab}
            onChange={(event, value) => {
              setTab(value);
            }}
            variant="fullWidth"
          >
            {kinds.map((each) => {
              return (
                <Tab
                  key={`long-${each}`}
                  value={each}
                  label={i18n.t(`composer:kinds.${each}`)}
                  // A draft is of the kind it was begun as.
                  disabled={busy || (draftId > 0 && each !== tab)}
                />
              );
            })}
          </Tabs>}
        <Divider />
        <Box
          sx={{
            flexGrow: 1, overflowY: 'auto', px: 2, pt: 3,
          }}
        >
          {kind === 'article' &&
            <CoverPicker file={cover} onChange={setCover} disabled={busy} />}
          {/* Each field keeps a line under it for what is wrong, so
              nothing moves when it is said. */}
          <TextField
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
            }}
            label={i18n.t('composer:fields.title')}
            placeholder={i18n.t(words.titlePlaceholder)}
            error={tried && titleShort}
            helperText={tried && titleShort ?
              i18n.t('composer:titleNeeded') : ' '}
            required
            disabled={busy}
            fullWidth
            autoFocus={!phone}
            slotProps={{
              htmlInput: { dir: choices.direction, maxLength: TITLE.MAX_LENGTH },
              inputLabel: { shrink: true },
            }}
          />
          <LongEditor
            value={body}
            onChange={setBody}
            label={i18n.t(words.body)}
            placeholder={i18n.t(words.bodyPlaceholder)}
            error={bodyError !== ''}
            helperText={bodyError || ' '}
            required
            disabled={busy}
            dir={choices.direction}
            minHeight={bodyRows * 23}
            // Flush with the top of the dialog's scrolling part, over its
            // padding.
            stickyTop={-24}
            uploadAccess={choices.access}
            withMedia={kind === 'article'}
          />
          <SuggestedHashtags
            title={title}
            body={body}
            disabled={busy}
            onAdd={(hashtag) => {
              setBody(appendHashtag(body, hashtag));
            }}
          />
          {postLocations.chips({ disabled: busy })}
        </Box>
        {kind === 'article' && onFediverse && actor.id === viewer.id && choices.access !== 'public' &&
          <Typography variant="caption" color="textSecondary" component="p" sx={{ px: 2, pb: 1 }}>
            {i18n.t('federation:composer.articleStaysHere')}
          </Typography>}
        <Divider />
        {/* The post's choices in one row at the bottom; it scrolls
            sideways on a phone rather than wrapping. Pictures and videos
            are the editor's own buttons. */}
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            alignItems: 'center', px: 1, py: 1, overflowX: 'auto',
          }}
        >
          {!busy && postLocations.button()}
          {choices.render({ busy })}
        </Stack>
      </Box>
    </Dialog>
  );
};

LongComposer.propTypes = {
  actor: ActorType.isRequired,
  // What this profile takes, of `article` and `topic`.
  kinds: PropTypes.arrayOf(PropTypes.string).isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  body: PropTypes.string,
};

export default LongComposer;
