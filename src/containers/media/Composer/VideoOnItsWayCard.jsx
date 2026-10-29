import React from 'react';
import { useSelector } from 'react-redux';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import VideoIcon from '@mui/icons-material/VideocamOutlined';

import VideoUploads from './VideoUploads';
import { useSharedVideoUpload } from './Video/SharedVideoUpload';
import { progressOf } from './Video/useVideoUpload';
import i18n from '../../../languages';
import videos from '../../../utils/videos';

// The post on its way, at the head of the home feed (roadmap row 115): a
// video is posted in the background, as on other networks, and the
// composer closes as soon as Post is pressed, so that nothing of one post
// is left in the composer to be taken for part of the next (the user,
// 2026-10-28). Its words, so that it is known for which post it is, how
// far it has got and the minutes left, then that it is being prepared;
// Cancel while it is sent; why it failed, with Try again. When it is
// ready it is the post itself, put at the head of the feed, and this goes.
//
// Under it, the videos handed over earlier, from here or another device,
// still being prepared or failed in the last day.
const VideoOnItsWayCard = () => {
  const upload = useSharedVideoUpload();
  const viewer = useSelector((state) => { return state.session.viewer; });
  const nodeInfo = useSelector((state) => { return state.app.nodeInfo; });

  if (!upload || !viewer || !viewer.id) {
    return null;
  }

  const limits = {
    size: videos.megabytes(videos.maxBytes(nodeInfo)),
    minutes: Math.floor(videos.maxSeconds(nodeInfo) / 60),
    animationSize: videos.megabytes(videos.animationMaxBytes(nodeInfo)),
    seconds: videos.animationMaxSeconds(nodeInfo),
  };

  // Tried again only where trying again can help: the connection, or
  // something that went wrong on the way. Not a video too long or too large.
  const canRetry = ['network', 'failed'].includes(upload.problem || 'failed');
  const isSending = upload.phase === 'uploading';
  const isPreparing = upload.phase === 'processing';
  const failed = upload.phase === 'failed';
  const shown = isSending || isPreparing || failed;

  let status = '';
  if (isSending) {
    status = progressOf(upload);
  } else if (isPreparing) {
    status = i18n.t('videos:upload.preparing');
  } else if (failed) {
    status = i18n.t(`videos:problems.${upload.problem || 'failed'}`, limits);
  }

  return (
    <>
      {shown &&
        <Card sx={{ mb: 2 }} role="status">
          <CardContent sx={{ pb: 1 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
              <VideoIcon fontSize="small" color="action" />
              <Typography variant="subtitle1" noWrap sx={{ minWidth: 0 }}>
                {upload.caption || i18n.t('composer:untitledVideo')}
              </Typography>
            </Stack>
            <Typography
              variant="body2"
              color={failed ? 'error' : 'textSecondary'}
              sx={{ mt: 1 }}
            >
              {status}
            </Typography>
            {!failed &&
              <LinearProgress
                variant={isSending ? 'determinate' : 'indeterminate'}
                value={isSending ? upload.percent : undefined}
                sx={{ mt: 1 }}
              />}
          </CardContent>
          {isSending &&
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Button onClick={upload.cancel}>
                {i18n.t('videos:upload.cancel')}
              </Button>
            </CardActions>}
          {failed && canRetry &&
            <CardActions>
              <Button fullWidth onClick={upload.reset}>
                {i18n.t('videos:upload.dismiss')}
              </Button>
              <Button fullWidth variant="contained" onClick={upload.retry}>
                {i18n.t('photos:editor.retry')}
              </Button>
            </CardActions>}
          {failed && !canRetry &&
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Button onClick={upload.reset}>
                {i18n.t('videos:upload.dismiss')}
              </Button>
            </CardActions>}
        </Card>}
      <VideoUploads
        viewerId={viewer.id}
        exceptId={upload.upload ? upload.upload.id : 0}
        limits={limits}
        refreshKey={upload.upload ? upload.upload.id : 0}
      />
    </>
  );
};

export default VideoOnItsWayCard;
