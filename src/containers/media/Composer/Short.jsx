import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import CloseIcon from '@mui/icons-material/Close';
import ExpandIcon from '@mui/icons-material/OpenInFull';
import VideoIcon from '@mui/icons-material/VideocamOutlined';
import WriteIcon from '@mui/icons-material/CreateOutlined';

import actions from '../../../actions';
import ActorAvatar from '../../../components/ActorAvatar';
import LinkPreviewCard from '../../../components/LinkPreviewCard';
import PhotoFilesEditor from '../../../components/PhotoFilesEditor';
import AttachButtons from './AttachButtons';
import VideoUploads from './VideoUploads';
import useDraft from './useDraft';
import useLinkPreview from './useLinkPreview';
import useTextareaHashtags from './useHashtagSuggestions';
import HashtagSuggestions from '../../../components/HashtagSuggestions';
import useOnFediverse from './useOnFediverse';
import useVideoUpload from './Video/useVideoUpload';
import usePostChoices from './usePostChoices';
import usePostLocations from './usePostLocations';
import photoPosition from '../../../utils/photoPosition';

import composer from '../../../utils/composer';
import photoFiles from '../../../utils/photoFiles';
import utils from '../../../utils';
import videos from '../../../utils/videos';
import ActorType from '../../../proptypes/Actor';
import { Medium as MEDIUM } from '../../../constants';
import i18n from '../../../languages';

const { CONTENT } = MEDIUM.FIELDS;
const { isPerson } = utils.node;

// The one box a post is written in, as a reply is: words, pictures, or a GIF
// or a video. What it becomes follows from what is in it: words alone are a
// note, pictures a photo post, a video a video post. None of them has a title;
// long writing, with one, is the extended composer's (`onExpand`).
//
// Closed, it is one line: an outlined button. Open, it is a dialog, in the
// middle of the screen on a desktop and filling it on a phone, where the
// keyboard needs the room; nothing in it changes height as somebody types.
// What is written is kept as a draft until it is posted (useDraft).
//
// `kinds` is what this profile takes, of note, photo and video.
const ShortComposer = ({
  actor,
  kinds,
  onExpand = null,
}) => {
  const dispatch = useDispatch();
  const viewer = useSelector((state) => { return state.session.viewer; });
  const nodeInfo = useSelector((state) => { return state.app.nodeInfo; });
  const phone = useMediaQuery((theme) => { return theme.breakpoints.down('sm'); });

  const [isOpen, setIsOpen] = useState(false);
  // The height of what can be seen, which a phone's keyboard takes from:
  // the full-screen composer keeps its bottom row above the keyboard. iOS
  // shrinks only this, not the page.
  const [visible, setVisible] = useState(0);
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!phone || !isOpen || !viewport) {
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
  }, [phone, isOpen]);
  const [body, setBody, clearDraft] = useDraft(actor.id);
  const [isSending, setIsSending] = useState(false);
  const [isAddingPhotos, setIsAddingPhotos] = useState(false);
  const [photoItems, setPhotoItems] = useState([]);
  const [video, setVideo] = useState(null);
  const [videoProblem, setVideoProblem] = useState('');
  const [handedOver, setHandedOver] = useState(0);
  const upload = useVideoUpload();

  const canWords = kinds.includes('note');
  const canPhotos = kinds.includes('photo');
  const canVideo = kinds.includes('video') && videos.isOn(nodeInfo);

  const choices = usePostChoices(actor, viewer);
  // Locations to tag the post with. Not with a video, whose post is made
  // only once the upload is ready.
  const postLocations = usePostLocations(actor.id);
  // Where the first photo with a position was taken, read in this browser
  // as it was picked; offered for suggesting locations near it, and used
  // only if asked. Kept nowhere but here, and gone with the photos.
  const [photoPoint, setPhotoPoint] = useState(null);

  const text = body.trim();
  const hasPhotos = photoItems.length > 0;
  const photosReady = hasPhotos && photoFiles.canSubmit(photoItems);
  const isUploading = upload.phase === 'uploading';
  const busy = isSending || isUploading;
  const hasSomething = composer.canPost({
    text,
    takesNotes: canWords,
    photosReady,
    hasVideo: Boolean(video),
  });
  const isHeldBack = (hasPhotos && !photosReady) || busy;

  const linkPreview = useLinkPreview(body, canWords && !hasPhotos && !video);
  // Hashtags in use offered as one is typed (roadmap row 78).
  const hashtags = useTextareaHashtags({ value: body, onChange: setBody, phone });

  // A post open to everybody on the writer's own profile goes to their
  // followers on other servers. Said before posting when it will not.
  const onFediverse = useOnFediverse(viewer);
  const staysHere = onFediverse && actor.id === viewer.id && choices.access !== 'public';
  // And, when it will go, its locations go with it.
  const goesOut = onFediverse && actor.id === viewer.id && choices.access === 'public';

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

  // Everything back to an empty box, closed. The choices of audience and
  // language stay; who may reply is asked of each post.
  const reset = () => {
    clearDraft();
    postLocations.clear();
    setPhotoItems([]);
    setPhotoPoint(null);
    setIsAddingPhotos(false);
    setVideo(null);
    setVideoProblem('');
    choices.posted();
    linkPreview.reset();
    setIsOpen(false);
  };

  const shared = () => {
    return {
      content: text,
      ...choices.request(),
      // Tied as it is made, so it goes to other servers with them.
      ...(postLocations.locations.length > 0 ? { location_ids: postLocations.ids() } : {}),
    };
  };

  const posted = () => {
    alertSuccess(i18n.t('prompts:posted.success'));
    reset();
  };

  const handleSubmit = (event) => {
    if (event) {
      event.preventDefault();
    }
    if (!hasSomething || isHeldBack) {
      return;
    }

    if (video) {
      upload.start(actor, {
        title: '',
        content: text,
        ...choices.request(),
        allowDownload: choices.allowDownload,
      }, video).then((ok) => {
        if (ok) {
          setHandedOver(handedOver + 1);
          reset();
        }
      });
      return;
    }

    const kind = composer.kindOf({ hasPhotos: photosReady });
    const post = kind === 'photo' ? {
      ...shared(),
      title: '',
      uploads: photoFiles.toRequest(photoItems),
      allow_download: choices.allowDownload,
    } : {
      ...shared(),
      // Which link the card is for. What the card says is the server's.
      ...(linkPreview.url ? { link_preview_url: linkPreview.url } : {}),
    };
    const namespace = kind === 'photo' ? 'photos' : 'notes';

    setIsSending(true);
    dispatch(actions[namespace].add(post, actor)).then(posted).catch(() => {
      // The words and pictures stay, to post again.
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

  const open = () => {
    postLocations.reload();
    setIsOpen(true);
  };

  const placeholder = isPerson(actor) && actor.id !== viewer.id ?
    i18n.t('notes:composer.bodyPlaceholderPerson', { name: actor.name }) :
    i18n.t('notes:composer.bodyPlaceholder');

  // Photos, or a GIF or a video: one or the other, as in a reply. Photo
  // opens the place to drop them and, while it is empty, closes it again. Hidden
  // while posting rather than disabled: a tooltip on a disabled button is
  // never seen.
  const attachButtons = (
    <AttachButtons
      phone={phone}
      photos={canPhotos && !busy && !video && !hasPhotos}
      video={canVideo && !busy && !hasPhotos && !video}
      photosOpen={isAddingPhotos}
      onPhotos={() => {
        setIsAddingPhotos(!isAddingPhotos);
      }}
      onVideo={takeVideo}
    />
  );

  const options = choices.render({ busy, withDownload: hasPhotos || Boolean(video) });

  // What is written goes along to the extended composer, and is its draft
  // from then on.
  const expand = () => {
    setIsOpen(false);
    onExpand(body);
    clearDraft();
  };

  // Hidden rather than disabled while posting: a tooltip on a disabled
  // button is never seen. The icon alone beside the closed box and on a
  // phone, named Long content; with those words beside it in the open box
  // on a desktop.
  const expandButton = (withWords) => {
    if (!onExpand || busy) {
      return null;
    }
    if (!withWords) {
      return (
        <Tooltip title={i18n.t('composer:longContent')}>
          <IconButton
            aria-label={i18n.t('composer:longContent')}
            onClick={expand}
          >
            <ExpandIcon />
          </IconButton>
        </Tooltip>
      );
    }
    return (
      <Button
        startIcon={<ExpandIcon />}
        sx={{ color: 'text.secondary', flexShrink: 0 }}
        onClick={expand}
      >
        {i18n.t('composer:longContent')}
      </Button>
    );
  };

  const postButton = (fullWidth) => {
    return (
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={!hasSomething || isHeldBack}
        fullWidth={fullWidth}
        sx={fullWidth ? {} : { minWidth: 88 }}
      >
        {!isSending && i18n.t('actions:post')}
        {isSending && <CircularProgress size={20} />}
      </Button>
    );
  };

  // What is written and what goes with it, the same in place and full
  // screen.
  const content = (
    <>
      <TextField
        value={body}
        onChange={(event) => {
          setBody(event.target.value);
        }}
        onPaste={linkPreview.onPaste}
        placeholder={placeholder}
        aria-label={placeholder}
        autoFocus
        disabled={busy}
        variant="standard"
        multiline
        minRows={6}
        fullWidth
        inputRef={hashtags.inputRef}
        slotProps={{
          input: { disableUnderline: true },
          htmlInput: {
            dir: choices.direction,
            maxLength: CONTENT.MAX_LENGTH,
            ...hashtags.handlers,
          },
        }}
      />
      <HashtagSuggestions {...hashtags.overlay} />
      {!hasPhotos && !video &&
        <LinkPreviewCard
          preview={linkPreview.preview}
          onRemove={busy ? null : linkPreview.remove}
        />}
      {!video && postLocations.chips({ disabled: busy, goesOut })}
      {isAddingPhotos &&
        <Box sx={{ mt: 1 }}>
          <PhotoFilesEditor
            owner={actor}
            items={photoItems}
            onChange={setPhotoItems}
            max={photoFiles.maxFiles(nodeInfo)}
            disabled={busy}
            videoMimetypes={canVideo ? videos.TYPES : []}
            onVideo={takeVideo}
            onPicked={(files) => {
              if (!photoPoint) {
                photoPosition.read(files).then((point) => {
                  if (point) {
                    setPhotoPoint(point);
                  }
                });
              }
            }}
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
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1 }}>
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
        <Stack spacing={1} sx={{ mt: 2 }}>
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
        <Typography variant="caption" color="error" component="p" role="alert" sx={{ mt: 1 }}>
          {videoProblem}
        </Typography>}
      {!canWords && text && !hasPhotos && !video &&
        <Typography variant="caption" color="textSecondary" component="p" sx={{ mt: 1 }}>
          {i18n.t('composer:needsPicture')}
        </Typography>}
      {staysHere &&
        <Typography variant="caption" color="textSecondary" component="p" sx={{ mt: 1 }}>
          {i18n.t('federation:composer.staysHere')}
        </Typography>}
    </>
  );

  // A video being prepared, said when the box is closed again.
  const preparing = upload.phase === 'processing' &&
    <Stack spacing={1} sx={{ px: 2, pb: 2 }}>
      <LinearProgress />
      <Typography variant="body2" color="textSecondary">
        {i18n.t('videos:upload.processing')}
      </Typography>
    </Stack>;

  const uploadsList = canVideo &&
    <VideoUploads
      viewerId={viewer.id}
      exceptId={upload.upload ? upload.upload.id : 0}
      limits={limits}
      refreshKey={handedOver}
    />;

  // Closed: an outlined button saying what it is for, or how the draft
  // begins, and the way to longer writing (the user, 2026-10-17: an
  // outlined button, the box opening in a dialog).
  const closed = (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', p: 2 }}>
      <ActorAvatar actor={viewer} />
      <Button
        variant="outlined"
        startIcon={<WriteIcon />}
        onClick={() => {
          open();
        }}
        sx={{
          flexGrow: 1,
          minWidth: 0,
          minHeight: 48,
          justifyContent: 'flex-start',
          textTransform: 'none',
          fontSize: '1rem',
        }}
      >
        <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {body || placeholder}
        </Box>
      </Button>
      {expandButton(false)}
    </Stack>
  );

  // Open, in a dialog: the whole screen on a phone, where the keyboard
  // needs the room, and in the middle of it on a desktop. The same in both.
  return (
    <Card>
      {closed}
      {preparing}
      {uploadsList}
      <Dialog
        fullScreen={phone}
        fullWidth
        maxWidth="sm"
        open={isOpen}
        slotProps={{
          paper: { sx: visible ? { height: visible, maxHeight: visible } : {} },
        }}
        onClose={() => {
          if (!busy) {
            setIsOpen(false);
          }
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
          {/* Close, Long content and Post at the top, where a thumb
              finds them above the keyboard. */}
          <Toolbar sx={{ gap: 1, px: 1 }}>
            <IconButton
              edge="start"
              aria-label={i18n.t('composer:close')}
              disabled={busy}
              onClick={() => {
                setIsOpen(false);
              }}
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {i18n.t('composer:newPost')}
            </Typography>
            {expandButton(!phone)}
            {postButton(false)}
          </Toolbar>
          <Divider />
          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
            <Stack direction="row" spacing={2}>
              <ActorAvatar actor={viewer} />
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                {content}
              </Box>
            </Stack>
          </Box>
          <Divider />
          {/* Attachments and choices in one row at the bottom, within a
              thumb's reach; it scrolls sideways rather than wrapping. */}
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              alignItems: 'center', px: 1, py: 1, overflowX: 'auto',
            }}
          >
            {attachButtons}
            {!video && !busy && postLocations.button({ photoPoint: hasPhotos ? photoPoint : null })}
            {options}
          </Stack>
        </Box>
      </Dialog>
    </Card>
  );
};

ShortComposer.propTypes = {
  actor: ActorType.isRequired,
  // What this profile takes, of `note`, `photo` and `video`.
  kinds: PropTypes.arrayOf(PropTypes.string).isRequired,
  // Opens the extended composer, with what was written so far. Not given
  // where the profile takes no articles or topics.
  onExpand: PropTypes.func,
};

export default ShortComposer;
