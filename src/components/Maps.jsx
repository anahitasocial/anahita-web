import React, { lazy, Suspense } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';

// The map and the point picker, with leaflet, fetched the first time one is
// shown rather than with the app (roadmap row 128): most pages have no map.
// Until it has come, its room is kept, at its own size, so nothing moves.
const Map = lazy(() => { return import('./Map'); });
const PointPicker = lazy(() => { return import('./PointPicker'); });

const Room = ({ width = '100%', height }) => {
  return <Box sx={{ width, height }} />;
};

Room.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

// The same as components/Map, and the same props.
export const AnahitaMap = (props) => {
  const { width = '100%', height = 400 } = props;
  return (
    <Suspense fallback={<Room width={width} height={height} />}>
      <Map {...props} />
    </Suspense>
  );
};

AnahitaMap.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

// The same as components/PointPicker, and the same props.
export const AnahitaPointPicker = (props) => {
  const { height = 240 } = props;
  return (
    <Suspense fallback={<Room height={height} />}>
      <PointPicker {...props} />
    </Suspense>
  );
};

AnahitaPointPicker.propTypes = {
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
