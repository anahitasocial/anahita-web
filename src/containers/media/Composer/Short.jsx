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
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import BackIcon from '@mui/icons-material/ArrowBack';
import ChevronIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import ExpandIcon from '@mui/icons-material/OpenInFull';
import VideoIcon from '@mui/icons-material/VideocamOutlined';
import TagPeopleIcon from '@mui/icons-material/PersonAddOutlined';
import Chip from '@mui/material/Chip';

import actions from '../../../actions';
import api from '../../../api';
import ActorAvatar from '../../../components/ActorAvatar';
import DetailRow from '../../../components/DetailRow';
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
import { progressOf } from './Video/useVideoUpload';
import { useSharedVideoUpload } from './Video/SharedVideoUpload';
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
import { TagPeoplePicker, tagPeople, tagOutcomeMessage } from '../TagPeopleDialog';

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
// Two steps (roadmap row 114): the post itself, its words and its photos,
// GIF or video, with one line under them saying who can see it, its
// language and who may reply; and its Details, each choice a row, its
// location and who is in it among them, each with the room it needs.
// Back returns to the words with everything kept, and Post is on both, so
// a few words are still posted with one tap.
//
// `kinds` is what this profile takes, of note, photo and video. A video
// posted from it is the app's to send (Video/SharedVideoUpload), and the
// + button says how far it has got once this is closed.
const ShortComposer = ({
  actor,
  kinds,
  open: isOpen,
  onClose,
  onExpand = null,
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
  // Photos picked with the photo button, handed to the editor to take.
  const [incoming, setIncoming] = useState(null);
  // Who is in the photos, tagged once the post is made (roadmap row 103).
  const [people, setPeople] = useState([]);
  const [isTagging, setIsTagging] = useState(false);
  // The notes of a thread after the first, written in one go (roadmap row
  // 101).
  const [moreParts, setMoreParts] = useState([]);
  const [video, setVideo] = useState(null);
  const [videoProblem, setVideoProblem] = useState('');
  const [handedOver, setHandedOver] = useState(0);
  // 'write', the post itself, or 'details', what goes with it.
  const [step, setStep] = useState('write');
  const onDetails = step === 'details';
  // The dialog's height as Details opens, kept so that it does not jump
  // from one step to the other on a wider screen.
  const form = React.useRef(null);
  const [held, setHeld] = useState(0);
  const toDetails = () => {
    setHeld(form.current ? form.current.offsetHeight : 0);
    setStep('details');
  };
  // The app's, so that it goes on being sent from page to page.
  const upload = useSharedVideoUpload();

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

  // Everything back to an empty box, closed. The choices of audience and
  // language stay; who may reply is asked of each post.
  const reset = () => {
    clearDraft();
    postLocations.clear();
    setPhotoItems([]);
    setPeople([]);
    setMoreParts([]);
    setPhotoPoint(null);
    setIsAddingPhotos(false);
    setIncoming(null);
    setVideo(null);
    setVideoProblem('');
    setStep('write');
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
    // Whoever is in the photos is tagged once the post is made; who could
    // not be, or is asked first, is said so instead of "Posted".
    const tagged = kind === 'photo' ? people : [];
    dispatch(actions[namespace].add(post, actor)).then((made) => {
      if (tagged.length === 0 || !made || !made.id) {
        posted();
        return null;
      }
      return tagPeople(made, tagged).then((outcomes) => {
        const said = tagOutcomeMessage(outcomes);
        if (said.error) {
          alertError(said.text);
        } else if (outcomes.some((each) => { return each.outcome === 'asked'; })) {
          alertSuccess(said.text);
        } else {
          alertSuccess(i18n.t('prompts:posted.success'));
        }
        reset();
      });
    }).catch(() => {
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

  // The last photo taken out: the place for them closes, as it opened.
  const hadPhotos = React.useRef(false);
  useEffect(() => {
    if (photoItems.length > 0) {
      hadPhotos.current = true;
    } else if (hadPhotos.current) {
      hadPhotos.current = false;
      setIsAddingPhotos(false);
    }
  }, [photoItems.length]);

  // Opened: the locations offered are read again, and it opens on the
  // words.
  useEffect(() => {
    if (isOpen) {
      postLocations.reload();
      setStep('write');
    }
  }, [isOpen]);

  const isPreparing = upload.phase === 'processing';

  const placeholder = isPerson(actor) && actor.id !== viewer.id ?
    i18n.t('notes:composer.bodyPlaceholderPerson', { name: actor.name }) :
    i18n.t('notes:composer.bodyPlaceholder');

  // Photos, or a GIF or a video: one or the other, as in a reply. Photo
  // opens the system's picker at once, and what is picked shows straight
  // away, being sent. Hidden while posting rather than disabled: a tooltip
  // on a disabled button is never seen.
  const attachButtons = (
    <AttachButtons
      phone={phone}
      photos={canPhotos && !busy && !video && !hasPhotos}
      video={canVideo && !busy && !hasPhotos && !video}
      onPhotos={(files) => {
        setIsAddingPhotos(true);
        setIncoming({ files });
      }}
      onVideo={takeVideo}
    />
  );

  // What goes with the post, each a row (roadmap row 114). Who can see it
  // and whether it goes to other servers is said under them.
  const details = (
    <>
      <List disablePadding>
        {choices.rows({ busy, withDownload: hasPhotos || Boolean(video) })}
        {/* What is chosen in chips under each row, where each can be
            taken off: said once, not in the row as well. */}
        {!video && postLocations.button({
          disabled: busy,
          photoPoint: hasPhotos ? photoPoint : null,
          row: true,
        })}
        {!video &&
          <Box sx={{ pl: 7, pr: 2 }}>
            {postLocations.chips({ disabled: busy, goesOut })}
          </Box>}
        {hasPhotos &&
          <DetailRow
            icon={<TagPeopleIcon />}
            label={i18n.t('peopleTags:menu')}
            aria-haspopup="dialog"
            disabled={busy}
            onClick={() => { setIsTagging(true); }}
          />}
        {hasPhotos && people.length > 0 &&
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{
              alignItems: 'center', flexWrap: 'wrap', pl: 7, pr: 2,
            }}
          >
            {people.map((person) => {
              return (
                <Chip
                  key={`tagged-${person.id}`}
                  size="small"
                  label={utils.node.getActorName(person)}
                  onDelete={busy ? undefined : () => {
                    setPeople(people.filter((each) => { return each.id !== person.id; }));
                  }}
                />
              );
            })}
          </Stack>}
      </List>
      <Box sx={{ px: 2 }}>
        {staysHere &&
          <Typography variant="caption" color="textSecondary" component="p" sx={{ mt: 1 }}>
            {i18n.t('federation:composer.staysHere')}
          </Typography>}
      </Box>
    </>
  );

  // Under the words: the choices in one line, which opens Details.
  const summaryLine = choices.summary() +
    (postLocations.locations.length > 0 ?
      ` · ${postLocations.locations.map((location) => { return location.name; }).join(', ')}` :
      '');

  // What is written goes along to the extended composer, and is its draft
  // from then on.
  const expand = () => {
    onClose();
    onExpand(body);
    clearDraft();
  };

  // Hidden rather than disabled while posting: a tooltip on a disabled
  // button is never seen. Its words, Long post, beside the icon on a phone
  // too: the icon alone said nothing of where it led.
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
        // Room to write in, until a photo or a video is the post's: then
        // two lines, so that it sits close under the words.
        minRows={hasPhotos || video ? 2 : 6}
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
            incoming={incoming}
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
            {progressOf(upload)}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {i18n.t('videos:upload.carryOn')}
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
      // It may be closed while a video is sent: it goes on being sent,
      // and the + button says how far it has got.
      onClose={() => {
        if (!isSending) {
          onClose();
        }
      }}
    >
      <Box
        component="form"
        ref={form}
        onSubmit={handleSubmit}
        noValidate
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: onDetails && !phone ? held : undefined,
        }}
      >
        {/* Close, Long post and Post at the top, where a thumb finds
              them above the keyboard; on Details, Back in place of Close. */}
        <Toolbar sx={{ gap: 1, px: 1 }}>
          {onDetails ?
            <IconButton
              edge="start"
              aria-label={i18n.t('composer:details.back')}
              onClick={() => {
                setStep('write');
              }}
            >
              <BackIcon />
            </IconButton> :
            <IconButton
              edge="start"
              aria-label={i18n.t('composer:close')}
              disabled={isSending}
              onClick={() => {
                onClose();
              }}
            >
              <CloseIcon />
            </IconButton>}
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, minWidth: 0 }}>
            {i18n.t(onDetails ? 'composer:details.title' : 'composer:newPost')}
          </Typography>
          {!onDetails && expandButton(true)}
          {postButton(false)}
        </Toolbar>
        <Divider />
        {onDetails &&
          <Box sx={{ flexGrow: 1, overflowY: 'auto', pb: 2 }}>
            {details}
          </Box>}
        {/* Kept while Details is open, hidden, so that the photos being
            sent go on being sent. */}
        <Box
          sx={{
            flexGrow: 1, overflowY: 'auto', p: 2, display: onDetails ? 'none' : 'block',
          }}
        >
          {/* The words have the width on a phone: who is posting is the
              viewer, and their picture beside the box took a fifth of the
              screen (roadmap row 112). */}
          <Stack direction="row" spacing={2}>
            {!phone && <ActorAvatar actor={viewer} />}
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              {content}
            </Box>
          </Stack>
          {preparing}
          {uploadsList}
        </Box>
        {!onDetails &&
          <>
            <Divider />
            {/* At the bottom, above the keyboard and within a thumb's
                reach: who can see it, its language and who may reply in one
                line, which opens Details; then what can be added. */}
            <ListItemButton
              onClick={toDetails}
              disabled={busy}
              aria-label={`${i18n.t('composer:details.open')}: ${summaryLine}`}
              // Its own height, not the column's: a list button grows.
              sx={{
                flexGrow: 0, px: 2, py: 1, gap: 1,
              }}
            >
              <Typography
                variant="body2"
                color="textSecondary"
                noWrap
                sx={{ flexGrow: 1, minWidth: 0 }}
              >
                {summaryLine}
              </Typography>
              <Typography variant="body2" sx={{ flexShrink: 0 }}>
                {i18n.t('composer:details.open')}
              </Typography>
              <ChevronIcon fontSize="small" color="action" />
            </ListItemButton>
            <Stack
              direction="row"
              spacing={0.5}
              sx={{
                alignItems: 'center', px: 1, pb: 1, overflowX: 'auto',
              }}
            >
              {attachButtons}
            </Stack>
          </>}
      </Box>
      {rules.dialog}
      <TagPeoplePicker
        open={isTagging}
        value={people}
        onChange={setPeople}
        onClose={() => { setIsTagging(false); }}
      />
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
};

export default ShortComposer;
