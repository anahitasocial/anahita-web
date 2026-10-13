import React, { useState } from 'react';
import PropTypes from 'prop-types';

import ButtonBase from '@mui/material/ButtonBase';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';

import i18n from '../languages';

// "ALT", in the corner of a photo that has a description, for somebody who
// can see the photo and wants to read what its author said it shows.
//
// A screen reader is given the description as the photo's own; this is for
// everybody else, and is how a reader can tell that a photo has one at
// all. Pressing it shows the words beside it. Nothing is drawn for a photo
// with none.
//
// It is put inside something that is `position: relative`, over the photo.
const AltBadge = ({ text = '' }) => {
  const [anchor, setAnchor] = useState(null);
  const words = (text || '').trim();

  if (!words) {
    return null;
  }

  return (
    <>
      <ButtonBase
        aria-label={i18n.t('photos:alt.show')}
        aria-haspopup="dialog"
        aria-expanded={Boolean(anchor)}
        // The photo under it is often a link or opens the lightbox:
        // pressing this does only this.
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setAnchor(event.currentTarget);
        }}
        sx={{
          position: 'absolute',
          left: 8,
          bottom: 8,
          px: 1,
          borderRadius: 1,
          fontSize: 12,
          fontWeight: 600,
          lineHeight: '22px',
          letterSpacing: 0.5,
          color: 'common.white',
          bgcolor: 'rgba(0, 0, 0, 0.65)',
          '&:hover, &.Mui-focusVisible': {
            bgcolor: 'rgba(0, 0, 0, 0.85)',
          },
        }}
      >
        {i18n.t('photos:editor.alt')}
      </ButtonBase>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => {
          setAnchor(null);
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { maxWidth: 360, p: 2 } } }}
      >
        <Typography variant="subtitle2" gutterBottom>
          {i18n.t('photos:alt.title')}
        </Typography>
        <Typography variant="body2" dir="auto" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
          {words}
        </Typography>
      </Popover>
    </>
  );
};

AltBadge.propTypes = {
  // What the photo's author said it shows.
  text: PropTypes.string,
};

export default AltBadge;
