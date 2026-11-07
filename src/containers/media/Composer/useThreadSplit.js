import { useState } from 'react';

import LIMITS from '../../../constants/limits';
import threadSplit from '../../../utils/threadSplit';

// The count and the split of a thread's first note, for the composer and
// the reply form alike (roadmap row 126). `limit` is where the post goes
// (utils/threadSplit.limitFor). Past it, the words can be split into a
// thread, at most ten notes with the ones already there; one step back puts
// them as they were, while the first note is still as the split left it.
// "Add to thread" is offered once the last note has reached the limit.
const useThreadSplit = ({
  body,
  setBody,
  moreParts,
  setMoreParts,
  limit,
  canThread,
}) => {
  const [before, setBefore] = useState(null);

  const length = threadSplit.lengthOf(body);
  const over = canThread && length > limit;
  const room = LIMITS.THREAD_PARTS_MAX - moreParts.length;
  const notes = over ? threadSplit.split(body, limit, room) : null;
  const last = moreParts.length > 0 ? moreParts[moreParts.length - 1] : body;

  const splitNow = () => {
    setBefore({
      body, moreParts, first: notes[0], count: notes.length,
    });
    setBody(notes[0]);
    setMoreParts([...notes.slice(1), ...moreParts]);
  };

  const undo = () => {
    setBody(before.body);
    setMoreParts(before.moreParts);
    setBefore(null);
  };

  return {
    length,
    limit,
    canSplit: Boolean(notes && notes.length > 1),
    tooLong: over && !notes,
    isFull: threadSplit.lengthOf(last.trim()) >= limit,
    // What the last split made, while it can still be taken back.
    undoable: before && before.first === body ? before : null,
    splitNow,
    undo,
  };
};

export default useThreadSplit;
