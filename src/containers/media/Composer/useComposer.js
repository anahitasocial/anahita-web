import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useMediaQuery from '@mui/material/useMediaQuery';

import actions from '../../../actions';
import useRulesFirst from '../../rules/useRulesFirst';
import useKeyboardRoom from './useKeyboardRoom';
import useOnFediverse, { useOnBluesky } from './useOnFediverse';
import usePostChoices from './usePostChoices';
import usePostLocations from './usePostLocations';

// What the short box (useShortComposer) and the extended composer
// (useLongComposer) have alike: who is writing and where, the post's
// choices and locations, the rules agreed to first, where the post will
// go, and how they say how it went.
//
//   actor        the profile it is posted on
//   open         whether the composer is open
//   withBluesky  whether to ask if the viewer is on Bluesky: only the short
//                box says what Bluesky will show of a post
//
// The locations offered are read again each time it opens: the other
// composer may have changed them (usePostLocations).
const useComposer = ({ actor, open, withBluesky = false }) => {
  const dispatch = useDispatch();
  const viewer = useSelector((state) => { return state.session.viewer; });
  const nodeInfo = useSelector((state) => { return state.app.nodeInfo; });
  const mobile = useMediaQuery((theme) => { return theme.breakpoints.down('sm'); });

  // Above the keyboard on a mobile, however much it leaves.
  const room = useKeyboardRoom(mobile && open);
  const choices = usePostChoices(actor, viewer);
  const postLocations = usePostLocations(actor.id);
  // Posting on a group or an event whose rules changed since the writer
  // agreed: agreed to again first (roadmap row 102, part 5c).
  const rules = useRulesFirst(actor, 'post');

  // A post open to everybody on the writer's own profile goes to their
  // followers on other servers, with its locations; said before posting
  // when it will not. And to Bluesky, where the writer has connected their
  // account there. Without a viewer, Bluesky is not asked.
  const onFediverse = useOnFediverse(viewer);
  const onBluesky = useOnBluesky(withBluesky ? viewer : null);
  const own = actor.id === viewer.id;
  const isPublic = choices.access === 'public';

  useEffect(() => {
    if (open) {
      postLocations.reload();
    }
  }, [open]);

  return {
    actor,
    dispatch,
    viewer,
    nodeInfo,
    mobile,
    room,
    choices,
    postLocations,
    rules,
    goesOut: onFediverse && own && isPublic,
    staysHere: onFediverse && own && !isPublic,
    goesToBluesky: onBluesky && own && isPublic,
    alertSuccess: (message) => {
      dispatch(actions.app.alert.success(message));
    },
    alertError: (message) => {
      dispatch(actions.app.alert.error(message));
    },
    // The locations, as they are sent with a post to be tied as it is made,
    // so that it goes to other servers with them.
    locationIds: () => {
      return postLocations.locations.length > 0 ? { location_ids: postLocations.ids() } : {};
    },
    // After posting: the choices asked again of the next post, the
    // locations let go.
    posted: () => {
      choices.posted();
      postLocations.clear();
    },
  };
};

export default useComposer;
