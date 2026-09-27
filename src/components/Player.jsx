import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import ReactPlayer from 'react-player';
import { withStyles } from 'tss-react/mui';

const regex = /((?:https?|http?):\/\/[-a-z0-9+&@#/%?=~_()|!:,.;]*[-a-z0-9+&@#/%=~_()|])/ig;

const styles = (theme) => {
  return {
    root: {
      position: 'relative',
      paddingTop: '56.25%', /* 56.25% Player ratio: 100 / (1280 / 720) */
      backgroundColor: theme.palette.background.default,
    },
    reactPlayer: {
      position: 'absolute',
      top: 0,
      left: 0,
    },
  };
};

const MediaPlayer = ({
  text = '',
  classes,
}) => {
  const [playing, setPlaying] = useState(false);
  const rootRef = useRef(null);
  const urls = text.match(regex);
  const isEmpty = !urls || !urls[0].match(/(youtu|vimeo|soundcloud|dailymotion|mixcloud|twitch)/);

  // Stop playing once the player has scrolled out of view.
  useEffect(() => {
    const node = rootRef.current;
    if (!node || !window.IntersectionObserver) {
      return undefined;
    }
    const observer = new window.IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        setPlaying(false);
      }
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [isEmpty]);

  if (isEmpty) {
    return null;
  }

  return (
    <div className={classes.root} ref={rootRef}>
      <ReactPlayer
        url={urls[0]}
        controls
        light
        width="100%"
        height="100%"
        className={classes.reactPlayer}
        playing={playing}
        onPlay={() => {
          setPlaying(true);
        }}
      />
    </div>
  );
};

MediaPlayer.propTypes = {
  classes: PropTypes.object.isRequired,
  text: PropTypes.string,
};

export default withStyles(MediaPlayer, styles);
