import React, {
  createContext, useContext, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import actions from '../../../../actions';
import api from '../../../../api';
import i18n from '../../../../languages';
import videos from '../../../../utils/videos';
import useVideoUpload from './useVideoUpload';

const Shared = createContext(null);

// The video posted from the + button, kept by the app rather than by the
// composer, so that it goes on being sent from one page to the next: the
// composer is only on the home page and on a profile one may post to, and
// leaving it stopped the upload (roadmap row 112). One at a time, as the
// composer has one.
//
// What it says is said wherever the viewer is: that it is posted, with
// View, or why not; and, on the home page, the post on its way at the head
// of the feed (VideoOnItsWayCard). A video posted is put at the head of an
// open feed it belongs in (reducers/lastPosted.js), as any other post is.
// Leaving the site while it is still being sent is asked about first, by
// the browser.
const SharedVideoUpload = ({ children }) => {
  const upload = useVideoUpload();
  const dispatch = useDispatch();
  const nodeInfo = useSelector((state) => { return state.app.nodeInfo; });
  // On the home page the card at the head of the feed says why it failed;
  // a notice over it would say it twice.
  const onHome = useSelector((state) => {
    return Boolean(state.composeTarget && state.composeTarget.home);
  });

  useEffect(() => {
    if (upload.phase === 'ready') {
      const id = upload.upload && upload.upload.nodeId;
      // With View, to the post, wherever the viewer is.
      dispatch(actions.app.alert.success(i18n.t('videos:upload.ready'), id ? `/videos/${id}/` : ''));
      if (id) {
        api.videos.read(id).then(({ data }) => {
          dispatch({ type: 'VIDEOS_ADD_SUCCESS', node: data });
        }).catch(() => {
          // In the feed when it next asks what is new.
        });
      }
    }
    if (upload.phase === 'failed' && !onHome) {
      dispatch(actions.app.alert.error(i18n.t(`videos:problems.${upload.problem || 'failed'}`, {
        size: videos.megabytes(videos.maxBytes(nodeInfo)),
        minutes: Math.floor(videos.maxSeconds(nodeInfo) / 60),
        animationSize: videos.megabytes(videos.animationMaxBytes(nodeInfo)),
        seconds: videos.animationMaxSeconds(nodeInfo),
      })));
    }
  }, [upload.phase]);

  const isSending = upload.phase === 'uploading';
  useEffect(() => {
    if (!isSending) {
      return undefined;
    }
    const ask = (event) => {
      event.preventDefault();
      // Older browsers ask only when this is set; none shows the words.
      // eslint-disable-next-line no-param-reassign
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', ask);
    return () => {
      window.removeEventListener('beforeunload', ask);
    };
  }, [isSending]);

  return (
    <Shared.Provider value={upload}>
      {children}
    </Shared.Provider>
  );
};

SharedVideoUpload.propTypes = {
  children: PropTypes.node.isRequired,
};

// The app's video upload: what useVideoUpload answers.
export const useSharedVideoUpload = () => {
  return useContext(Shared);
};

export default SharedVideoUpload;
