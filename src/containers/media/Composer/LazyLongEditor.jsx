import React, { Suspense, lazy } from 'react';
import PropTypes from 'prop-types';

import Skeleton from '@mui/material/Skeleton';

// The editor, with what it is made of, is fetched when long writing is
// first opened or edited: most people reading never write at length, and
// it would add a sixth to what every page loads. Room is kept for it while
// it comes, so nothing under it moves more than it must.
const LongEditor = lazy(() => {
  return import('./LongEditor');
});

const LazyLongEditor = (props) => {
  const { minHeight = 280 } = props;
  return (
    <Suspense
      fallback={<Skeleton variant="rounded" height={minHeight + 64} sx={{ mb: 3.5 }} />}
    >
      <LongEditor {...props} />
    </Suspense>
  );
};

LazyLongEditor.propTypes = {
  minHeight: PropTypes.number,
};

export default LazyLongEditor;
