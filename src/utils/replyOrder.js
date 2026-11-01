// The order somebody likes a thread in, kept in their browser: the replies
// made to the post newest first, or oldest. What answers them stays oldest
// first either way, or a conversation would read backwards. Read and written
// inside try/catch: where storage is refused, a thread is newest first.

const KEY = 'replies.order';

const NEWEST = 'newest';
const OLDEST = 'oldest';

// With fewer than this, there is nothing to choose between.
const MIN_TO_CHOOSE = 3;

const load = () => {
  try {
    return window.localStorage.getItem(KEY) === OLDEST ? OLDEST : NEWEST;
  } catch (e) {
    return NEWEST;
  }
};

const save = (order) => {
  try {
    window.localStorage.setItem(KEY, order);
  } catch (e) {
    // Remembered until the page is left.
  }
};

// The thread as nest makes it, oldest first, in the order chosen.
const arrange = (nodes, order) => {
  return order === OLDEST ? nodes : [...nodes].reverse();
};

export default {
  NEWEST,
  OLDEST,
  MIN_TO_CHOOSE,
  arrange,
  load,
  save,
};
