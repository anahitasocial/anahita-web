import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import PlayIcon from '@mui/icons-material/PlayArrow';

import i18n from '../languages';
import videos from '../utils/videos';

// A video post made of a GIF or an animated PNG: played as the picture it
// was, silently, on a loop, with none of a player's controls.
//
// It waits to be pressed, showing its first picture: a page of them all
// moving at once is heavy for a browser, and for whoever is reading. Pressed,
// it plays on a loop until it is pressed again or scrolled away, and plays
// again when it comes back into view. The whole picture is that one button,
// so a keyboard reaches it too. A small "GIF" in its corner says what it is.
//
// It has one size, made at the picture's own; there is nothing to choose.
const LoopingClip = ({
  video,
  title = '',
}) => {
  const element = useRef(null);
  // Whether it is to play while it is in view: as it was last pressed.
  const wanted = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [file] = videos.filesOf(video);
  const url = file ? file.url : '';

  const play = (node) => {
    node.play().catch(() => {
      // The browser would not start it by itself. The button is there.
    });
  };

  useEffect(() => {
    const node = element.current;
    if (!node) {
      return undefined;
    }
    if (!window.IntersectionObserver) {
      return undefined;
    }
    const observer = new window.IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (wanted.current && node.paused) {
          play(node);
        }
      } else if (!node.paused) {
        node.pause();
      }
    }, { threshold: 0.25 });
    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [url]);

  if (!file) {
    return null;
  }

  const toggle = () => {
    const node = element.current;
    if (!node) {
      return;
    }
    if (node.paused) {
      wanted.current = true;
      play(node);
    } else {
      wanted.current = false;
      node.pause();
    }
  };

  return (
    <Box sx={{ position: 'relative', bgcolor: 'common.black', lineHeight: 0 }}>
      <Box
        component="video"
        ref={element}
        src={videos.urlOf(file.url)}
        poster={videos.urlOf(video.poster) || undefined}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        onPlay={() => {
          setPlaying(true);
        }}
        onPause={() => {
          setPlaying(false);
        }}
        sx={{
          display: 'block',
          width: '100%',
          maxHeight: '80vh',
          objectFit: 'contain',
          aspectRatio: video.width && video.height ? `${video.width} / ${video.height}` : undefined,
        }}
      />
      <Box
        component="button"
        type="button"
        onClick={toggle}
        aria-label={`${i18n.t(playing ? 'videos:player.pause' : 'videos:player.play')}${title ? `: ${title}` : ''}`}
        aria-pressed={playing}
        sx={{
          position: 'absolute',
          inset: 0,
          p: 0,
          border: 0,
          bgcolor: 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&:focus-visible': {
            outline: '3px solid',
            outlineColor: 'primary.main',
            outlineOffset: -3,
          },
        }}
      >
        {!playing &&
          <Box
            component="span"
            sx={{
              display: 'flex',
              p: 1,
              borderRadius: '50%',
              color: 'common.white',
              bgcolor: 'rgba(0, 0, 0, 0.6)',
            }}
          >
            <PlayIcon fontSize="large" />
          </Box>}
      </Box>
      <Box
        component="span"
        aria-hidden="true"
        sx={{
          position: 'absolute',
          left: 8,
          bottom: 8,
          px: 0.75,
          borderRadius: 1,
          bgcolor: 'rgba(0, 0, 0, 0.7)',
          color: 'common.white',
          fontSize: 12,
          fontWeight: 700,
          lineHeight: 1.6,
          pointerEvents: 'none',
        }}
      >
        {i18n.t('videos:player.gif')}
      </Box>
    </Box>
  );
};

LoopingClip.propTypes = {
  // A post's `video`, with `loop` set.
  video: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number,
    poster: PropTypes.string,
    files: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  title: PropTypes.string,
};

export default LoopingClip;
