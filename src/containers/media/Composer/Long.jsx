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
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import CloseIcon from '@mui/icons-material/Close';
import VideoIcon from '@mui/icons-material/VideocamOutlined';

import actions from '../../../actions';
import coverApi from '../../../api/cover';
import linkPreviewsApi from '../../../api/linkPreviews';
import PhotoFilesEditor from '../../../components/PhotoFilesEditor';
import AttachButtons from './AttachButtons';
import CoverPicker from './CoverPicker';
import LongEditor from './LazyLongEditor';
import useDraft from './useDraft';
import usePostChoices from './usePostChoices';
import useVideoUpload from './Video/useVideoUpload';

import embeds from '../../../utils/embeds';
import photoFiles from '../../../utils/photoFiles';
import uploads from '../../../utils/upload';
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

  const [tab, setTab] = useState(kinds[0]);
  useEffect(() => {
    if (kinds.length > 0 && !kinds.includes(tab)) {
      setTab(kinds[0]);
    }
  }, [kinds]);

  const [title, setTitle, clearTitle] = useDraft(actor.id, 'long-title');
  const [body, setBody, clearBody] = useDraft(actor.id, 'long-body');
  const [excerpt, setExcerpt] = useState('');
  const [cover, setCover] = useState(null);
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

  // The text starts a few lines tall, and grows as somebody writes or as
  // its corner is dragged (LongEditor).
  const bodyRows = 8;

  const canPhotos = media.includes('photo');
  const canVideo = media.includes('video') && videos.isOn(nodeInfo);
  const hasPhotos = photoItems.length > 0;
  const photosReady = hasPhotos && photoFiles.canSubmit(photoItems);
  const isUploading = upload.phase === 'uploading';
  const busy = isSending || isUploading;

  // Pictures decide it once one is in: opening the place to drop them
  // changes nothing else, so it can be closed again with nothing lost.
  let kind = tab;
  if (hasPhotos) {
    kind = 'photo';
  } else if (video) {
    kind = 'video';
  }
  const words = WORDS[kind];
  const isWriting = kind === 'article' || kind === 'topic';

  // A page elsewhere on a line of its own is shown by its card. Its preview
  // is asked for while the text is written, once each, so that it is there
  // to keep when the post is saved: the server keeps only what
  // link-preview-service has read. Nothing is shown here for it.
  const asked = useRef(new Set());
  useEffect(() => {
    if (!open || (kind !== 'article' && kind !== 'topic')) {
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
  }, [body, open, kind]);

  const name = title.trim();
  const text = body.trim();
  const titleShort = isWriting && name.length < NAME.MIN_LENGTH;
  const bodyMissing = isWriting && !text;
  // The editor has no limit of its own, as a text box had: said as soon as
  // it is passed, since the server would refuse it.
  const bodyTooLong = text.length > BODY.MAX_LENGTH;
  let ready = !titleShort && !bodyMissing;
  if (kind === 'photo') {
    ready = photosReady;
  }
  ready = ready && !bodyTooLong;
  let bodyError = '';
  if (bodyTooLong) {
    bodyError = i18n.t('composer:tooLong', { count: BODY.MAX_LENGTH });
  } else if (tried && bodyMissing) {
    bodyError = i18n.t('composer:bodyNeeded');
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
    setCover(null);
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

  // A video picked with its own button, or picked or dropped where the
  // photos are.
  const takeVideo = (chosen) => {
    const problem = videos.problem(chosen, nodeInfo);
    if (problem) {
      setVideoProblem(i18n.t(`videos:problems.${problem}`, limits));
      return;
    }
    setVideoProblem('');
    setVideo(chosen);
    setIsAddingPhotos(false);
    if (upload.phase !== 'idle') {
      upload.reset();
    }
  };

  // Hidden while posting rather than disabled: a tooltip on a disabled
  // button is never seen. Pictures, or a GIF or a video, not both. Photo
  // opens the place to drop them and, while it is empty, closes it again.
  const showPhotos = canPhotos && !busy && !video && !hasPhotos;
  const showVideo = canVideo && !busy && !hasPhotos && !video;

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
          {kind === 'article' &&
            <CoverPicker file={cover} onChange={setCover} disabled={busy} />}
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
                videoMimetypes={canVideo ? videos.TYPES : []}
                onVideo={takeVideo}
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
          <LongEditor
            value={body}
            onChange={setBody}
            label={i18n.t('articles:composer.body')}
            placeholder={i18n.t(words.bodyPlaceholder)}
            error={bodyError !== ''}
            helperText={bodyError || ' '}
            required={isWriting}
            disabled={busy}
            dir={choices.direction}
            minHeight={(isWriting ? bodyRows : 6) * 23}
            // Flush with the top of the dialog's scrolling part, over its
            // padding.
            stickyTop={-24}
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
          <AttachButtons
            phone={phone}
            photos={showPhotos}
            video={showVideo}
            photosOpen={isAddingPhotos}
            onPhotos={() => {
              setIsAddingPhotos(!isAddingPhotos);
            }}
            onVideo={takeVideo}
          />
          {choices.render({ busy, withDownload: kind === 'photo' || kind === 'video' })}
        </Stack>
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
