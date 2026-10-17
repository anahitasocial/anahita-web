import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';

import useVideoUpload from '../media/Composer/Video/useVideoUpload';
import PersonType from '../../proptypes/Person';
import i18n from '../../languages';
import videos from '../../utils/videos';

// A reply with a GIF or a video, on its way into the thread.
//
// A video is sent to storage in parts and made ready by the worker before
// it is a reply, which takes a while: this says where it has got to, under
// the box it was written in. Once the worker has made the reply, the thread
// is read again, and the reply takes its place there. The page has to stay
// open while it is being sent; once it is being prepared, it can be left,
// and the reply is made all the same.
const VideoReplyOnTheWay = ({
  viewer,
  parent,
  body = '',
  language = '',
  file,
  onReady,
  onGone,
}) => {
  const upload = useVideoUpload();
  const nodeInfo = useSelector((state) => { return state.app.nodeInfo; });
  const started = useRef(false);

  useEffect(() => {
    // Once, however often it is drawn.
    if (started.current) {
      return;
    }
    started.current = true;
    upload.start(viewer, { parentId: parent.id, content: body, language }, file);
  }, []);

  useEffect(() => {
    if (upload.phase === 'ready') {
      onReady();
      onGone();
    }
  }, [upload.phase]);

  const limits = {
    size: videos.megabytes(videos.maxBytes(nodeInfo)),
    minutes: Math.floor(videos.maxSeconds(nodeInfo) / 60),
    animationSize: videos.megabytes(videos.animationMaxBytes(nodeInfo)),
    seconds: videos.animationMaxSeconds(nodeInfo),
  };

  return (
    <Box sx={{ px: 2, pb: 2 }} role="status">
      {upload.phase === 'uploading' &&
        <>
          <Typography variant="body2">
            {i18n.t('videos:upload.uploading', { percent: upload.percent })}
          </Typography>
          <LinearProgress variant="determinate" value={upload.percent} sx={{ mt: 1 }} />
          <Typography variant="caption" color="textSecondary" component="p" sx={{ mt: 1 }}>
            {i18n.t('videos:upload.keepOpen')}
          </Typography>
        </>}
      {upload.phase === 'processing' &&
        <>
          <Typography variant="body2">
            {i18n.t('replies:attachments.preparing')}
          </Typography>
          <LinearProgress sx={{ mt: 1 }} />
        </>}
      {upload.phase === 'failed' &&
        <>
          <Typography variant="body2" color="error" role="alert">
            {i18n.t(`videos:problems.${upload.problem || 'failed'}`, limits)}
          </Typography>
          <Button size="small" onClick={onGone} sx={{ ml: -1 }}>
            {i18n.t('videos:upload.dismiss')}
          </Button>
        </>}
    </Box>
  );
};

VideoReplyOnTheWay.propTypes = {
  viewer: PersonType.isRequired,
  // What it answers.
  parent: PropTypes.shape({
    id: PropTypes.number.isRequired,
  }).isRequired,
  body: PropTypes.string,
  language: PropTypes.string,
  file: PropTypes.object.isRequired,
  // When the reply has been made: read the thread again.
  onReady: PropTypes.func.isRequired,
  // When there is nothing more to say: made, or failed and dismissed.
  onGone: PropTypes.func.isRequired,
};

export default VideoReplyOnTheWay;
