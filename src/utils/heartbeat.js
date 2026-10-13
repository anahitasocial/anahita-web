// Asking again, now and then, whether there is anything new: for a list
// that is open on somebody's screen while things are added to it.
//
// It asks soon at first and then less and less often, and after asking a
// few times in a row and finding nothing, it stops: a page left open
// overnight does not ask all night. Finding something begins it again
// from the start, and so does the reader coming back to the page.
//
// `beat` does the asking and answers with a promise of whether anything
// new was found. Nothing is asked while the page is not being looked at.

// How long is waited before each asking, in milliseconds. When the last
// of them finds nothing, there is no next one.
const WAITS = [15000, 30000, 60000, 120000, 240000];

const createHeartbeat = ({
  beat,
  waits = WAITS,
  isHidden = () => { return typeof document !== 'undefined' && document.hidden; },
}) => {
  let step = 0;
  let timer = null;
  let running = false;
  let asking = false;
  // Told apart from the one before it, so that an answer that comes back
  // after it was stopped or begun again changes nothing.
  let round = 0;

  const clear = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  let ask;

  const wait = () => {
    clear();
    if (!running || step >= waits.length) {
      running = false;
      return;
    }
    timer = setTimeout(ask, waits[step]);
  };

  ask = () => {
    timer = null;
    if (!running) {
      return;
    }
    // Not looked at: nothing is asked, and it is not held against the
    // count of times nothing was found. Coming back begins it again.
    if (isHidden()) {
      running = false;
      return;
    }

    const mine = round;
    asking = true;
    Promise.resolve()
      .then(beat)
      .catch(() => { return false; })
      .then((found) => {
        asking = false;
        if (mine !== round) {
          return;
        }
        step = found ? 0 : step + 1;
        wait();
      });
  };

  // Begins, or begins again from the start.
  const start = () => {
    round += 1;
    step = 0;
    running = true;
    wait();
  };

  const stop = () => {
    round += 1;
    running = false;
    clear();
  };

  // The reader came back to the page: asked at once, unless an answer is
  // on its way, and then from the start.
  const wake = () => {
    if (asking) {
      return;
    }
    round += 1;
    step = 0;
    running = true;
    clear();
    ask();
  };

  return {
    start,
    stop,
    wake,
    isRunning: () => { return running; },
  };
};

export default {
  WAITS,
  createHeartbeat,
};
