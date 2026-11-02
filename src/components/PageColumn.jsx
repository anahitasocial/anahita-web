import React from 'react';
import PropTypes from 'prop-types';

import Grid from '@mui/material/Grid';

// The column a page's content sits in: the whole width on a phone, and
// centred on anything wider, at `width` at most: 600 by default, wide enough
// for a photo and short enough for lines that are easy to read. `wide` gives
// it the whole page, for content that is laid out in columns of its own.
//
// The app wraps every page in one Container, which sets the most a page can
// be and its gutters. This is the choice a page makes inside that. It was
// the same two Grid elements written out on each page.
const PageColumn = ({ wide = false, width = 600, children }) => {
  return (
    <Grid container sx={{ justifyContent: 'center' }}>
      <Grid size={12} sx={wide ? null : { maxWidth: width }}>
        {children}
      </Grid>
    </Grid>
  );
};

PageColumn.propTypes = {
  wide: PropTypes.bool,
  width: PropTypes.number,
  children: PropTypes.node.isRequired,
};

export default PageColumn;
