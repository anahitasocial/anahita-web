import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import CloseIcon from '@mui/icons-material/Close';
import GifIcon from '@mui/icons-material/GifBoxOutlined';
import PhotoIcon from '@mui/icons-material/Photo';
import VideoIcon from '@mui/icons-material/VideocamOutlined';

import actions from '../../../actions';
import PhotoFilesEditor from '../../../components/PhotoFilesEditor';
import useDraft from './useDraft';
import usePostChoices from './usePostChoices';
import useVideoUpload from './Video/useVideoUpload';

import photoFiles from '../../../utils/photoFiles';
import videos from '../../../utils/videos';
import ActorType from '../../../proptypes/Actor';
import { Medium as MEDIUM } from '../../../constants';
import i18n from '../../../languages';

const { NAME, BODY, EXCERPT } = MEDIUM.FIELDS;

// The words of the title and the text, as each kind of post has them.
const WORDS = {
  article: {
    namespace: 'articles',
    title: 'articles:composer.title',
    titlePlaceholder: 'articles:composer.titlePlaceholder',
    bodyPlaceholder: 'articles:composer.bodyPlaceholder',
  },
  topic: {
    namespace: 'topics',
    title: 'topics:composer.title',
    titlePlaceholder: 'topics:composer.titlePlaceholder',
    bodyPlaceholder: 'topics:composer.bodyPlaceholder',
  },
  photo: {
    namespace: 'photos',
    title: 'photos:composer.name',
    titlePlaceholder: 'photos:composer.namePlaceholder',
    bodyPlaceholder: 'photos:composer.bodyPlaceholder',
  },
  video: {
    namespace: 'videos',
    title: 'videos:composer.name',
    titlePlaceholder: 'videos:composer.namePlaceholder',
    bodyPlaceholder: 'videos:composer.bodyPlaceholder',
  },
};

// The extended composer: writing at length, with a title, in a dialog as
// tall as the screen allows and full screen on a phone.
//
// What it posts follows from what is in it, as in the short box: pictures
// make a photo post and a video a video post, each with its title and its
// text; with nothing attached it is an article or a topic, chosen by the
// tabs where the profile takes both. An article and a topic need their title;
// a photo or video post may do without.
//
// `kinds` is what this profile takes of article and topic, `media` of photo
// and video. `body` is what was written in the short box before it was
// expanded. The title and the text are kept as a draft of their own.
const LongComposer = ({
  actor,
  kinds,
  media = [],
  open,
  onClose,
  body: carried = '',
}) => {
  const dispatch = useDispatch();
  const viewer = useSelector((state) => { return state.session.viewer; });
  const nodeInfo = useSelector((state) => { return state.app.nodeInfo; });
  const phone = useMediaQuery((theme) => { return theme.breakpoints.down('sm'); });
  const choices = usePostChoices(actor, viewer);
  const upload = useVideoUpload();
  const picker = useRef(null);

  const [tab, setTab] = useState(kinds[0]);
  useEffect(() => {
    if (kinds.length > 0 && !kinds.includes(tab)) {
      setTab(kinds[0]);
    }
  }, [kinds]);

  const [title, setTitle, clearTitle] = useDraft(actor.id, 'long-title');
  const [body, setBody, clearBody] = useDraft(actor.id, 'long-body');
  const [excerpt, setExcerpt] = useState('');
  const [isAddingPhotos, setIsAddingPhotos] = useState(false);
  const [photoItems, setPhotoItems] = useState([]);
  const [video, setVideo] = useState(null);
  const [videoProblem, setVideoProblem] = useState('');
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

  // The text starts with the height left once the title, the excerpt and
  // the buttons have theirs, a line being about 23 pixels, and grows as
  // somebody types.
  const rowsFor = () => {
    const room = window.innerHeight - (phone ? 340 : 420);
    return Math.max(8, Math.floor(room / 23));
  };
  const [bodyRows, setBodyRows] = useState(rowsFor);
  useEffect(() => {
    setBodyRows(rowsFor());
  }, [open, phone]);

  const canPhotos = media.includes('photo');
  const canVideo = media.includes('video') && videos.isOn(nodeInfo);
  const hasPhotos = photoItems.length > 0;
  const photosReady = hasPhotos && photoFiles.canSubmit(photoItems);
  const isUploading = upload.phase === 'uploading';
  const busy = isSending || isUploading;

  let kind = tab;
  if (hasPhotos || isAddingPhotos) {
    kind = 'photo';
  } else if (video) {
    kind = 'video';
  }
  const words = WORDS[kind];
  const isWriting = kind === 'article' || kind === 'topic';

  const name = title.trim();
  const text = body.trim();
  const titleShort = isWriting && name.length < NAME.MIN_LENGTH;
  const bodyMissing = isWriting && !text;
  let ready = !titleShort && !bodyMissing;
  if (kind === 'photo') {
    ready = photosReady;
  }

  const limits = {
    size: videos.megabytes(videos.maxBytes(nodeInfo)),
    minutes: Math.floor(videos.maxSeconds(nodeInfo) / 60),
    animationSize: videos.megabytes(videos.animationMaxBytes(nodeInfo)),
    seconds: videos.animationMaxSeconds(nodeInfo),
  };

  const alertSuccess = (message) => {
    dispatch(actions.app.alert.success(message));
  };
  const alertError = (message) => {
    dispatch(actions.app.alert.error(message));
  };

  useEffect(() => {
    if (upload.phase === 'ready') {
      alertSuccess(i18n.t('videos:upload.ready'));
    }
    if (upload.phase === 'failed') {
      alertError(i18n.t(`videos:problems.${upload.problem || 'failed'}`, limits));
    }
  }, [upload.phase]);

  // Everything back to empty, closed. The choices of audience and language
  // stay, as in the short box.
  const reset = () => {
    clearTitle();
    clearBody();
    setExcerpt('');
    setPhotoItems([]);
    setIsAddingPhotos(false);
    setVideo(null);
    setVideoProblem('');
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

    if (kind === 'video') {
      upload.start(actor, {
        name,
        body: text,
        ...choices.request(),
        allowDownload: choices.allowDownload,
      }, video).then((ok) => {
        if (ok) {
          // Posted by the server once it is ready, which is said then.
          alertSuccess(i18n.t('videos:upload.processing'));
          reset();
        }
      });
      return;
    }

    let post = { name, body: text, ...choices.request() };
    if (kind === 'photo') {
      post = {
        ...post,
        uploads: photoFiles.toRequest(photoItems),
        allow_download: choices.allowDownload,
      };
    }
    if (kind === 'article' && excerpt.trim()) {
      post = { ...post, excerpt: excerpt.trim() };
    }

    setIsSending(true);
    dispatch(actions[words.namespace].add(post, actor)).then(() => {
      alertSuccess(i18n.t('prompts:posted.success'));
      reset();
    }).catch(() => {
      // What was written stays, to post again.
      alertError(i18n.t('prompts:posted.error'));
    }).finally(() => {
      setIsSending(false);
    });
  };

  const chooseVideo = (event) => {
    const chosen = event.target.files && event.target.files[0];
    // The same file can be chosen again after it is taken off.
    // eslint-disable-next-line no-param-reassign
    event.target.value = '';
    if (!chosen) {
      return;
    }
    const problem = videos.problem(chosen, nodeInfo);
    if (problem) {
      setVideoProblem(i18n.t(`videos:problems.${problem}`, limits));
      return;
    }
    setVideoProblem('');
    setVideo(chosen);
    if (upload.phase !== 'idle') {
      upload.reset();
    }
  };

  // With its words beside it where there is room, the icon alone on a
  // phone, as in the short box.
  const attachButton = (label, tip, icon, onClick) => {
    if (phone) {
      return (
        <Tooltip title={tip}>
          <IconButton aria-label={tip} onClick={onClick}>
            {icon}
          </IconButton>
        </Tooltip>
      );
    }
    return (
      <Button
        startIcon={icon}
        sx={{ color: 'text.secondary', flexShrink: 0 }}
        onClick={onClick}
      >
        {label}
      </Button>
    );
  };

  // Hidden while posting rather than disabled: a tooltip on a disabled
  // button is never seen. Pictures, or a GIF or a video, not both.
  const showPhotos = canPhotos && !busy && !video && !isAddingPhotos;
  const showVideo = canVideo && !busy && !hasPhotos && !isAddingPhotos && !video;

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
            disabled={busy || (hasPhotos && !photosReady)}
            sx={{ minWidth: 88 }}
          >
            {!isSending && i18n.t('actions:post')}
            {isSending && <CircularProgress size={20} />}
          </Button>
        </Toolbar>
        {/* Article or Topic, until a picture or a video decides it. */}
        {kinds.length > 1 && isWriting &&
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
          {/* Each field keeps a line under it for what is wrong, so
              nothing moves when it is said. */}
          <TextField
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
            }}
            label={i18n.t(words.title)}
            placeholder={i18n.t(words.titlePlaceholder)}
            error={tried && titleShort}
            helperText={tried && titleShort ?
              i18n.t('composer:titleNeeded', { count: NAME.MIN_LENGTH }) : ' '}
            required={isWriting}
            disabled={busy}
            fullWidth
            autoFocus={!phone}
            slotProps={{
              htmlInput: { dir: choices.direction, maxLength: NAME.MAX_LENGTH },
              inputLabel: { shrink: true },
            }}
          />
          {/* What is attached, under the title, where it is seen. */}
          {isAddingPhotos &&
            <Box sx={{ pb: 2 }}>
              <PhotoFilesEditor
                owner={actor}
                items={photoItems}
                onChange={setPhotoItems}
                max={photoFiles.maxFiles(nodeInfo)}
                disabled={busy}
              />
              {!hasPhotos &&
                <Button
                  size="small"
                  onClick={() => {
                    setIsAddingPhotos(false);
                  }}
                >
                  {i18n.t('replies:attachments.noPhotos')}
                </Button>}
            </Box>}
          {video &&
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', pb: 2 }}>
              <VideoIcon fontSize="small" color="action" />
              <Typography variant="body2" sx={{ flexGrow: 1, overflowWrap: 'anywhere' }}>
                {`${video.name} · ${videos.megabytes(video.size)}`}
              </Typography>
              {!busy &&
                <IconButton
                  size="small"
                  aria-label={i18n.t('replies:attachments.removeVideo')}
                  onClick={() => {
                    setVideo(null);
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>}
            </Stack>}
          {isUploading &&
            <Stack spacing={1} sx={{ pb: 2 }}>
              <LinearProgress
                variant="determinate"
                value={upload.percent}
                aria-label={i18n.t('videos:upload.uploading', { percent: upload.percent })}
              />
              <Typography variant="body2" color="textSecondary">
                {i18n.t('videos:upload.keepOpen')}
              </Typography>
              <Button onClick={upload.cancel} size="small" sx={{ alignSelf: 'flex-start' }}>
                {i18n.t('videos:upload.cancel')}
              </Button>
            </Stack>}
          {videoProblem &&
            <Typography variant="caption" color="error" component="p" role="alert" sx={{ pb: 2 }}>
              {videoProblem}
            </Typography>}
          <TextField
            value={body}
            onChange={(event) => {
              setBody(event.target.value);
            }}
            label={i18n.t('articles:composer.body')}
            placeholder={i18n.t(words.bodyPlaceholder)}
            error={tried && bodyMissing}
            helperText={tried && bodyMissing ? i18n.t('composer:bodyNeeded') : ' '}
            required={isWriting}
            disabled={busy}
            multiline
            minRows={isWriting ? bodyRows : 6}
            fullWidth
            slotProps={{
              htmlInput: { dir: choices.direction, maxLength: BODY.MAX_LENGTH },
              inputLabel: { shrink: true },
            }}
          />
          {kind === 'article' &&
            <TextField
              value={excerpt}
              onChange={(event) => {
                setExcerpt(event.target.value);
              }}
              label={i18n.t('articles:composer.excerpt')}
              placeholder={i18n.t('articles:composer.excerptPlaceholder')}
              helperText=" "
              disabled={busy}
              multiline
              minRows={2}
              fullWidth
              slotProps={{
                htmlInput: { dir: choices.direction, maxLength: EXCERPT.MAX_LENGTH },
                inputLabel: { shrink: true },
              }}
            />}
        </Box>
        <Divider />
        {/* Attachments and choices in one row at the bottom; it scrolls
            sideways on a phone rather than wrapping. */}
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            alignItems: 'center', px: 1, py: 1, overflowX: 'auto',
          }}
        >
          {showPhotos &&
            attachButton(
              i18n.t('composer:photos'),
              i18n.t('replies:attachments.addPhotos'),
              <PhotoIcon />,
              () => {
                setIsAddingPhotos(true);
              },
            )}
          {showVideo &&
            attachButton(
              i18n.t('composer:video'),
              i18n.t('replies:attachments.addVideo'),
              <GifIcon />,
              () => {
                picker.current.click();
              },
            )}
          {choices.render({ busy, withDownload: kind === 'photo' || kind === 'video' })}
        </Stack>
        <input
          ref={picker}
          type="file"
          accept={videos.TYPES.join(',')}
          hidden
          onChange={chooseVideo}
        />
      </Box>
    </Dialog>
  );
};

LongComposer.propTypes = {
  actor: ActorType.isRequired,
  // What this profile takes, of `article` and `topic`.
  kinds: PropTypes.arrayOf(PropTypes.string).isRequired,
  // And of `photo` and `video`, which may be added here too.
  media: PropTypes.arrayOf(PropTypes.string),
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  body: PropTypes.string,
};

export default LongComposer;
