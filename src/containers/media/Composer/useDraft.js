import { useEffect, useState } from 'react';

// What somebody has written in the composer and not yet posted, kept in this
// browser so that closing the composer by mistake, or reloading the page,
// loses nothing. One draft for each profile it is written on.
//
// The words only: pictures and videos are uploaded as they are added, and
// are not kept. A browser that keeps nothing (a private window, storage
// turned off) simply starts empty each time.
const keyFor = (id) => {
  return `composer-draft:${id}`;
};

const read = (key) => {
  try {
    return window.localStorage.getItem(key) || '';
  } catch (e) {
    return '';
  }
};

const write = (key, value) => {
  try {
    if (value) {
      window.localStorage.setItem(key, value);
    } else {
      window.localStorage.removeItem(key);
    }
  } catch (e) {
    // Nothing kept. The composer works the same.
  }
};

const useDraft = (id) => {
  const key = keyFor(id);
  const [text, setText] = useState(() => {
    return read(key);
  });

  // Another profile's draft when moving from one profile to the next.
  useEffect(() => {
    setText(read(key));
  }, [key]);

  const change = (value) => {
    setText(value);
    write(key, value);
  };

  const clear = () => {
    change('');
  };

  return [text, change, clear];
};

export default useDraft;
