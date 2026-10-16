import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
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
import ExpandIcon from '@mui/icons-material/EditNoteOutlined';
import GifIcon from '@mui/icons-material/GifBoxOutlined';
import PhotoIcon from '@mui/icons-material/Photo';
import VideoIcon from '@mui/icons-material/VideocamOutlined';

import actions from '../../../actions';
import ActorAvatar from '../../../components/ActorAvatar';
import LinkPreviewCard from '../../../components/LinkPreviewCard';
import PhotoFilesEditor from '../../../components/PhotoFilesEditor';
import VideoUploads from './VideoUploads';
import useDraft from './useDraft';
import useLinkPreview from './useLinkPreview';
import useOnFediverse from './useOnFediverse';
import useVideoUpload from './Video/useVideoUpload';
import usePostChoices from './usePostChoices';

import composer from '../../../utils/composer';
import photoFiles from '../../../utils/photoFiles';
import utils from '../../../utils';
import videos from '../../../utils/videos';
import ActorType from '../../../proptypes/Actor';
import { Medium as MEDIUM } from '../../../constants';
import i18n from '../../../languages';

const { BODY } = MEDIUM.FIELDS;
const { isPerson } = utils.node;

// The one box a post is written in, as a reply is: words, pictures, or a GIF
// or a video. What it becomes follows from what is in it: words alone are a
// note, pictures a photo post, a video a video post. None of them has a title;
// long writing, with one, is the extended composer's (`onExpand`).
//
// Closed, it is one line. Open, it is in place on a desktop and fills the
// screen on a phone, where the keyboard needs the room; nothing in it changes
// height as somebody types. What is written is kept as a draft until it is
// posted (useDraft).
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
  const picker = useRef(null);
  const upload = useVideoUpload();

  const canWords = kinds.includes('note');
  const canPhotos = kinds.includes('photo');
  const canVideo = kinds.includes('video') && videos.isOn(nodeInfo);

  const choices = usePostChoices(actor, viewer);

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

  // A post open to everybody on the writer's own profile goes to their
  // followers on other servers. Said before posting when it will not.
  const onFediverse = useOnFediverse(viewer);
  const staysHere = onFediverse && actor.id === viewer.id && choices.access !== 'public';

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
    setPhotoItems([]);
    setIsAddingPhotos(false);
    setVideo(null);
    setVideoProblem('');
    choices.posted();
    linkPreview.reset();
    setIsOpen(false);
  };

  const shared = () => {
    return { body: text, ...choices.request() };
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
        name: '',
        body: text,
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
      name: '',
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

  const chooseVideo = (event) => {
    const chosen = event.target.files && event.target.files[0];
    // The same file can be chosen again after it is taken off.
    // eslint-disable-next-line no-param-reassign
    event.target.value = '';
    if (chosen) {
      takeVideo(chosen);
    }
  };

  const open = (then) => {
    setIsOpen(true);
    if (then === 'photos') {
      setIsAddingPhotos(true);
    }
  };

  const placeholder = isPerson(actor) && actor.id !== viewer.id ?
    i18n.t('notes:composer.bodyPlaceholderPerson', { name: actor.name }) :
    i18n.t('notes:composer.bodyPlaceholder');

  // Pictures, or a GIF or a video: one or the other, as in a reply.
  const attachButtons = (
    <>
      {canPhotos && !busy && !video && !isAddingPhotos &&
        <Tooltip title={i18n.t('replies:attachments.addPhotos')}>
          <IconButton
            aria-label={i18n.t('replies:attachments.addPhotos')}
            onClick={() => {
              setIsAddingPhotos(true);
            }}
          >
            <PhotoIcon />
          </IconButton>
        </Tooltip>}
      {canVideo && !busy && !hasPhotos && !isAddingPhotos && !video &&
        <Tooltip title={i18n.t('replies:attachments.addVideo')}>
          <IconButton
            aria-label={i18n.t('replies:attachments.addVideo')}
            onClick={() => {
              picker.current.click();
            }}
          >
            <GifIcon />
          </IconButton>
        </Tooltip>}
    </>
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
  // button is never seen. With its words beside it where there is room,
  // and the icon alone on a phone, where the box needs the width.
  const expandButton = onExpand && !busy && (phone ?
    <Tooltip title={i18n.t('composer:longContent')}>
      <IconButton
        aria-label={i18n.t('composer:longContent')}
        onClick={expand}
      >
        <ExpandIcon />
      </IconButton>
    </Tooltip> :
    <Button
      startIcon={<ExpandIcon />}
      sx={{ color: 'text.secondary', flexShrink: 0 }}
      onClick={expand}
    >
      {i18n.t('composer:longContent')}
    </Button>);

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
        variant={phone ? 'standard' : 'outlined'}
        multiline
        minRows={phone ? 6 : 3}
        fullWidth
        slotProps={{
          input: phone ? { disableUnderline: true } : {},
          htmlInput: {
            dir: choices.direction,
            maxLength: BODY.MAX_LENGTH,
          },
        }}
      />
      {!hasPhotos && !video &&
        <LinkPreviewCard
          preview={linkPreview.preview}
          onRemove={busy ? null : linkPreview.remove}
        />}
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

  const videoInput = (
    <input
      ref={picker}
      type="file"
      accept={videos.TYPES.join(',')}
      hidden
      onChange={chooseVideo}
    />
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

  // Closed: one line, as the reply box starts, with a way straight to the
  // pictures, a video, or longer writing.
  const closed = (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', p: 2 }}>
      <ActorAvatar actor={viewer} />
      <ButtonBase
        onClick={() => {
          open();
        }}
        sx={{
          flexGrow: 1,
          justifyContent: 'flex-start',
          minHeight: 48,
          px: 2,
          // Its ends as round as the avatar beside it; the border an
          // outlined text field's, darker on hover.
          borderRadius: '999px',
          border: 1,
          borderColor: (theme) => {
            return theme.palette.mode === 'dark' ?
              'rgba(255, 255, 255, 0.23)' :
              'rgba(0, 0, 0, 0.23)';
          },
          '&:hover': {
            borderColor: 'text.primary',
          },
          color: 'text.secondary',
          textAlign: 'start',
        }}
      >
        <Typography variant="body1" noWrap>
          {body || placeholder}
        </Typography>
      </ButtonBase>
      {canPhotos && phone &&
        <Tooltip title={i18n.t('replies:attachments.addPhotos')}>
          <IconButton
            aria-label={i18n.t('replies:attachments.addPhotos')}
            onClick={() => {
              open('photos');
            }}
          >
            <PhotoIcon />
          </IconButton>
        </Tooltip>}
      {canPhotos && !phone &&
        <Button
          startIcon={<PhotoIcon />}
          sx={{ color: 'text.secondary', flexShrink: 0 }}
          onClick={() => {
            open('photos');
          }}
        >
          {i18n.t('composer:photos')}
        </Button>}
      {expandButton}
    </Stack>
  );

  if (phone) {
    return (
      <Card>
        {closed}
        {preparing}
        {uploadsList}
        {videoInput}
        <Dialog
          fullScreen
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
            {/* Close and Post at the top, where a thumb finds them above
                the keyboard. */}
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
              {options}
              {expandButton}
            </Stack>
          </Box>
        </Dialog>
      </Card>
    );
  }

  return (
    <Card>
      {videoInput}
      {!isOpen && closed}
      {isOpen &&
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ p: 2 }}>
          <Stack direction="row" spacing={2}>
            <ActorAvatar actor={viewer} />
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              {content}
              <Stack
                direction="row"
                spacing={0.5}
                sx={{
                  alignItems: 'center', flexWrap: 'wrap', mt: 1, ml: -1,
                }}
              >
                {attachButtons}
                {options}
                <Box sx={{ flexGrow: 1 }} />
                {expandButton}
              </Stack>
              {/* Buttons the width of the box, side by side, as in the
                  reply form. Closing keeps what was written. */}
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button
                  fullWidth
                  disabled={busy}
                  onClick={() => {
                    setIsOpen(false);
                  }}
                >
                  {i18n.t('composer:close')}
                </Button>
                {postButton(true)}
              </Stack>
            </Box>
          </Stack>
        </Box>}
      {preparing}
      {uploadsList}
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
