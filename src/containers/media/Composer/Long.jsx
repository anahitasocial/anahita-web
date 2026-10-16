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
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import CloseIcon from '@mui/icons-material/Close';

import actions from '../../../actions';
import coverApi from '../../../api/cover';
import linkPreviewsApi from '../../../api/linkPreviews';
import CoverPicker from './CoverPicker';
import LongEditor from './LazyLongEditor';
import useDraft from './useDraft';
import usePostChoices from './usePostChoices';

import embeds from '../../../utils/embeds';
import uploads from '../../../utils/upload';
import ActorType from '../../../proptypes/Actor';
import { Medium as MEDIUM } from '../../../constants';
import i18n from '../../../languages';

const { NAME, BODY } = MEDIUM.FIELDS;

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

  const [tab, setTab] = useState(kinds[0]);
  useEffect(() => {
    if (kinds.length > 0 && !kinds.includes(tab)) {
      setTab(kinds[0]);
    }
  }, [kinds]);

  const [title, setTitle, clearTitle] = useDraft(actor.id, 'long-title');
  const [body, setBody, clearBody] = useDraft(actor.id, 'long-body');
  const [cover, setCover] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [tried, setTried] = useState(false);

  // What was written in the short box comes along, after what is here
  // already.
  useEffect(() => {
    if (open && carried && !body.includes(carried)) {
      setBody(body ? `${body}\n\n${carried}` : carried);
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

  const busy = isSending;
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
  const titleShort = name.length < NAME.MIN_LENGTH;
  const bodyMissing = !text;
  // The editor has no limit of its own, as a text box had: said as soon as
  // it is passed, since the server would refuse it.
  const bodyTooLong = text.length > BODY.MAX_LENGTH;
  const ready = !titleShort && !bodyMissing && !bodyTooLong;
  let bodyError = '';
  if (bodyTooLong) {
    bodyError = i18n.t('composer:tooLong', { count: BODY.MAX_LENGTH });
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
    setCover(null);
    setTried(false);
    choices.posted();
    onClose();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setTried(true);
    if (!ready || busy) {
      return;
    }

    const post = { name, body: text, ...choices.request() };

    // An article's cover goes once the article exists. Should it not be
    // taken, the article is posted all the same, and the cover can be added
    // on its page.
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

    setIsSending(true);
    dispatch(actions[words.namespace].add(post, actor)).then((node) => {
      return withCover(node).then((ok) => {
        if (ok) {
          alertSuccess(i18n.t('prompts:posted.success'));
        }
        reset();
      });
    }).catch(() => {
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
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {i18n.t('composer:longContent')}
          </Typography>
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
                  disabled={busy}
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
              i18n.t('composer:titleNeeded', { count: NAME.MIN_LENGTH }) : ' '}
            required
            disabled={busy}
            fullWidth
            autoFocus={!phone}
            slotProps={{
              htmlInput: { dir: choices.direction, maxLength: NAME.MAX_LENGTH },
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
        </Box>
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
