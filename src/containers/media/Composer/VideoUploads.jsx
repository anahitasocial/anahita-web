import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import api from '../../../api/videos';
import { failureOf } from './Video/useVideoUpload';
import i18n from '../../../languages';

// The videos somebody handed over that are still being prepared, or that
// failed in the last day: a video is posted by the server once it is ready,
// so the page can be left while it is prepared, and this is where it is
// found again. Asked after for as long as one is being prepared.
//
// A card at the head of the home feed, under the post on its way
// (VideoOnItsWayCard), since 2026-10-28; it was in the composer, where it
// was taken for part of the post being written. `exceptId` is the one being
// sent now, which that card shows itself.
const VideoUploads = ({
  viewerId,
  exceptId = 0,
  limits,
  refreshKey = 0,
}) => {
  const [earlier, setEarlier] = useState([]);

  const load = () => {
    api.browse().then((result) => {
      setEarlier(result.data.data || []);
    }).catch(() => {
      // Not shown. Nothing depends on it.
    });
  };
  useEffect(load, [viewerId, refreshKey]);

  const preparing = earlier.some((item) => {
    return item.status === 'processing';
  });
  useEffect(() => {
    if (!preparing) {
      return undefined;
    }
    const timer = setInterval(load, 8000);
    return () => {
      clearInterval(timer);
    };
  }, [preparing]);

  const listed = earlier.filter((item) => {
    return item.id !== exceptId;
  });

  if (listed.length === 0) {
    return null;
  }

  return (
    <Card sx={{ mb: 2 }}>
      <Stack spacing={1} sx={{ p: 2 }}>
        <Typography variant="subtitle1" component="h3">
          {i18n.t('videos:upload.title')}
        </Typography>
        {listed.map((item) => {
          return (
            <Stack
              key={`video-upload-${item.id}`}
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center' }}
            >
              <Stack sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" noWrap>
                  {item.title || i18n.t('composer:untitledVideo')}
                </Typography>
                <Typography
                  variant="body2"
                  color={item.status === 'failed' ? 'error' : 'textSecondary'}
                >
                  {item.status === 'processing' && i18n.t('videos:upload.processing')}
                  {item.status === 'uploading' && i18n.t('videos:upload.interrupted')}
                  {item.status === 'failed' &&
                  i18n.t(`videos:problems.${failureOf(item)}`, limits)}
                </Typography>
              </Stack>
              {item.status === 'ready' &&
              <Link href={`/videos/${item.nodeId}`}>
                {i18n.t('videos:upload.view')}
              </Link>}
              <Button
                size="small"
                color="inherit"
                onClick={() => {
                  api.cancel(item).catch(() => {}).then(load);
                }}
              >
                {i18n.t(item.status === 'failed' ?
                  'videos:upload.dismiss' :
                  'videos:upload.cancel')}
              </Button>
            </Stack>
          );
        })}
      </Stack>
    </Card>
  );
};

VideoUploads.propTypes = {
  viewerId: PropTypes.number.isRequired,
  exceptId: PropTypes.number,
  limits: PropTypes.objectOf(PropTypes.any).isRequired,
  // Changed to have the list read again: when a video has been handed over.
  refreshKey: PropTypes.number,
};

export default VideoUploads;
