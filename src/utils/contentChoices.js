import { useSyncExternalStore } from 'react';

import api from '../api';

// Each reader's choice of Show, Warn or Hide for each kind of content
// warning (anahita-services row 122, phase 2), read once they are signed
// in and kept for every post drawn after. Every kind starts at Warn, and
// somebody not signed in has Warn and no choice.
//
// Kept in the browser too, so that a page drawn before the server answers
// is drawn as the reader chose, and nothing jumps when it does.

const SHOW = 'show';
const WARN = 'warn';
const HIDE = 'hide';
const CHOICES = [SHOW, WARN, HIDE];

const STORAGE_KEY = 'contentChoices';

const read = () => {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || {};
  } catch (error) {
    return {};
  }
};

let current = read();
const listeners = new Set();

const set = (choices) => {
  current = { ...choices };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (error) {
    // Kept for this showing of the page alone.
  }
  listeners.forEach((listener) => { listener(); });
};

// Somebody signed out, or another signing in: Warn for everything until
// theirs are read.
const clear = () => {
  current = {};
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    // Nothing kept.
  }
  listeners.forEach((listener) => { listener(); });
};

// Reads the viewer's choices from the server.
const load = (personId) => {
  return api.warnings.preferences(personId).then(({ data }) => {
    set((data && data.choices) || {});
  }).catch(() => {
    // Kept as they were: Warn, or what this browser remembers.
  });
};

// Changes one kind's, and keeps what the server answers.
const choose = (personId, kind, choice) => {
  const before = current;
  set({ ...current, [kind]: choice });
  return api.warnings.editPreferences(personId, { [kind]: choice }).then(({ data }) => {
    set((data && data.choices) || {});
  }).catch((error) => {
    set(before);
    throw error;
  });
};

// A reader's choice for a kind.
const of = (choices, kind) => {
  const choice = choices && choices[kind];
  return CHOICES.includes(choice) ? choice : WARN;
};

// What a post with this warning shows a reader with these choices: behind
// its warning (`hidden`), and in a list as one line (`collapsed`), until it
// is opened. A post with no warning, or of a kind they chose to see, as any
// other.
const coverOf = (choices, kind, opened = false) => {
  const choice = of(choices, kind);
  const hidden = Boolean(kind) && choice !== SHOW && !opened;
  return { hidden, collapsed: hidden && choice === HIDE };
};

const subscribe = (listener) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

const snapshot = () => {
  return current;
};

// The viewer's choices, drawn again when they change.
const useContentChoices = () => {
  return useSyncExternalStore(subscribe, snapshot);
};

export default {
  SHOW,
  WARN,
  HIDE,
  CHOICES,
  of,
  coverOf,
  load,
  choose,
  clear,
  useContentChoices,
};
