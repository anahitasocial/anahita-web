import React from 'react';
import PropTypes from 'prop-types';

import Grid from '@mui/material/Grid';

// The column a page's content sits in: the whole width on a phone, and on a
// wide screen two thirds of the page, centred. `wide` gives it the whole
// page there too, for content that is laid out in columns of its own.
//
// The app wraps every page in one Container, which sets the most a page can
// be and its gutters. This is the choice a page makes inside that. It was
// the same two Grid elements written out on each page.
const PageColumn = ({ wide = false, children }) => {
  return (
    <Grid container sx={{ justifyContent: 'center' }}>
      <Grid size={{ xs: 12, md: wide ? 12 : 8 }}>
        {children}
      </Grid>
    </Grid>
  );
};

PageColumn.propTypes = {
  wide: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

export default PageColumn;
