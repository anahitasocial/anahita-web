import { useEffect, useRef, useState } from 'react';

// A sound recorded in the page (the user, 2026-11-08): a file field offers
// no microphone on a mobile, only the photo library, the camera and files.
// The browser's own MediaRecorder, with nothing else: what it records is
// handed on as a file, as one chosen would be, and becomes an audio post
// (roadmap row 137) the same way.

// What a browser records in, best first: Safari's M4A; Opus in WebM, as
// Chrome and Firefox record; Opus in Ogg. The services take all three.
const KINDS = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'];

const EXTENSIONS = { 'audio/mp4': 'm4a', 'audio/webm': 'webm', 'audio/ogg': 'ogg' };

// Whether this browser can record at all.
export const canRecord = () => {
  return typeof window !== 'undefined' &&
    typeof window.MediaRecorder !== 'undefined' &&
    Boolean(window.navigator.mediaDevices && window.navigator.mediaDevices.getUserMedia);
};

const kindToRecord = () => {
  const { MediaRecorder } = window;
  if (!MediaRecorder.isTypeSupported) {
    return '';
  }
  return KINDS.find((kind) => { return MediaRecorder.isTypeSupported(kind); }) || '';
};

// The file a recording is: its type without the codec, and a name that
// says when it was made, as a recording app names one.
export const recordingFile = (blob, kind, at = new Date()) => {
  const type = (kind || blob.type || 'audio/webm').split(';')[0].trim();
  const pad = (number) => { return String(number).padStart(2, '0'); };
  const name = `voice-${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}-` +
    `${pad(at.getHours())}${pad(at.getMinutes())}.${EXTENSIONS[type] || 'webm'}`;
  return new File([blob], name, { type });
};

// `phase` is idle, asking (for the microphone), recording, or refused;
// `seconds` how long it has been recording. A recording stops by itself at
// `maxSeconds`. `onRecorded` is given the file once Done is pressed; never
// for one cancelled. The microphone is let go as soon as it stops, and when
// the composer closes.
const useVoiceRecorder = ({ maxSeconds = 3600, onRecorded }) => {
  const [phase, setPhase] = useState('idle');
  const [seconds, setSeconds] = useState(0);
  const recorder = useRef(null);
  const stream = useRef(null);
  const chunks = useRef([]);
  const timer = useRef(null);
  const kept = useRef(true);

  const letGo = () => {
    if (timer.current) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
    if (stream.current) {
      stream.current.getTracks().forEach((track) => { track.stop(); });
      stream.current = null;
    }
  };

  useEffect(() => {
    return () => {
      kept.current = false;
      if (recorder.current && recorder.current.state !== 'inactive') {
        recorder.current.stop();
      }
      letGo();
    };
  }, []);

  const stop = () => {
    if (recorder.current && recorder.current.state !== 'inactive') {
      recorder.current.stop();
    }
  };

  const start = () => {
    if (!canRecord() || phase === 'recording' || phase === 'asking') {
      return;
    }
    setPhase('asking');
    window.navigator.mediaDevices.getUserMedia({ audio: true }).then((microphone) => {
      stream.current = microphone;
      const kind = kindToRecord();
      const made = kind ?
        new window.MediaRecorder(microphone, { mimeType: kind }) :
        new window.MediaRecorder(microphone);
      chunks.current = [];
      kept.current = true;
      made.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.current.push(event.data);
        }
      };
      made.onstop = () => {
        letGo();
        setPhase('idle');
        if (kept.current && chunks.current.length > 0) {
          const recorded = made.mimeType || kind;
          onRecorded(recordingFile(new Blob(chunks.current, { type: recorded }), recorded));
        }
        chunks.current = [];
      };
      recorder.current = made;
      made.start(1000);
      const began = Date.now();
      setSeconds(0);
      setPhase('recording');
      timer.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - began) / 1000);
        setSeconds(elapsed);
        if (elapsed >= maxSeconds) {
          stop();
        }
      }, 250);
    }).catch(() => {
      letGo();
      setPhase('refused');
    });
  };

  // Stopped, and nothing kept.
  const cancel = () => {
    kept.current = false;
    stop();
    setPhase('idle');
  };

  return {
    phase, seconds, start, stop, cancel,
  };
};

export default useVoiceRecorder;
