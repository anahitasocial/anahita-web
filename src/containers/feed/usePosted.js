import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

// A post the viewer has just made, given to `put` when `belongs(post)` says
// it is in this feed (reducers/lastPosted.js): it is at the head of the
// feed at once. Only what is posted while the feed is open; one posted
// before it was opened is in the first page already.
const usePosted = ({ belongs, put }) => {
  const posted = useSelector((state) => { return state.lastPosted; });
  const atOpen = useRef(posted);

  useEffect(() => {
    if (!posted || posted === atOpen.current) {
      return;
    }
    if (belongs(posted)) {
      put([posted]);
    }
  }, [posted]);
};

export default usePosted;
