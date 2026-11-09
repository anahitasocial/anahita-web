import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import CardMedia from '@mui/material/CardMedia';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import PlayCircleIcon from '@mui/icons-material/PlayCircleOutlined';
import OutboundIcon from '@mui/icons-material/OpenInNew';

import AltBadge from './AltBadge';
import VideoPlayer from './VideoPlayer';
import api from '../api/videos';
import i18n from '../languages';

// How often a video being copied is asked after, and for how long.
const ASK_EVERY = 2000;
const ASK_FOR = 5 * 60 * 1000;

// A video from elsewhere (utils/videoElsewhere.js, roadmap row 120): its
// poster, kept here, with a play button over it, and the site it is on in
// the corner, which leads there.
//
// Pressing play, somebody signed in has it copied here and played from this
// site, never from the other server, which would tell it who watched: the
// first time, "Getting the video…" while it comes, which is seconds for most.
// Signed out, or when it cannot be had here, play leads to its page there.
// One already copied plays at once.
const VideoElsewhere = ({
  node,
  elsewhere,
  poster = '',
  alt = '',
  description = '',
  title = '',
}) => {
  const isAuthenticated = useSelector((state) => { return state.session.isAuthenticated; });
  const [video, setVideo] = useState(node.video || null);
  const [started, setStarted] = useState(false);
  const [state, setState] = useState('idle');
  const timer = useRef(null);
  const since = useRef(0);

  useEffect(() => {
    return () => { clearTimeout(timer.current); };
  }, []);

  const playsHere = isAuthenticated && elsewhere.kind === 'video';

  const answered = (result, askedAgain) => {
    const { status, video: ready } = result.data || {};
    if (status === 'ready' && ready) {
      setVideo(ready);
      setStarted(true);
      setState('idle');
      return;
    }
    if (status === 'failed') {
      setState('failed');
      return;
    }
    if (Date.now() - since.current > ASK_FOR) {
      setState('failed');
      return;
    }
    // Removed since it was last read: asked for again, once.
    const next = status === 'removed' && !askedAgain ?
      () => { return api.askElsewhere(node.id).then((r) => { answered(r, true); }); } :
      () => { return api.readElsewhere(node.id).then((r) => { answered(r, askedAgain); }); };
    timer.current = setTimeout(() => {
      next().catch(() => { setState('failed'); });
    }, ASK_EVERY);
  };

  const play = (event) => {
    if (!playsHere) {
      return;
    }
    event.preventDefault();
    if (state === 'working') {
      return;
    }
    setState('working');
    since.current = Date.now();
    api.askElsewhere(node.id).then((result) => {
      answered(result, false);
    }).catch(() => {
      setState('failed');
    });
  };

  if (video) {
    return (
      <VideoPlayer
        video={{ ...video, poster: video.poster || poster }}
        title={title}
        autoPlay={started}
      />
    );
  }

  const site = (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        borderRadius: 1,
        bgcolor: 'rgba(0, 0, 0, 0.65)',
        color: 'common.white',
        fontSize: 12,
        fontWeight: 600,
        lineHeight: '22px',
        letterSpacing: 0.5,
      }}
    >
      {elsewhere.site}
      <OutboundIcon sx={{ fontSize: 12 }} />
    </Box>
  );

  return (
    <Box sx={{ position: 'relative' }}>
      <ButtonBase
        // Played here when it may be; otherwise a link to it there.
        {...(playsHere ?
          { onClick: play } :
          {
            component: 'a', href: elsewhere.page, target: '_blank', rel: 'noopener noreferrer',
          })}
        aria-label={playsHere ?
          i18n.t('media:elsewhere.play') :
          i18n.t('media:videoElsewhere', { site: elsewhere.site })}
        aria-busy={state === 'working'}
        sx={{
          display: 'block', width: '100%', position: 'relative', bgcolor: '#000',
        }}
      >
        {poster ?
          <CardMedia component="img" image={poster} alt={alt} /> :
          <Box sx={{ aspectRatio: '16 / 9' }} />}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            color: 'common.white',
          }}
        >
          {state === 'working' ?
            <>
              <CircularProgress color="inherit" size={48} />
              <Typography variant="body2" sx={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)' }}>
                {i18n.t('media:elsewhere.getting')}
              </Typography>
            </> :
            <PlayCircleIcon sx={{ fontSize: 64, opacity: 0.9 }} />}
        </Box>
      </ButtonBase>
      {/* The site it is on, always leading there. */}
      <Link
        href={elsewhere.page}
        target="_blank"
        rel="noopener noreferrer"
        underline="none"
        aria-label={i18n.t('media:videoElsewhere', { site: elsewhere.site })}
        sx={{ position: 'absolute', right: 8, bottom: 8 }}
      >
        {site}
      </Link>
      <AltBadge text={description} />
      {state === 'failed' &&
        <Typography variant="body2" color="textSecondary" sx={{ px: 2, pt: 1 }}>
          {i18n.t('media:elsewhere.failed')}
          {' '}
          <Link href={elsewhere.page} target="_blank" rel="noopener noreferrer">
            {i18n.t('media:videoElsewhere', { site: elsewhere.site })}
          </Link>
        </Typography>}
    </Box>
  );
};

VideoElsewhere.propTypes = {
  // The post: its id, and its video once copied.
  node: PropTypes.shape({
    id: PropTypes.number,
    video: PropTypes.shape({}),
  }).isRequired,
  // From utils/videoElsewhere.js.
  elsewhere: PropTypes.shape({
    kind: PropTypes.string,
    page: PropTypes.string,
    site: PropTypes.string,
  }).isRequired,
  poster: PropTypes.string,
  alt: PropTypes.string,
  description: PropTypes.string,
  title: PropTypes.string,
};

export default VideoElsewhere;
