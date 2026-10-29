import React from 'react';

import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import i18n from '../../../languages';
import { useSharedVideoUpload } from './Video/SharedVideoUpload';
import { progressOf } from './Video/useVideoUpload';

// Where the + button is not, the video posted from it says where it has
// got to, small, where the button would be: being sent, with how far and
// the minutes left, or being prepared (roadmap row 112). Where the button
// is, the ring round it says so.
const VideoOnItsWay = () => {
  const upload = useSharedVideoUpload();
  if (!upload || !['uploading', 'processing'].includes(upload.phase)) {
    return null;
  }
  const isSending = upload.phase === 'uploading';

  return (
    <Paper
      role="status"
      elevation={3}
      sx={{
        position: 'fixed',
        right: { xs: 16, sm: 24 },
        bottom: { xs: 'calc(16px + env(safe-area-inset-bottom))', sm: 24 },
        zIndex: (theme) => { return theme.zIndex.speedDial; },
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 1,
        borderRadius: 3,
        maxWidth: 'calc(100vw - 32px)',
      }}
    >
      <CircularProgress
        size={16}
        variant={isSending ? 'determinate' : 'indeterminate'}
        value={isSending ? upload.percent : undefined}
      />
      <Typography variant="body2" noWrap>
        {isSending ? progressOf(upload) : i18n.t('videos:upload.preparing')}
      </Typography>
    </Paper>
  );
};

export default VideoOnItsWay;
