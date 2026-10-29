import { useEffect, useState } from 'react';

// What a full-screen composer on a phone has once the keyboard is up: the
// height of what can be seen, which the keyboard takes from, and where that
// is, as Safari may slide the page up to make room. iOS shrinks only the
// visual viewport, not the page.
//
// Answers the `sx` for the dialog's container and paper: the paper as tall
// as what is left and at its top, so that the words and the rows under them
// are above the keyboard. Centred in the whole screen, as a dialog is, a
// shorter paper put its bottom under the keyboard (the user, 2026-10-28).
const useKeyboardRoom = (active) => {
  const [room, setRoom] = useState(null);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!active || !viewport) {
      setRoom(null);
      return undefined;
    }
    const measure = () => {
      setRoom({
        height: Math.round(viewport.height),
        top: Math.round(viewport.offsetTop),
      });
    };
    measure();
    viewport.addEventListener('resize', measure);
    viewport.addEventListener('scroll', measure);
    return () => {
      viewport.removeEventListener('resize', measure);
      viewport.removeEventListener('scroll', measure);
    };
  }, [active]);

  if (!room) {
    return { container: {}, paper: {} };
  }
  return {
    container: { alignItems: 'flex-start' },
    paper: {
      height: room.height,
      maxHeight: room.height,
      transform: room.top ? `translateY(${room.top}px)` : 'none',
    },
  };
};

export default useKeyboardRoom;
