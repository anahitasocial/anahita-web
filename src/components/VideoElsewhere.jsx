import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import CardMedia from '@mui/material/CardMedia';
import PlayCircleIcon from '@mui/icons-material/PlayCircleOutlined';
import OutboundIcon from '@mui/icons-material/OpenInNew';

import AltBadge from './AltBadge';
import i18n from '../languages';

// A video from elsewhere that is not kept here (utils/videoElsewhere.js):
// its poster, kept here, with a play button over it, and the site it plays
// on in the corner. Pressing it opens the post there, in a new tab.
const VideoElsewhere = ({
  poster,
  page,
  site,
  alt = '',
  description = '',
}) => {
  return (
    <Box sx={{ position: 'relative' }}>
      <ButtonBase
        component="a"
        href={page}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={i18n.t('media:videoElsewhere', { site })}
        sx={{
          display: 'block', width: '100%', position: 'relative', bgcolor: '#000',
        }}
      >
        <CardMedia component="img" image={poster} alt={alt} />
        <PlayCircleIcon
          sx={{
            position: 'absolute', inset: 0, m: 'auto', fontSize: 64, color: '#fff', opacity: 0.9,
          }}
        />
        <Box
          component="span"
          sx={{
            position: 'absolute',
            right: 8,
            bottom: 8,
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
          {site}
          <OutboundIcon sx={{ fontSize: 12 }} />
        </Box>
      </ButtonBase>
      <AltBadge text={description} />
    </Box>
  );
};

VideoElsewhere.propTypes = {
  poster: PropTypes.string.isRequired,
  page: PropTypes.string.isRequired,
  site: PropTypes.string.isRequired,
  alt: PropTypes.string,
  description: PropTypes.string,
};

export default VideoElsewhere;
