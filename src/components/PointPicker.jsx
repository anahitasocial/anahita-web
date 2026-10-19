import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Stack from '@mui/material/Stack';
import MyLocationIcon from '@mui/icons-material/MyLocation';

import { TILE_URL, TILE_ATTRIBUTION } from './Map';
import i18n from '../languages';

// The whole world, for a location with no pin yet and nowhere to start.
const WORLD = { center: [20, 0], zoom: 2 };
const NEAR_ZOOM = 13;
const PIN_ZOOM = 16;

// Points are kept to six decimals, about 10 cm, as the server keeps them.
const round = (value) => {
  return Math.round(value * 1e6) / 1e6;
};

const toPoint = (latlng) => {
  return {
    latitude: round(latlng.lat),
    longitude: round(latlng.lng),
  };
};

const isSet = (point) => {
  return Boolean(point && (Number(point.latitude) || Number(point.longitude)));
};

const asLatLng = (point) => {
  return [Number(point.latitude), Number(point.longitude)];
};

// A tap anywhere on the map places the pin there.
const TapToPlace = ({ onChange, disabled }) => {
  useMapEvents({
    click: (event) => {
      if (!disabled) {
        onChange(toPoint(event.latlng));
      }
    },
  });

  return null;
};

TapToPlace.propTypes = {
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
};

// Brings the pin into view when it is put somewhere off the map, such as by
// Use my position. A pin tapped or dragged into place is in view already.
// A map that opens in a dialog measures itself before the dialog has grown,
// so it measures itself again once it has.
const FollowPin = ({ point, flyKey }) => {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);
    return () => {
      clearTimeout(timer);
    };
  }, [map]);

  useEffect(() => {
    if (flyKey && isSet(point)) {
      map.setView(asLatLng(point), PIN_ZOOM);
    }
  }, [map, flyKey]);

  return null;
};

FollowPin.propTypes = {
  point: PropTypes.shape({
    latitude: PropTypes.number,
    longitude: PropTypes.number,
  }),
  flyKey: PropTypes.number.isRequired,
};

// Where a location is: a pin placed by a tap or a drag. Use my position asks
// the browser for one reading, used only as where the pin starts; it is not
// kept anywhere but in the pin. `near` is where the map opens when there is
// no pin yet, and places nothing.
const PointPicker = ({
  point = null,
  onChange,
  near = null,
  height = 240,
  disabled = false,
  error = '',
}) => {
  const [asking, setAsking] = useState(false);
  const [denied, setDenied] = useState(false);
  const [flyKey, setFlyKey] = useState(0);

  const canAsk = typeof navigator !== 'undefined' && Boolean(navigator.geolocation);

  const handleUseMine = () => {
    setAsking(true);
    setDenied(false);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setAsking(false);
        onChange(toPoint({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }));
        setFlyKey(flyKey + 1);
      },
      () => {
        setAsking(false);
        setDenied(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  };

  let view = WORLD;
  if (isSet(point)) {
    view = { center: asLatLng(point), zoom: PIN_ZOOM };
  } else if (isSet(near)) {
    view = { center: asLatLng(near), zoom: NEAR_ZOOM };
  }

  let message = i18n.t('locations:point.hint');
  if (error) {
    message = error;
  } else if (denied) {
    message = i18n.t('locations:point.denied');
  }

  return (
    <Box>
      <Box
        sx={{
          height,
          borderRadius: 1,
          overflow: 'hidden',
          border: 1,
          borderColor: error ? 'error.main' : 'divider',
        }}
      >
        <MapContainer
          style={{ width: '100%', height: '100%' }}
          center={view.center}
          zoom={view.zoom}
          scrollWheelZoom={false}
          attributionControl={false}
          aria-label={i18n.t('locations:point.label')}
        >
          <TileLayer
            url={TILE_URL}
            attribution={TILE_ATTRIBUTION}
          />
          <TapToPlace onChange={onChange} disabled={disabled} />
          <FollowPin point={point} flyKey={flyKey} />
          {isSet(point) &&
            <Marker
              position={asLatLng(point)}
              draggable={!disabled}
              title={i18n.t('locations:point.label')}
              alt={i18n.t('locations:point.label')}
              eventHandlers={{
                dragend: (event) => {
                  onChange(toPoint(event.target.getLatLng()));
                },
              }}
            />}
        </MapContainer>
      </Box>
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
      >
        <FormHelperText error={Boolean(error) || denied} sx={{ mx: 0 }}>
          {message}
        </FormHelperText>
        {canAsk &&
          <Button
            size="small"
            startIcon={<MyLocationIcon />}
            onClick={handleUseMine}
            disabled={disabled || asking}
            sx={{ flexShrink: 0 }}
          >
            {i18n.t('locations:point.useMine')}
          </Button>}
      </Stack>
    </Box>
  );
};

PointPicker.propTypes = {
  point: PropTypes.shape({
    latitude: PropTypes.number,
    longitude: PropTypes.number,
  }),
  onChange: PropTypes.func.isRequired,
  near: PropTypes.shape({
    latitude: PropTypes.number,
    longitude: PropTypes.number,
  }),
  height: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  disabled: PropTypes.bool,
  error: PropTypes.string,
};

export default PointPicker;
