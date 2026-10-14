// Opening a post by clicking anywhere in its title or text, on a card in a
// list, without losing the ability to select and copy what it says.
//
// A click opens the post unless:
//   - text was being selected: a drag, or a double or triple click, leaves
//     a selection behind, and the click that ends it is not a press;
//   - it was on something that does a thing of its own: a link (a hashtag,
//     a mention, an address in the text), a button, a player;
//   - something before it already took it (defaultPrevented).
// Ctrl-, ⌘- or a middle click opens it in a new tab, as a link would.
//
// The title stays a real link, so that the post is still reached from the
// keyboard and by a screen reader; this only adds the rest of the area for
// a mouse or a finger.

const INTERACTIVE = 'a, button, input, textarea, select, label, video, audio, [role="button"], [role="link"]';

const hasSelection = () => {
  try {
    const selection = window.getSelection();
    return Boolean(selection && selection.toString().trim());
  } catch (e) {
    return false;
  }
};

const shouldOpen = (event) => {
  if (event.defaultPrevented) {
    return false;
  }
  if (event.button !== undefined && event.button > 1) {
    return false;
  }
  const { target } = event;
  if (target && typeof target.closest === 'function' && target.closest(INTERACTIVE)) {
    return false;
  }
  return !hasSelection();
};

const inNewTab = (event) => {
  return Boolean(event.metaKey || event.ctrlKey || event.button === 1);
};

// What to put on the area: handlers that open `url` with `navigate` (the
// router's), or nothing when there is nowhere to go.
const handlersFor = (url, navigate) => {
  if (!url) {
    return {};
  }
  const open = (event) => {
    if (!shouldOpen(event)) {
      return;
    }
    if (inNewTab(event)) {
      window.open(url, '_blank', 'noopener');
      return;
    }
    navigate(url);
  };
  return {
    onClick: open,
    // The middle button gives no click event.
    onAuxClick: (event) => {
      if (event.button === 1) {
        open(event);
      }
    },
    style: { cursor: 'pointer' },
  };
};

export default {
  shouldOpen,
  inNewTab,
  handlersFor,
};
