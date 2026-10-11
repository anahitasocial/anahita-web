import { useEffect, useRef, useState } from 'react';

import api from '../../../api/linkPreviews';
import linkPreviews from '../../../utils/linkPreviews';

// How long the writer has to stop typing before the link is looked up.
const PAUSE = 500;

// The card for the first link in a note being written.
//
// Looked up once the writer pauses, and once for each link: one that had
// nothing to show, or whose card was taken off, is not asked for again
// while it is still the first link. Nothing is said when there is no card,
// whether the page has nothing to show or the installation makes none.
//
// Answers with the card (or null), the link it is for as it was typed, and
// `remove` and `reset`.
const useLinkPreview = (text, enabled = true) => {
  const [preview, setPreview] = useState(null);
  const [url, setURL] = useState('');
  // Links already settled: no card to be had, or taken off by the writer.
  const settled = useRef(new Set());

  const wanted = enabled ? linkPreviews.urlToPreview(text) : '';

  useEffect(() => {
    if (wanted === url) {
      return undefined;
    }
    // The link changed or went: its card goes at once.
    setPreview(null);
    setURL('');

    if (!wanted || settled.current.has(wanted)) {
      return undefined;
    }

    let current = true;
    const timer = setTimeout(() => {
      api.read(wanted).then((response) => {
        if (!current) {
          return;
        }
        if (response.status === 200 && response.data && response.data.title) {
          setPreview(response.data);
          setURL(wanted);
        } else {
          settled.current.add(wanted);
        }
      }).catch(() => {
        if (current) {
          settled.current.add(wanted);
        }
      });
    }, PAUSE);

    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [wanted]);

  const remove = () => {
    if (url) {
      settled.current.add(url);
    }
    setPreview(null);
    setURL('');
  };

  // After the note is posted: the next one starts with nothing settled.
  const reset = () => {
    settled.current = new Set();
    setPreview(null);
    setURL('');
  };

  return {
    preview,
    url: preview ? url : '',
    remove,
    reset,
  };
};

export default useLinkPreview;
