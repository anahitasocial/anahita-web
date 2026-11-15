// Offering a passkey after signing in (roadmap row 153).
//
// Once, right after somebody signs in on a device that can hold a passkey,
// the app asks "Sign in faster next time?". Whether it is a moment to ask
// is kept in two places in the browser, and nowhere else:
//
// 1. `passkeyOffer.due` in sessionStorage, set when a sign-in finishes
//    (OAuthCallback) and taken away once it has been asked or cannot be:
//    one sign-in, one tab, at most one question. A reload does not ask
//    again.
// 2. `passkeyOffer.skipped.<id>` in localStorage, set by Skip: that person
//    is not asked on this device again. Settings › Security still offers a
//    passkey whenever they like.
//
// Storage may be refused (a private window): then nothing is asked, rather
// than asking on every page.

const DUE = 'passkeyOffer.due';
const SKIPPED = 'passkeyOffer.skipped.';

const storageOf = (which) => {
  try {
    return window[which];
  } catch (e) {
    return null;
  }
};

const read = (which, key) => {
  const storage = storageOf(which);
  try {
    return storage ? storage.getItem(key) : null;
  } catch (e) {
    return null;
  }
};

const write = (which, key, value) => {
  const storage = storageOf(which);
  try {
    if (storage && value === null) {
      storage.removeItem(key);
    } else if (storage) {
      storage.setItem(key, value);
    }
  } catch (e) {
    // Nothing is remembered: nothing is asked.
  }
};

// A sign-in just finished in this tab.
const markDue = () => {
  write('sessionStorage', DUE, '1');
};

const isDue = () => {
  return read('sessionStorage', DUE) === '1';
};

// Asked, or not to be: either way, not again for this sign-in.
const clearDue = () => {
  write('sessionStorage', DUE, null);
};

const skip = (viewerId) => {
  write('localStorage', `${SKIPPED}${viewerId}`, '1');
};

const isSkipped = (viewerId) => {
  return read('localStorage', `${SKIPPED}${viewerId}`) === '1';
};

// What to do now, from what is known so far:
// `wait` while somebody is in onboarding or not yet known, `ask` when every
// condition holds, `never` when one cannot change during this sign-in (the
// device has no authenticator of its own, or they have a passkey already,
// or skipped it here). `undefined` for a thing not yet found out means wait.
const decide = ({
  due,
  viewerId,
  onboarding,
  skipped,
  hasPlatform,
  passkeyCount,
}) => {
  if (!due) {
    return 'never';
  }
  if (!viewerId || onboarding) {
    return 'wait';
  }
  if (skipped || hasPlatform === false || passkeyCount > 0) {
    return 'never';
  }
  if (hasPlatform === undefined || passkeyCount === undefined) {
    return 'wait';
  }
  return 'ask';
};

export default {
  markDue,
  isDue,
  clearDue,
  skip,
  isSkipped,
  decide,
};
