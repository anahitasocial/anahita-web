import React from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

// A composer's button for something that takes a moment, Post or Save
// draft: its label, or a small spinner in its place while it is being done,
// at least 88 px wide so that it keeps its width as one becomes the other.
// Everything else is the Button's own.
const ProgressButton = ({
  busy,
  children,
  sx = { minWidth: 88 },
  ...props
}) => {
  return (
    <Button sx={sx} {...props}>
      {!busy && children}
      {busy && <CircularProgress size={20} />}
    </Button>
  );
};

ProgressButton.propTypes = {
  // Whether it is being done now.
  busy: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  sx: PropTypes.object,
};

export default ProgressButton;
