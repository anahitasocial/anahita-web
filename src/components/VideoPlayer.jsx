import React, {
  useEffect, useMemo, useId, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import QualityIcon from '@mui/icons-material/HighQuality';

import i18n from '../languages';
import videos from '../utils/videos';

// A video post's video: the browser's own player, with a choice of size.
//
// The video is kept at a few sizes. It starts at 720p, or at the smallest
// where the browser says the connection is slow, or at the size this person
// chose last time. The sizes are in a row under it, the one playing marked,
// and a choice is remembered in the browser.
// Changing size carries on from where the video was. Nothing changes size
// while it plays: the sizes are whole files, not a stream.
//
// Each size is at an address of the API's that asks, every time, whether
// this viewer may see the post, and sends the browser on to the file.
const VideoPlayer = ({
  video = null,
  title = '',
}) => {
  const files = useMemo(() => {
    return videos.filesOf(video);
  }, [video]);

  const [height, setHeight] = useState(() => {
    const first = videos.pick(video, {
      preferred: videos.rememberedQuality(),
      slow: videos.isSlow(typeof navigator !== 'undefined' ? navigator.connection : null),
    });
    return first ? first.height : 0;
  });
  const groupId = useId();
  const element = useRef(null);
  // Where to carry on from, and whether it was playing, across a change
  // of size.
  const resume = useRef(null);

  const file = files.find((candidate) => {
    return candidate.height === height;
  }) || files[0];

  // Stop once it has scrolled out of view, as the embedded players do.
  useEffect(() => {
    const node = element.current;
    if (!node || !window.IntersectionObserver) {
      return undefined;
    }
    const observer = new window.IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting && !node.paused) {
        node.pause();
      }
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, []);

  if (!file) {
    return null;
  }

  const choose = (chosen) => {
    if (chosen.height === file.height) {
      return;
    }
    const node = element.current;
    if (node) {
      resume.current = { time: node.currentTime, playing: !node.paused };
    }
    videos.rememberQuality(chosen.height);
    setHeight(chosen.height);
  };

  const handleLoaded = () => {
    const node = element.current;
    const from = resume.current;
    if (!node || !from) {
      return;
    }
    resume.current = null;
    node.currentTime = from.time;
    if (from.playing) {
      node.play().catch(() => {
        // The browser would not start it by itself. The button is there.
      });
    }
  };

  return (
    <Box>
      <Box sx={{ bgcolor: 'common.black', lineHeight: 0 }}>
        {/* The key makes a new element for each size: a browser does not
          reliably start again from a changed src on the same one. */}
        <Box
          component="video"
          key={file.url}
          ref={element}
          src={videos.urlOf(file.url)}
          poster={videos.urlOf(video.poster) || undefined}
          title={title || undefined}
          controls
          playsInline
          preload={resume.current ? 'auto' : 'metadata'}
          onLoadedMetadata={handleLoaded}
          sx={{
            display: 'block',
            width: '100%',
            maxHeight: '80vh',
            aspectRatio: video.width && video.height ? `${video.width} / ${video.height}` : '16 / 9',
          }}
        />
      </Box>
      {/* The sizes, in a row under the video and always in view: one press
          each, with the one playing marked. */}
      {files.length > 1 &&
        <Stack
          direction="row"
          spacing={1}
          sx={{
            px: 2, py: 1, alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <QualityIcon fontSize="small" color="action" />
            <Typography variant="body2" color="textSecondary" id={groupId}>
              {i18n.t('videos:player.quality')}
            </Typography>
          </Stack>
          <ToggleButtonGroup
            exclusive
            size="small"
            color="primary"
            value={file.height}
            aria-labelledby={groupId}
            onChange={(event, chosen) => {
              const next = files.find((candidate) => {
                return candidate.height === chosen;
              });
              // Pressing the one that is playing chooses nothing.
              if (next) {
                choose(next);
              }
            }}
          >
            {files.map((candidate) => {
              return (
                <ToggleButton
                  key={`quality-${candidate.height}`}
                  value={candidate.height}
                  sx={{ px: 2 }}
                >
                  {videos.label(candidate)}
                </ToggleButton>
              );
            })}
          </ToggleButtonGroup>
        </Stack>}
    </Box>
  );
};

VideoPlayer.propTypes = {
  // What a video post carries as `video`: its sizes and its poster.
  video: PropTypes.shape({
    duration: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
    poster: PropTypes.string,
    files: PropTypes.arrayOf(PropTypes.object),
  }),
  title: PropTypes.string,
};

export default VideoPlayer;
