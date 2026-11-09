import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import BackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import ExpandIcon from '@mui/icons-material/OpenInFull';
import VideoIcon from '@mui/icons-material/VideocamOutlined';
import AudioIcon from '@mui/icons-material/HeadphonesOutlined';
import TagPeopleIcon from '@mui/icons-material/PersonAddOutlined';
import Chip from '@mui/material/Chip';

import actions from '../../../actions';
import api from '../../../api';
import ActorAvatar from '../../../components/ActorAvatar';
import DetailRow from '../../../components/DetailRow';
import LinkPreviewCard from '../../../components/LinkPreviewCard';
import PhotoFilesEditor from '../../../components/PhotoFilesEditor';
import AttachButtons from './AttachButtons';
import ThreadParts, {
  NoteHead, SplitWords, ThreadJoin, ThreadLine, WORDS,
} from './ThreadParts';
import useThreadSplit from './useThreadSplit';
import useDraft from './useDraft';
import useLinkPreview from './useLinkPreview';
import useTextareaHashtags from './useHashtagSuggestions';
import HashtagSuggestions from '../../../components/HashtagSuggestions';
import useOnFediverse, { useOnBluesky } from './useOnFediverse';
import { useSharedVideoUpload } from './Video/SharedVideoUpload';
import usePostChoices from './usePostChoices';
import usePostLocations from './usePostLocations';
import useKeyboardRoom from './useKeyboardRoom';
import photoPosition from '../../../utils/photoPosition';

import composer from '../../../utils/composer';
import photoFiles from '../../../utils/photoFiles';
import utils from '../../../utils';
import videos from '../../../utils/videos';
import audioFiles from '../../../utils/audio';
import useVoiceRecorder, { canRecord } from './useVoiceRecorder';
import ActorType from '../../../proptypes/Actor';
import { Medium as MEDIUM } from '../../../constants';
import LIMITS from '../../../constants/limits';
import threadNotes from '../../../utils/threadNotes';
import threadSplit from '../../../utils/threadSplit';
import chosenMedia from '../../../utils/chosenMedia';
import warnings from '../../../utils/warnings';
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
// the middle of the screen on a desktop and filling it on a mobile, where the
// keyboard needs the room; nothing in it changes height as somebody types.
// What is written is kept as a draft until it is posted (useDraft).
//
// Two steps (roadmap row 114), walked through in turn: the post itself, its
// words and its photos, GIF or video, then Next; and every choice that goes
// with it, each a row, who can see it, its language, who may reply, its
// location and who is in it, each with the room it needs, then Post. Laid
// out rather than hidden behind a link, so that they are used (the user,
// 2026-10-28). Back returns to the words with everything kept.
//
// `kinds` is what this profile takes, of note, photo, video and audio. A
// sound is sent as a video is, and made an audio post by the server
// (roadmap row 137). A video or a sound posted from it is the app's to send
// (Video/SharedVideoUpload), and the + button says how far it has got once
// this is closed.
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
  const mobile = useMediaQuery((theme) => { return theme.breakpoints.down('sm'); });

  // Above the keyboard on a mobile, however much it leaves.
  const room = useKeyboardRoom(mobile && isOpen);
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
  const canAudio = kinds.includes('audio') && videos.isOn(nodeInfo) && audioFiles.isOn(nodeInfo);
  // The file picked is a sound rather than a video.
  const isSound = audioFiles.isAudioType(video);
  // What is said while one is on its way: a sound's words for a sound.
  const onItsWay = i18n.t(upload.kind === 'audio' ? 'composer:audioOnItsWay' : 'composer:videoOnItsWay');

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
  // A thread is of notes, each with words, pictures or both, or a GIF, a
  // video or a sound (roadmap row 143).
  const canThread = canWords;
  const threadParts = canThread ? moreParts.filter(threadNotes.hasSomething) : [];
  const photosReady = hasPhotos && photoFiles.canSubmit(photoItems);
  // A video on its way, being sent or prepared, which the app sends: one
  // at a time, so the Video button is off until it is posted.
  const videoBusy = upload.phase === 'uploading' || upload.phase === 'processing';
  // A thread with a file in a note after the first, which the app sends too.
  const threadHasVideo = threadParts.some(threadNotes.hasVideo);
  const busy = isSending;
  const hasSomething = composer.canPost({
    text,
    takesNotes: canWords,
    photosReady,
    hasVideo: Boolean(video),
  });
  // Any note longer than a note may be (roadmap row 144): split, shortened,
  // or made an article before it can go on.
  const tooLong = threadSplit.lengthOf(text) > LIMITS.POST_MAX ||
    threadParts.some((note) => { return threadSplit.lengthOf(note.words) > LIMITS.POST_MAX; });
  // Held back too while a note's pictures are still being sent.
  const isHeldBack = (hasPhotos && !photosReady) || busy || tooLong ||
    threadParts.some((note) => { return !threadNotes.isReady(note); }) ||
    (threadHasVideo && videoBusy);

  const linkPreview = useLinkPreview(body, canWords && !hasPhotos && !video);
  // Hashtags in use offered as one is typed (roadmap row 78).
  const hashtags = useTextareaHashtags({ value: body, onChange: setBody, mobile });

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
  const cutForBluesky = goesToBluesky && threadSplit.lengthOf(body) > LIMITS.BLUESKY_POST_MAX;
  // Where a note of a thread ends, where the post goes (roadmap row 126),
  // the count against it, and long words split into a thread.
  const noteLimit = threadSplit.limitFor({ goesToBluesky, goesToFediverse: goesOut });
  const split = useThreadSplit({
    body, setBody, moreParts, setMoreParts, limit: noteLimit, canThread,
  });
  const morePictures = photoItems.length > LIMITS.PICTURES_SHOWN_MAX && (
    (goesOut && goesToBluesky && 'federation:composer.morePictures') ||
    (goesOut && 'federation:composer.morePicturesMastodon') ||
    (goesToBluesky && 'federation:composer.morePicturesBluesky'));

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

  // Posted, with View, to the post wherever the feed is scrolled.
  const posted = (made = null) => {
    dispatch(actions.app.alert.success(
      i18n.t('prompts:posted.success'),
      made && made.id ? utils.node.getURL(made) : '',
    ));
    reset();
  };

  // Posting on a group or an event whose rules changed since the writer
  // agreed: agreed to again first (roadmap row 102, part 5c).
  const rules = useRulesFirst(actor, 'post');

  // Once a photo post is made, alone or as a thread's first note: whoever
  // is in its photos tagged, and who could not be, or is asked first, said
  // so instead of "Posted".
  const taggedAfter = (made, tagged) => {
    if (tagged.length === 0 || !made || !made.id) {
      posted(made);
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
  };

  const handleSubmit = (event) => {
    if (event) {
      event.preventDefault();
    }
    // On the words, Next: on to the choices.
    if (!onDetails) {
      // eslint-disable-next-line no-use-before-define
      if (canGoOn) {
        toDetails();
      }
      return;
    }
    if (!hasSomething || isHeldBack) {
      return;
    }
    rules.run(() => {
      // eslint-disable-next-line no-use-before-define
      sendPost();
    });
  };

  // A thread whose notes have a GIF, a video or a sound (roadmap row 143),
  // cut where its files are (threadNotes.cut). Every file is sent by the
  // app, one after another; what was made is said as any video post is.
  const sendThreadWithFiles = () => {
    const { language } = choices.request();
    const notes = [{
      words: text,
      photos: photosReady ? photoItems : [],
      video,
      linkPreviewUrl: !photosReady && !video ? linkPreview.url : '',
    }, ...threadParts];
    const { before, segments } = threadNotes.cut(notes);
    // Each file's post: its note's words, the thread's warning, and the
    // notes after it up to the next file.
    const fileStep = (segment) => {
      return {
        title: '',
        content: segment.note.words.trim(),
        language,
        ...warnings.toRequest(choices.warning),
        threadAfter: segment.after.map((note) => { return threadNotes.toPart(note, language); }),
      };
    };
    // The files after the first, each a reply by the writer on their own
    // profile, after the one before.
    const more = segments.slice(1).map((segment) => {
      return { owner: viewer, post: fileStep(segment), file: segment.note.video };
    });
    const [first] = segments;

    // The first note has the file: it is the post, with all a post takes.
    if (before.length === 0) {
      upload.start(actor, {
        ...choices.request(),
        ...fileStep(first),
        allowDownload: choices.allowDownload,
      }, first.note.video, more);
      reset();
      return;
    }

    // Otherwise the notes before it, as a thread, and the file answers the
    // last of them.
    const post = {
      ...shared(),
      ...(photosReady ? { allow_download: choices.allowDownload } : {}),
    };
    delete post.content;
    const parts = before.map((note) => { return threadNotes.toPart(note, language); });
    setIsSending(true);
    api.replies.addThread(actor, post, parts).then((result) => {
      const made = result.data.parts;
      dispatch({ type: 'NOTES_ADD_SUCCESS', node: made[0] });
      upload.start(viewer, {
        ...fileStep(first),
        parentId: made[made.length - 1].id,
      }, first.note.video, more);
      reset();
    }).catch(() => {
      alertError(i18n.t('prompts:posted.error'));
    }).finally(() => {
      setIsSending(false);
    });
  };

  const sendPost = () => {
    // A video goes in the background, as on other networks: the app sends
    // it, and the composer closes at once, empty, so that nothing of this
    // post is left in it to be taken for part of the next (roadmap row
    // 115). How it is getting on is at the head of the home feed and round
    // the + button; that it is posted, or why not, is said wherever the
    // viewer is.
    // A thread with a file in any note (roadmap row 143): the notes before
    // the first file made now; then each file sent, in turn, with the
    // notes after it, which the server makes once it is ready.
    if ((video && threadParts.length > 0) || threadHasVideo) {
      // eslint-disable-next-line no-use-before-define
      sendThreadWithFiles();
      return;
    }

    if (video) {
      upload.start(actor, {
        title: '',
        content: text,
        ...choices.request(),
        allowDownload: choices.allowDownload,
      }, video);
      reset();
      return;
    }

    // A thread: its notes made together, in order, all or none. The first
    // takes what a post takes; the rest are replies to the one before.
    // Each note with pictures is a photo post in it (roadmap row 143): the
    // first with the post's own, uploaded for the profile it is on, and
    // whether they may be downloaded; the rest with theirs, the writer's.
    if (threadParts.length > 0) {
      const { language } = choices.request();
      const post = {
        ...shared(),
        ...(photosReady ? { allow_download: choices.allowDownload } : {}),
      };
      delete post.content;
      const first = {
        content: text,
        language,
        ...(photosReady ? { uploads: photoFiles.toRequest(photoItems) } : {}),
        ...(!photosReady && linkPreview.url ? { linkPreviewUrl: linkPreview.url } : {}),
      };
      const parts = [first, ...threadParts.map((note) => {
        return threadNotes.toPart(note, language);
      })];
      // Whoever is in the first note's photos is tagged once it is made, as
      // on a photo post.
      const tagged = photosReady ? people : [];
      setIsSending(true);
      api.replies.addThread(actor, post, parts).then((result) => {
        const [made] = result.data.parts;
        // Its first note, at the head of the open feed, as any post.
        dispatch({ type: 'NOTES_ADD_SUCCESS', node: made });
        return taggedAfter(made, tagged);
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
    const tagged = kind === 'photo' ? people : [];
    dispatch(actions[namespace].add(post, actor)).then((made) => {
      return taggedAfter(made, tagged);
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
    if (videoBusy) {
      setVideoProblem(onItsWay);
      return;
    }
    const problem = chosenMedia.problemOf(chosen, nodeInfo, canAudio);
    if (problem) {
      setVideoProblem(problem);
      return;
    }
    setVideoProblem('');
    setVideo(chosen);
    setIsAddingPhotos(false);
    // A video posted earlier that is done, or failed, is let go.
    if (upload.phase === 'ready' || upload.phase === 'failed') {
      upload.reset();
    }
  };

  // A sound recorded here (useVoiceRecorder), taken as one chosen is; at
  // most as long as an audio post may be.
  const recorder = useVoiceRecorder({
    maxSeconds: audioFiles.maxSeconds(nodeInfo),
    onRecorded: takeVideo,
  });
  // The microphone let go when the composer closes, nothing kept.
  useEffect(() => {
    if (!isOpen) {
      recorder.cancel();
    }
  }, [isOpen]);
  // To listen to the sound before it is posted, from the file itself.
  const listenTo = React.useMemo(() => {
    return isSound ? URL.createObjectURL(video) : '';
  }, [video, isSound]);
  useEffect(() => {
    return () => {
      if (listenTo) {
        URL.revokeObjectURL(listenTo);
      }
    };
  }, [listenTo]);

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

  const placeholder = isPerson(actor) && actor.id !== viewer.id ?
    i18n.t('notes:composer.bodyPlaceholderPerson', { name: actor.name }) :
    i18n.t('notes:composer.bodyPlaceholder');

  // Photos, or a GIF or a video: one or the other, as in a reply. Photo
  // opens the system's picker at once, and what is picked shows straight
  // away, being sent. Hidden while posting rather than disabled: a tooltip
  // on a disabled button is never seen.
  const recording = recorder.phase === 'recording' || recorder.phase === 'asking';
  const offers = {
    photos: canPhotos && !busy && !video && !hasPhotos && !recording,
    video: canVideo && !busy && !videoBusy && !hasPhotos && !video && !recording,
    audio: canAudio && !busy && !videoBusy && !hasPhotos && !video && !recording,
    record: canAudio && audioFiles.recordingOn(nodeInfo) && canRecord() &&
      !busy && !videoBusy && !hasPhotos && !video && !recording,
  };
  const attachButtons = (
    <AttachButtons
      mobile
      photos={offers.photos}
      video={offers.video}
      audio={offers.audio}
      record={offers.record}
      onPhotos={(files) => {
        setIsAddingPhotos(true);
        setIncoming({ files });
      }}
      onVideo={takeVideo}
      onRecord={recorder.start}
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

  // On to the choices once there is something to post, photos still being
  // sent included: Post waits for them, on the next step.
  const canGoOn = (hasSomething || hasPhotos) && !isSending && !tooLong;

  // What is written goes along to the extended composer, and is its draft
  // from then on.
  const expand = () => {
    onClose();
    onExpand(body);
    clearDraft();
  };

  // Hidden rather than disabled while posting: a tooltip on a disabled
  // button is never seen. Its words, Long post, beside the icon on a mobile
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

  const nextButton = (
    <Button
      type="submit"
      variant="contained"
      color="primary"
      disabled={!canGoOn}
      sx={{ minWidth: 88 }}
    >
      {i18n.t('composer:next')}
    </Button>
  );

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

  // Who writes it, above each note: the viewer, wherever it is posted.
  const writerName = utils.node.getActorName(viewer);

  // The notes after the first: beside the writer's small picture on a
  // desktop, joined by one line to theirs on the first, as Threads writes a
  // thread (the user, 2026-11-08); on a mobile, where the words have the
  // width, a line alone.
  const threadNotesShown = (
    <ThreadParts
      parts={moreParts}
      onChange={setMoreParts}
      canAdd={(Boolean(text) || photosReady || Boolean(video)) &&
        !moreParts.some((note) => { return !threadNotes.hasSomething(note); })}
      max={LIMITS.THREAD_PARTS_MAX}
      disabled={busy}
      direction={choices.direction}
      goesToBluesky={goesToBluesky}
      limit={noteLimit}
      writer={mobile ? null : viewer}
      uploader={viewer}
      writerName={writerName}
      photosMax={canPhotos ? photoFiles.maxFiles(nodeInfo) : 0}
      // A GIF, a video or a sound in a note, while none is on its way: the
      // app sends one thread's files at a time.
      videoOffers={{ video: canVideo && !videoBusy, audio: canAudio && !videoBusy }}
      checkVideo={(chosen) => { return chosenMedia.problemOf(chosen, nodeInfo, canAudio); }}
    />
  );

  // A recording's length as a clock shows it: 0:42, 12:05.
  const clock = (seconds) => {
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  };

  // What is written and what goes with it, the same in place and full
  // screen.
  const content = (
    <>
      <NoteHead name={writerName} number={1} count={canThread ? moreParts.length + 1 : 1} />
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
        // two lines, so that it sits close; one, as each note after it, once
        // a thread has a second note.
        minRows={(moreParts.length > 0 && 1) || (hasPhotos || video ? 2 : 6)}
        fullWidth
        inputRef={hashtags.inputRef}
        slotProps={{
          input: { disableUnderline: true, sx: WORDS },
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
            onIncomingTaken={() => { setIncoming(null); }}
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
          {isSound ?
            <AudioIcon fontSize="small" color="action" /> :
            <VideoIcon fontSize="small" color="action" />}
          <Typography variant="body2" sx={{ flexGrow: 1, overflowWrap: 'anywhere' }}>
            {`${video.name} · ${videos.megabytes(video.size)}`}
          </Typography>
          {!busy &&
            <IconButton
              size="small"
              aria-label={i18n.t(isSound ? 'composer:removeAudio' : 'replies:attachments.removeVideo')}
              onClick={() => {
                setVideo(null);
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>}
        </Stack>}
      {listenTo &&
        <Box
          component="audio"
          src={listenTo}
          controls
          preload="metadata"
          aria-label={i18n.t('composer:listenBack')}
          sx={{ display: 'block', width: '100%', mt: 1 }}
        />}
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
      {/* One line under it, as under each note of a thread (the user,
          2026-11-08, after Threads): what can be added to it, the icons'
          glyphs in line with the words; then, kept so that nothing moves as
          the words grow, what Bluesky shows of them or the thread they can
          be split into, and how many letters they have of what a note holds
          where it goes. */}
      <Box sx={{
        display: 'flex', gap: 1, alignItems: 'center', mt: 1,
      }}
      >
        {(offers.photos || offers.video || offers.audio || offers.record) &&
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', ml: -1, flexShrink: 0 }}>
            {attachButtons}
          </Stack>}
        {/* While a sound is recorded, in place of the icons: a red dot and
            the time, then Cancel and Done. */}
        {recorder.phase === 'recording' &&
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0,
          }}
          >
            <Box
              aria-hidden
              sx={{
                width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main', flexShrink: 0,
              }}
            />
            <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums', mr: 1 }} role="timer">
              {`${i18n.t('composer:recording')} ${clock(recorder.seconds)}`}
            </Typography>
            <Button size="small" onClick={recorder.cancel}>
              {i18n.t('actions:cancel')}
            </Button>
            <Button size="small" onClick={recorder.stop}>
              {i18n.t('composer:recordDone')}
            </Button>
          </Box>}
        {canWords &&
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <ThreadLine
              length={split.length}
              limit={noteLimit}
              warnAt={goesToBluesky ? LIMITS.BLUESKY_POST_MAX : 0}
            >
              <SplitWords
                split={split}
                otherwise={cutForBluesky ?
                  i18n.t('federation:composer.cutForBluesky', { max: LIMITS.BLUESKY_POST_MAX }) :
                  ' '}
              />
            </ThreadLine>
          </Box>}
      </Box>
      {(canVideo || canAudio) && videoBusy && !hasPhotos &&
        <Typography variant="caption" color="textSecondary" component="p" sx={{ mt: 1 }}>
          {onItsWay}
        </Typography>}
      {/* What the browser asks before recording, and what to do when the
          microphone was not allowed. */}
      {(recorder.phase === 'asking' || recorder.phase === 'refused') &&
        <Typography
          variant="caption"
          color={recorder.phase === 'refused' ? 'error' : 'textSecondary'}
          component="p"
          role={recorder.phase === 'refused' ? 'alert' : undefined}
          sx={{ mt: 1 }}
        >
          {i18n.t(recorder.phase === 'refused' ? 'composer:micRefused' : 'composer:micAsking')}
        </Typography>}
      {/* On a mobile, the notes after the first come after all of it. */}
      {canThread && mobile && threadNotesShown}

    </>
  );

  // Open, in a dialog: the whole screen on a mobile, where the keyboard
  // needs the room, and in the middle of it on a desktop. The same in both.
  return (
    <Dialog
      fullScreen={mobile}
      fullWidth
      maxWidth="sm"
      open={isOpen}
      slotProps={{
        container: { sx: room.container },
        paper: { sx: room.paper },
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
          minHeight: onDetails && !mobile ? held : undefined,
        }}
      >
        {/* Close, Long post and Post at the top, where a thumb finds
              them above the keyboard; on Details, Back in place of Close. */}
        {/* What is seen sits 16 px from the edges, as the words below do,
            at every width (the user, 2026-11-08): the X's glyph, inside its
            button's own 8 px, and Next. MUI's Toolbar would pad 24 px and
            stand 64 px tall from 600 px up. */}
        <Toolbar
          variant="dense"
          disableGutters
          sx={{
            gap: 1, pl: 1, pr: 2, py: 1,
          }}
        >
          {onDetails ?
            <IconButton
              aria-label={i18n.t('composer:details.back')}
              onClick={() => {
                setStep('write');
              }}
            >
              <BackIcon />
            </IconButton> :
            <IconButton
              aria-label={i18n.t('composer:close')}
              disabled={isSending}
              onClick={() => {
                onClose();
              }}
            >
              <CloseIcon />
            </IconButton>}
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, minWidth: 0 }}>
            {i18n.t('composer:newPost')}
          </Typography>
          {!onDetails && expandButton(true)}
          {onDetails ? postButton(false) : nextButton}
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
          {/* The words have the width on a mobile: who is posting is the
              viewer, and their picture beside the box took a fifth of the
              screen (roadmap row 112). */}
          <Stack direction="row" spacing={2}>
            {!mobile &&
              <Box sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0,
              }}
              >
                <ActorAvatar actor={viewer} />
                {canThread && <ThreadJoin />}
              </Box>}
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              {content}
            </Box>
          </Stack>
          {canThread && !mobile && threadNotesShown}
        </Box>
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
  // What this profile takes, of `note`, `photo`, `video` and `audio`.
  kinds: PropTypes.arrayOf(PropTypes.string).isRequired,
  // Opens the extended composer, with what was written so far. Not given
  // where the profile takes no articles or topics.
  onExpand: PropTypes.func,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ShortComposer;
