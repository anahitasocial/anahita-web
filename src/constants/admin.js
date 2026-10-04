import async from './async';

const admin = async('admin');

export default {
  COUNTS: admin('counts'),
  // How often the counts on the Administration menu entry are read again
  // while the app is open. They are also read when the window regains
  // focus, and after an administrator acts on something.
  COUNTS_REFRESH_MS: 5 * 60 * 1000,
};
