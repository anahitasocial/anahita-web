import { useEffect, useRef, useState } from 'react';

import api from '../../../../api/videos';
import videos from '../../../../utils/videos';

// How many parts are on their way at once, how many addresses are asked
// for at a time, and how often a part is tried.
const AT_ONCE = 3;
const ADDRESSES = 6;
const TRIES = 4;
// How often an upload being prepared is asked after.
const ASK_EVERY = 4000;

// Why the server refused, as a key of videos:problems.
const refusalOf = (error) => {
  const response = error && error.response;
  if (!response) {
    return 'network';
  }
  const code = response.data && response.data.error;

  if (response.status === 413 || code === 'too_large') {
    return 'tooLarge';
  }
  if (response.status === 415 || code === 'not_a_video') {
    return 'notAVideo';
  }
  if (response.status === 429) {
    return 'tooMany';
  }
  // A reply to a thread the viewer may not answer.
  if (response.status === 403 && !code) {
    return 'closed';
  }
  if (code === 'uploads_off') {
    return 'off';
  }
  return 'failed';
};

// Why preparing it failed, as the server says, as a key of videos:problems.
const failureOf = (upload) => {
  return {
    not_a_video: 'notAVideo',
    too_long: 'tooLong',
    too_large: 'tooLarge',
    still: 'still',
    closed: 'closed',
    encoding: 'encoding',
  }[upload && upload.error] || 'failed';
};

const wait = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

// Sends one video: begins the upload, sends the file to storage in parts,
// a few at a time and each tried again when it fails, then hands it over
// and asks after it until it is a post or has failed.
//
// Answers with where it has got to: `phase` ('idle', 'uploading',
// 'processing', 'ready' or 'failed'), `percent` while uploading, the
// `upload` as the server last described it, and `problem`, a key of
// videos:problems, when it failed.
const useVideoUpload = () => {
  const [state, setState] = useState({
    phase: 'idle',
    percent: 0,
    upload: null,
    problem: '',
  });
  const controller = useRef(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      // The page is left: what is on its way stops. A video already handed
      // over goes on being prepared, and is found again in the list.
      alive.current = false;
      if (controller.current) {
        controller.current.abort();
      }
    };
  }, []);

  const set = (changes) => {
    if (alive.current) {
      setState((current) => {
        return { ...current, ...changes };
      });
    }
  };

  const follow = async (upload) => {
    let current = upload;
    while (alive.current && videos.isInHand(current)) {
      // eslint-disable-next-line no-await-in-loop
      await wait(ASK_EVERY);
      if (!alive.current) {
        return;
      }
      try {
        // eslint-disable-next-line no-await-in-loop
        current = (await api.read(current.id)).data;
      } catch (e) {
        // Asked again in a moment.
      }
    }
    if (current.status === 'ready') {
      set({ phase: 'ready', upload: current });
    } else {
      set({ phase: 'failed', upload: current, problem: failureOf(current) });
    }
  };

  const sendParts = async (upload, file, signal) => {
    const parts = videos.partsOf(file.size, upload.partSize);
    const arrived = {};
    const report = () => {
      const sent = Object.values(arrived).reduce((sum, bytes) => {
        return sum + bytes;
      }, 0);
      set({ percent: videos.percent(sent, file.size) });
    };

    const sendOne = async (part, url) => {
      for (let attempt = 1; ; attempt += 1) {
        try {
          // eslint-disable-next-line no-await-in-loop
          await api.sendPart(url, file.slice(part.start, part.end), {
            signal,
            onProgress: (bytes) => {
              arrived[part.number] = bytes;
              report();
            },
          });
          arrived[part.number] = part.end - part.start;
          report();
          return;
        } catch (error) {
          arrived[part.number] = 0;
          if (signal.aborted || attempt >= TRIES) {
            throw error;
          }
          // eslint-disable-next-line no-await-in-loop
          await wait(1000 * attempt);
        }
      }
    };

    // Addresses are asked for a few at a time, as they are needed: one
    // signed long before it is used may have run out.
    for (let from = 0; from < parts.length; from += ADDRESSES) {
      const group = parts.slice(from, from + ADDRESSES);
      // eslint-disable-next-line no-await-in-loop
      const answered = (await api.parts(upload, group.map((part) => {
        return part.number;
      }))).data.data;
      const urls = {};
      answered.forEach((entry) => {
        urls[entry.number] = entry.url;
      });

      for (let at = 0; at < group.length; at += AT_ONCE) {
        // eslint-disable-next-line no-await-in-loop
        await Promise.all(group.slice(at, at + AT_ONCE).map((part) => {
          return sendOne(part, urls[part.number]);
        }));
      }
    }
  };

  const start = async (owner, post, file) => {
    controller.current = new AbortController();
    const { signal } = controller.current;
    set({
      phase: 'uploading',
      percent: 0,
      upload: null,
      problem: '',
    });

    let upload = null;
    try {
      upload = (await api.start(owner, post, file)).data;
      set({ upload });
      await sendParts(upload, file, signal);
      upload = (await api.complete(upload)).data;
    } catch (error) {
      if (signal.aborted) {
        return false;
      }
      // What was begun is given up, so that it does not sit unfinished.
      if (upload) {
        api.cancel(upload).catch(() => {});
      }
      set({ phase: 'failed', problem: refusalOf(error) });
      return false;
    }

    set({ phase: 'processing', percent: 100, upload });
    follow(upload);
    return true;
  };

  // Gives up what is being sent or prepared.
  const cancel = () => {
    if (controller.current) {
      controller.current.abort();
    }
    if (state.upload && videos.isInHand(state.upload)) {
      api.cancel(state.upload).catch(() => {});
    }
    set({
      phase: 'idle',
      percent: 0,
      upload: null,
      problem: '',
    });
  };

  const reset = () => {
    set({
      phase: 'idle',
      percent: 0,
      upload: null,
      problem: '',
    });
  };

  return {
    ...state,
    start,
    cancel,
    reset,
  };
};

export { failureOf };

export default useVideoUpload;
