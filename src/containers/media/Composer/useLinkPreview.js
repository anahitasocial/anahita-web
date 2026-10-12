import { useEffect, useRef, useState } from 'react';

import api from '../../../api/linkPreviews';
import linkPreviews from '../../../utils/linkPreviews';

// How long the writer has to stop typing before the link is looked up.
const PAUSE = 500;

// The card for the first link in a note being written.
//
// Looked up once the writer pauses, or at once for a link that was pasted,
// and once for each link: one that had
// nothing to show, or whose card was taken off, is not asked for again
// while it is still the first link. Nothing is said when there is no card,
// whether the page has nothing to show or the installation makes none.
//
// `known`, for a note being edited, is the card it already has and the
// link that card is for: shown as it is, and not asked for again, since a
// card is as the page was when the note was written.
//
// Answers with the card (or null), the link it is for as it was typed,
// whether the writer took the card for the present link off, and `remove`,
// `reset` and `onPaste`.
const useLinkPreview = (text, enabled = true, known = null) => {
  const [preview, setPreview] = useState(null);
  const [url, setURL] = useState('');
  // Links already settled: no card to be had, or taken off by the writer.
  const settled = useRef(new Set());
  // Links whose card the writer took off.
  const removed = useRef(new Set());
  // Set by a paste: the next link is looked up without the wait.
  const pasted = useRef(false);

  const wanted = enabled ? linkPreviews.urlToPreview(text) : '';

  useEffect(() => {
    if (wanted === url) {
      return undefined;
    }
    // The link changed or went: its card goes at once.
    setPreview(null);
    setURL('');

    const wait = pasted.current ? 0 : PAUSE;
    pasted.current = false;

    if (!wanted || settled.current.has(wanted)) {
      return undefined;
    }
    if (known && known.url === wanted && known.preview) {
      setPreview(known.preview);
      setURL(wanted);
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
    }, wait);

    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [wanted, known && known.url]);

  const remove = () => {
    if (url) {
      settled.current.add(url);
      removed.current.add(url);
    }
    setPreview(null);
    setURL('');
  };

  // After the note is posted: the next one starts with nothing settled.
  const reset = () => {
    settled.current = new Set();
    removed.current = new Set();
    setPreview(null);
    setURL('');
  };

  // A link put in by pasting is whole at once: nothing more is coming, so
  // there is nothing to wait for.
  const onPaste = () => {
    pasted.current = true;
  };

  return {
    preview,
    url: preview ? url : '',
    isRemoved: Boolean(wanted) && removed.current.has(wanted),
    remove,
    reset,
    onPaste,
  };
};

export default useLinkPreview;
