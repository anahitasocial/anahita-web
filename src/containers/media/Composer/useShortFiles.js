import {
  useEffect, useMemo, useRef, useState,
} from 'react';

import i18n from '../../../languages';
import audioFiles from '../../../utils/audio';
import chosenMedia from '../../../utils/chosenMedia';
import photoPosition from '../../../utils/photoPosition';
import kinds from '../../../utils/postKinds';
import useVoiceRecorder, { canRecord } from './useVoiceRecorder';

// What is put with the short box's first note (useShortComposer): photos,
// and who is in them; or a GIF, a video or a sound, picked, dropped where
// the photos are, or recorded here. One or the other, as in a reply.
//
//   open      whether the composer is open: the microphone is let go when
//             it closes
//   takes     what the profile takes, of note, photo, video and audio
//   nodeInfo  the server's, for what it has on and how large a file may be
//   choices   the post's (usePostChoices), told of every file, to say when
//             one was made with AI
//   upload    the app's (Video/SharedVideoUpload): one file on its way at a
//             time
//   busy      while the post is being sent
const useShortFiles = ({
  open,
  takes,
  nodeInfo,
  choices,
  upload,
  busy,
}) => {
  const [photoItems, setPhotoItems] = useState([]);
  const [isAddingPhotos, setIsAddingPhotos] = useState(false);
  // Photos picked with the photo button, handed to the editor to take.
  const [incoming, setIncoming] = useState(null);
  // Where the first photo with a position was taken, read in this browser
  // as it was picked; offered for suggesting locations near it, and used
  // only if asked. Kept nowhere but here, and gone with the photos.
  const [photoPoint, setPhotoPoint] = useState(null);
  // Who is in the photos, tagged once the post is made (roadmap row 103).
  const [people, setPeople] = useState([]);
  const [isTagging, setIsTagging] = useState(false);
  const [video, setVideo] = useState(null);
  const [videoProblem, setVideoProblem] = useState('');

  const canPhotos = kinds.isOffered(takes, 'photo', nodeInfo);
  const canVideo = kinds.isOffered(takes, 'video', nodeInfo);
  const canAudio = kinds.isOffered(takes, 'audio', nodeInfo);
  const hasPhotos = photoItems.length > 0;
  // The file picked is a sound rather than a video.
  const isSound = audioFiles.isAudioType(video);
  // A video on its way, being sent or prepared, which the app sends: one
  // at a time, so the Video button is off until it is posted.
  const videoBusy = upload.phase === 'uploading' || upload.phase === 'processing';
  // What is said while one is on its way: a sound's words for a sound.
  const onItsWay = i18n.t(upload.kind === 'audio' ? 'composer:audioOnItsWay' : 'composer:videoOnItsWay');

  // Why a GIF, a video or a sound chosen cannot be posted, in words, or ''.
  const checkFile = (chosen) => {
    return chosenMedia.problemOf(chosen, nodeInfo, canAudio);
  };

  // A video picked with its own button, or picked or dropped where the
  // photos are. Not while another is on its way.
  const takeVideo = (chosen) => {
    if (videoBusy) {
      setVideoProblem(onItsWay);
      return;
    }
    const problem = checkFile(chosen);
    if (problem) {
      setVideoProblem(problem);
      return;
    }
    setVideoProblem('');
    setVideo(chosen);
    choices.noticeFiles([chosen]);
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
    if (!open) {
      recorder.cancel();
    }
  }, [open]);

  // To listen to the sound before it is posted, from the file itself.
  const listenTo = useMemo(() => {
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
  const hadPhotos = useRef(false);
  useEffect(() => {
    if (photoItems.length > 0) {
      hadPhotos.current = true;
    } else if (hadPhotos.current) {
      hadPhotos.current = false;
      setIsAddingPhotos(false);
    }
  }, [photoItems.length]);

  // What may be added now. Hidden while posting rather than disabled: a
  // tooltip on a disabled button is never seen. None while a sound is
  // being recorded.
  const recording = recorder.phase === 'recording' || recorder.phase === 'asking';
  const filesOff = busy || videoBusy || hasPhotos || Boolean(video) || recording;
  const offers = {
    photos: canPhotos && !busy && !video && !hasPhotos && !recording,
    video: canVideo && !filesOff,
    audio: canAudio && !filesOff,
    record: canAudio && audioFiles.recordingOn(nodeInfo) && canRecord() && !filesOff,
  };

  return {
    canPhotos,
    canVideo,
    canAudio,
    photoItems,
    setPhotoItems,
    hasPhotos,
    isAddingPhotos,
    incoming,
    photoPoint,
    people,
    setPeople,
    isTagging,
    setIsTagging,
    video,
    isSound,
    listenTo,
    videoProblem,
    videoBusy,
    onItsWay,
    recorder,
    offers,
    checkFile,
    takeVideo,
    // Photo opens the system's picker at once, and what is picked shows
    // straight away, being sent.
    addPhotos: (files) => {
      setIsAddingPhotos(true);
      setIncoming({ files });
    },
    takeIncoming: () => {
      setIncoming(null);
    },
    // Photos picked in the editor: whether one was made with AI, and where
    // the first with a position was taken.
    photosPicked: (files) => {
      choices.noticeFiles(files);
      if (!photoPoint) {
        photoPosition.read(files).then((point) => {
          if (point) {
            setPhotoPoint(point);
          }
        });
      }
    },
    removeVideo: () => {
      setVideo(null);
    },
    // All of it let go, once the post is made.
    clear: () => {
      setPhotoItems([]);
      setPeople([]);
      setPhotoPoint(null);
      setIsAddingPhotos(false);
      setIncoming(null);
      setVideo(null);
      setVideoProblem('');
    },
  };
};

export default useShortFiles;
