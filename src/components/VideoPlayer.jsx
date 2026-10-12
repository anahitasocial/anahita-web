import React, {
  useEffect, useMemo, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListSubheader from '@mui/material/ListSubheader';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import QualityIcon from '@mui/icons-material/Settings';
import ChosenIcon from '@mui/icons-material/Check';

import i18n from '../languages';
import videos from '../utils/videos';

// A video post's video: the browser's own player, with a choice of size.
//
// The video is kept at a few sizes. It starts at 720p, or at the smallest
// where the browser says the connection is slow, or at the size this person
// chose last time. A cog in its corner opens the sizes, the one playing
// ticked; a choice is remembered in the browser.
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
  const [anchorEl, setAnchorEl] = useState(null);
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
      <Box sx={{ position: 'relative', bgcolor: 'common.black', lineHeight: 0 }}>
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
        {/* The size, on the video: a cog in its corner that opens the sizes,
            the one playing ticked. In the top corner, clear of
            the browser's own controls along the bottom. */}
        {files.length > 1 &&
          <>
            <IconButton
              size="small"
              onClick={(event) => {
                setAnchorEl(event.currentTarget);
              }}
              aria-haspopup="menu"
              aria-expanded={anchorEl ? 'true' : undefined}
              aria-label={i18n.t('videos:player.qualityOf', { label: videos.label(file) })}
              title={i18n.t('videos:player.quality')}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: 'common.white',
                bgcolor: 'rgba(0, 0, 0, 0.7)',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.9)' },
              }}
            >
              <QualityIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => {
                setAnchorEl(null);
              }}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <ListSubheader sx={{ lineHeight: 2 }}>
                {i18n.t('videos:player.quality')}
              </ListSubheader>
              {files.map((candidate) => {
                return (
                  <MenuItem
                    key={`quality-${candidate.height}`}
                    selected={candidate.height === file.height}
                    onClick={() => {
                      setAnchorEl(null);
                      choose(candidate);
                    }}
                  >
                    <ListItemIcon>
                      {candidate.height === file.height && <ChosenIcon fontSize="small" />}
                    </ListItemIcon>
                    {videos.label(candidate)}
                  </MenuItem>
                );
              })}
            </Menu>
          </>}
      </Box>
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
