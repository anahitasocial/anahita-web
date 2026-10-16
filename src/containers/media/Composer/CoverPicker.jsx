import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/AddPhotoAlternate';
import RemoveIcon from '@mui/icons-material/Close';

import i18n from '../../../languages';

// What the cover service takes (identity-image-service): said when it is
// picked rather than after the article is posted.
const TYPES = ['image/jpeg', 'image/png'];
const MAX_BYTES = 10 * 1024 * 1024;

// An article's cover, chosen before it is posted: a slim band that says so
// and, once a picture is chosen, the picture itself in the shape it has on
// the article, a wide band three times as wide as it is tall. It is sent
// once the article exists (Long.jsx), to the same place a profile's cover
// goes.
const CoverPicker = ({
  file = null,
  onChange,
  disabled = false,
}) => {
  const picker = useRef(null);
  const [preview, setPreview] = useState('');
  const [problem, setProblem] = useState('');

  // The browser's own address for the picked file, let go of when another
  // is picked or this goes away.
  useEffect(() => {
    if (!file) {
      setPreview('');
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const choose = (event) => {
    const chosen = event.target.files && event.target.files[0];
    // The same file can be chosen again after it is taken off.
    // eslint-disable-next-line no-param-reassign
    event.target.value = '';
    if (!chosen) {
      return;
    }
    if (!TYPES.includes(chosen.type)) {
      setProblem(i18n.t('media:image.unsupported'));
      return;
    }
    if (chosen.size > MAX_BYTES) {
      setProblem(i18n.t('media:image.tooLarge'));
      return;
    }
    setProblem('');
    onChange(chosen);
  };

  const input = (
    <input
      ref={picker}
      type="file"
      accept={TYPES.join(',')}
      hidden
      onChange={choose}
    />
  );

  if (!preview) {
    return (
      <Box sx={{ pb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          fullWidth
          disabled={disabled}
          onClick={() => {
            picker.current.click();
          }}
          sx={{ minHeight: 56, borderStyle: 'dashed' }}
        >
          {i18n.t('actions:addCover')}
        </Button>
        {problem &&
          <Typography variant="caption" color="error" component="p" role="alert" sx={{ mt: 1 }}>
            {problem}
          </Typography>}
        {input}
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 3 }}>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: '3 / 1',
          maxHeight: 320,
          borderRadius: 1,
          overflow: 'hidden',
          backgroundColor: 'background.default',
          backgroundImage: `url(${preview})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {!disabled &&
          <IconButton
            size="small"
            aria-label={i18n.t('composer:removeCover')}
            onClick={() => {
              onChange(null);
            }}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'common.white',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
            }}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>}
      </Box>
      {input}
    </Box>
  );
};

CoverPicker.propTypes = {
  file: PropTypes.object,
  // Called with the picture chosen, or null when it is taken off.
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default CoverPicker;
