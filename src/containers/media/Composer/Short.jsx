import React, { useEffect, useState } from 'react';
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
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import CloseIcon from '@mui/icons-material/Close';
import ExpandIcon from '@mui/icons-material/OpenInFull';
import VideoIcon from '@mui/icons-material/VideocamOutlined';

import actions from '../../../actions';
import api from '../../../api';
import ActorAvatar from '../../../components/ActorAvatar';
import LinkPreviewCard from '../../../components/LinkPreviewCard';
import PhotoFilesEditor from '../../../components/PhotoFilesEditor';
import AttachButtons from './AttachButtons';
import ThreadParts from './ThreadParts';
import VideoUploads from './VideoUploads';
import useDraft from './useDraft';
import useLinkPreview from './useLinkPreview';
import useTextareaHashtags from './useHashtagSuggestions';
import HashtagSuggestions from '../../../components/HashtagSuggestions';
import useOnFediverse, { useOnBluesky } from './useOnFediverse';
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
import LIMITS from '../../../constants/limits';
import i18n from '../../../languages';
import useRulesFirst from '../../rules/useRulesFirst';

const { CONTENT } = MEDIUM.FIELDS;
const { isPerson } = utils.node;

// The one box a post is written in, as a reply is: words, pictures, or a GIF
// or a video. What it becomes follows from what is in it: words alone are a
// note, pictures a photo post, a video a video post. None of them has a title;
// long writing, with one, is the extended composer's (`onExpand`).
//
// A dialog, opened by the + button (ComposeButton.jsx, roadmap row 99), in
// the middle of the screen on a desktop and filling it on a phone, where the
// keyboard needs the room; nothing in it changes height as somebody types.
// What is written is kept as a draft until it is posted (useDraft).
//
// `kinds` is what this profile takes, of note, photo and video.
// `onPreparing` is told whether a video posted from
// it is still being prepared, which the button shows once it is closed.
const ShortComposer = ({
  actor,
  kinds,
  open: isOpen,
  onClose,
  onExpand = null,
  onPreparing = null,
}) => {
  const dispatch = useDispatch();
  const viewer = useSelector((state) => { return state.session.viewer; });
  const nodeInfo = useSelector((state) => { return state.app.nodeInfo; });
  const phone = useMediaQuery((theme) => { return theme.breakpoints.down('sm'); });

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
  // The notes of a thread after the first, written in one go (roadmap row
  // 101).
  const [moreParts, setMoreParts] = useState([]);
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
  // A thread is of notes: words alone, no pictures and no video.
  const canThread = canWords && !hasPhotos && !video && !isAddingPhotos;
  const threadParts = canThread ?
    moreParts.map((each) => { return each.trim(); }).filter(Boolean) : [];
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
  // And to Bluesky, where the writer has connected their account there.
  const onBluesky = useOnBluesky(viewer);
  const goesToBluesky = onBluesky && actor.id === viewer.id && choices.access === 'public';
  // What other networks will show of it, said before it is posted (roadmap
  // row 100): the first 300 letters on Bluesky, the first four pictures on
  // Mastodon and Bluesky, with a link to the post here for the rest.
  const cutForBluesky = goesToBluesky && [...body].length > LIMITS.BLUESKY_POST_MAX;
  const morePictures = photoItems.length > LIMITS.PICTURES_SHOWN_MAX && (
    (goesOut && goesToBluesky && 'federation:composer.morePictures') ||
    (goesOut && 'federation:composer.morePicturesMastodon') ||
    (goesToBluesky && 'federation:composer.morePicturesBluesky'));

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
    setMoreParts([]);
    setPhotoPoint(null);
    setIsAddingPhotos(false);
    setVideo(null);
    setVideoProblem('');
    choices.posted();
    linkPreview.reset();
    onClose();
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

  // Posting on a group or an event whose rules changed since the writer
  // agreed: agreed to again first (roadmap row 102, part 5c).
  const rules = useRulesFirst(actor, 'post');

  const handleSubmit = (event) => {
    if (event) {
      event.preventDefault();
    }
    if (!hasSomething || isHeldBack) {
      return;
    }
    rules.run(() => {
      // eslint-disable-next-line no-use-before-define
      sendPost();
    });
  };

  const sendPost = () => {
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

    // A thread: its notes made together, in order, all or none. The first
    // takes what a post takes; the rest are replies to the one before.
    if (threadParts.length > 0) {
      const { language } = choices.request();
      const post = shared();
      delete post.content;
      const parts = [text, ...threadParts].map((content, at) => {
        return {
          content,
          language,
          ...(at === 0 && linkPreview.url ? { linkPreviewUrl: linkPreview.url } : {}),
        };
      });
      setIsSending(true);
      api.replies.addThread(actor, post, parts).then((result) => {
        // Its first note, at the head of the open feed, as any post.
        dispatch({ type: 'NOTES_ADD_SUCCESS', node: result.data.parts[0] });
        posted();
      }).catch(() => {
        alertError(i18n.t('prompts:posted.error'));
      }).finally(() => {
        setIsSending(false);
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

  // Opened: the locations offered are read again.
  useEffect(() => {
    if (isOpen) {
      postLocations.reload();
    }
  }, [isOpen]);

  // A video still being prepared, said to the button.
  const isPreparing = upload.phase === 'processing';
  useEffect(() => {
    if (onPreparing) {
      onPreparing(isPreparing);
    }
  }, [isPreparing]);

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
    onClose();
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
      {/* Its line is kept while the post goes to Bluesky, so that nothing
          moves when the words grow past what a post there holds. */}
      {goesToBluesky &&
        <Typography variant="caption" color="textSecondary" component="p">
          {cutForBluesky ?
            i18n.t('federation:composer.cutForBluesky', { max: LIMITS.BLUESKY_POST_MAX }) :
            ' '}
        </Typography>}
      {!hasPhotos && !video &&
        <LinkPreviewCard
          preview={linkPreview.preview}
          onRemove={busy ? null : linkPreview.remove}
        />}
      {canThread &&
        <ThreadParts
          parts={moreParts}
          onChange={setMoreParts}
          canAdd={Boolean(text) && !moreParts.some((each) => { return !each.trim(); })}
          max={LIMITS.THREAD_PARTS_MAX}
          disabled={busy}
          direction={choices.direction}
          goesToBluesky={goesToBluesky}
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
      {morePictures &&
        <Typography variant="caption" color="textSecondary" component="p" sx={{ mt: 1 }}>
          {i18n.t(morePictures, { max: LIMITS.PICTURES_SHOWN_MAX })}
        </Typography>}

    </>
  );

  // A video being prepared.
  const preparing = isPreparing &&
    <Stack spacing={1} sx={{ pt: 2 }}>
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

  // Open, in a dialog: the whole screen on a phone, where the keyboard
  // needs the room, and in the middle of it on a desktop. The same in both.
  return (
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
          onClose();
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
              onClose();
            }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, minWidth: 0 }}>
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
          {preparing}
          {uploadsList}
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
      {rules.dialog}
    </Dialog>
  );
};

ShortComposer.propTypes = {
  actor: ActorType.isRequired,
  // What this profile takes, of `note`, `photo` and `video`.
  kinds: PropTypes.arrayOf(PropTypes.string).isRequired,
  // Opens the extended composer, with what was written so far. Not given
  // where the profile takes no articles or topics.
  onExpand: PropTypes.func,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onPreparing: PropTypes.func,
};

export default ShortComposer;
