import { useEffect, useRef, useState } from 'react';

import api from '../../../api';
import i18n from '../../../languages';
import {
  typedHashtag, putHashtag, isFull, caretRect,
} from '../../../utils/hashtagTyping';
import { Medium as MEDIUM } from '../../../constants';

// What was offered for what was typed, kept while the page is open: typing
// back and forth asks once.
const offered = new Map();

// The hashtags in use that begin with `prefix`, asked for a moment after
// typing stops. Those offered for what was typed before stay while they
// still fit, so that the list does not flicker.
const useBegun = (prefix) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!prefix) {
      setItems([]);
      return undefined;
    }
    const key = prefix.toLowerCase();
    if (offered.has(key)) {
      setItems(offered.get(key));
      return undefined;
    }
    setItems((before) => {
      return before.filter((item) => { return item.alias.startsWith(key); });
    });
    let current = true;
    const timer = setTimeout(() => {
      api.hashtags.suggest(prefix).then((result) => {
        const found = (result.data && result.data.data) || [];
        offered.set(key, found);
        if (current) {
          setItems(found);
        }
      }).catch(() => {
        if (current) {
          setItems([]);
        }
      });
    }, 150);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [prefix]);

  return items;
};

// What a hashtag being typed is offered, and what the keys do with it, for
// any text: the textarea of the short box and the reply form here
// (useTextareaHashtags), the long editor in its own way. `typed` is what
// follows the # being typed, or null; `full` that the post has as many
// hashtags as count.
const useOffer = ({
  typed,
  full,
  phone,
  onPick,
}) => {
  // Escape puts it away until somebody types on.
  const [dismissed, setDismissed] = useState(null);
  const [active, setActive] = useState(0);
  const items = useBegun(full || typed === dismissed ? '' : typed);

  useEffect(() => {
    setActive(0);
  }, [items]);
  useEffect(() => {
    if (typed === null) {
      setDismissed(null);
    }
  }, [typed]);

  const notice = full && typed !== null && typed !== dismissed ?
    i18n.t('composer:hashtags.full', { count: MEDIUM.MAX_HASHTAGS }) :
    '';
  const isOpen = typed !== null && (items.length > 0 || notice !== '');

  // A key pressed in the text: true when it was the list's.
  const onKey = (event) => {
    if (!isOpen) {
      return false;
    }
    if (event.key === 'Escape') {
      setDismissed(typed);
      return true;
    }
    if (phone || items.length === 0) {
      return false;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActive((active + step + items.length) % items.length);
      return true;
    }
    if (event.key === 'Enter' || event.key === 'Tab') {
      onPick(items[active]);
      return true;
    }
    return false;
  };

  return {
    items: notice ? [] : items,
    notice,
    active,
    isOpen,
    onKey,
  };
};

// The place before when it is where the caret still is, so that nothing is
// drawn again for it.
const samePlace = (was, now) => {
  const same = was && was.top === now.top && was.bottom === now.bottom && was.left === now.left;
  return same ? was : now;
};

// Hashtags offered as one is typed in a textarea (a TextField's): give the
// TextField `inputRef` and the handlers, and draw `overlay`'s props with
// components/HashtagSuggestions.
const useTextareaHashtags = ({ value, onChange, phone }) => {
  const input = useRef(null);
  const [caret, setCaret] = useState(0);
  const [focused, setFocused] = useState(false);
  const [rect, setRect] = useState(null);

  const before = value.slice(0, caret);
  const typed = focused ? typedHashtag(before) : null;
  const full = typed !== null && isFull(value, caret, typed);

  const pick = (item) => {
    const put = putHashtag(value, caret, item.name);
    onChange(put.text);
    setCaret(put.caret);
    window.requestAnimationFrame(() => {
      if (input.current) {
        input.current.focus();
        input.current.setSelectionRange(put.caret, put.caret);
      }
    });
  };

  const offer = useOffer({
    typed, full, phone, onPick: pick,
  });

  // Where the caret is, while there is something to show by it, and again
  // as the page or the text scrolls under it.
  useEffect(() => {
    if (!offer.isOpen || !input.current) {
      setRect(null);
      return undefined;
    }
    // Kept only when it moved: drawing it again, and the text growing to
    // fit, scroll the page, which would measure it again without end.
    const measure = () => {
      if (input.current) {
        setRect((was) => {
          return samePlace(was, caretRect(input.current, caret));
        });
      }
    };
    measure();
    const view = window.visualViewport;
    window.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);
    if (view) {
      view.addEventListener('resize', measure);
      view.addEventListener('scroll', measure);
    }
    return () => {
      window.removeEventListener('scroll', measure, true);
      window.removeEventListener('resize', measure);
      if (view) {
        view.removeEventListener('resize', measure);
        view.removeEventListener('scroll', measure);
      }
    };
  }, [offer.isOpen, caret, value]);

  // Where the caret is, as the text changes and as it is moved by a key or
  // a click. Not on every select event: React sends those for anything
  // that touches the selection, and setting the caret on each made renders
  // follow one another without end while somebody typed fast.
  const track = (event) => {
    setCaret(event.target.selectionStart || 0);
  };

  return {
    inputRef: input,
    handlers: {
      onChange: track,
      onKeyUp: track,
      onClick: track,
      onFocus: (event) => {
        setFocused(true);
        track(event);
      },
      onBlur: () => {
        setFocused(false);
      },
      onKeyDown: (event) => {
        if (offer.onKey(event)) {
          event.preventDefault();
          event.stopPropagation();
        }
      },
    },
    overlay: {
      rect,
      items: offer.items,
      notice: offer.notice,
      active: offer.active,
      phone,
      onPick: pick,
    },
  };
};

export { useOffer, samePlace };
export default useTextareaHashtags;
