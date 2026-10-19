import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useGeolocated } from 'react-geolocated';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CloseIcon from '@mui/icons-material/Close';

import NodeType from '../../../proptypes/Node';
import LocationsList from './List';
import AddLocation from './Add';
import i18n from '../../../languages';

const TABS = {
  SEARCH: 'search',
  ADD: 'add',
};

// The dialog keeps one height whatever is in it, so nothing moves as
// results arrive, as somebody types, or between the two tabs. On a phone it
// is the whole screen.
const PAPER = {
  height: 'min(640px, calc(100% - 64px))',
};

const LocationsSelector = ({
  node,
  isOpen,
  handleClose,
  selectedLocations = [],
  onChange = null,
}) => {
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));

  // The dialog stays mounted while closed, so it asks for the viewer's
  // position when it opens, not when it mounts.
  const {
    coords,
    isGeolocationAvailable,
    isGeolocationEnabled,
    getPosition,
  } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: false,
    },
    userDecisionTimeout: 5000,
    suppressLocationOnMount: true,
  });

  useEffect(() => {
    if (isOpen && !coords) {
      getPosition();
    }
  }, [isOpen]);

  const [tab, setTab] = useState(TABS.SEARCH);
  const [keyword, setKeyword] = useState('');

  const here = {
    longitude: 0,
    latitude: 0,
  };

  // Tell the gadget that opened this dialog to re-read its list. Both tabs
  // end in a tag being created, and neither could reach that list before.
  const handleChanged = () => {
    if (onChange) {
      onChange();
    }
  };

  if (node.longitude && node.latitude) {
    here.longitude = node.longitude;
    here.latitude = node.latitude;
  } else if (
    isGeolocationAvailable &&
    isGeolocationEnabled &&
    coords
  ) {
    here.longitude = coords.longitude;
    here.latitude = coords.latitude;
  }

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isPhone}
      aria-labelledby="locations-add-title"
      slotProps={{ paper: { sx: isPhone ? {} : PAPER } }}
    >
      <DialogTitle
        id="locations-add-title"
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <span style={{ flexGrow: 1 }}>
          {i18n.t('locations:add.cTitle')}
        </span>
        <IconButton
          onClick={handleClose}
          aria-label={i18n.t('actions:close')}
          edge="end"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Tabs
        value={tab}
        onChange={(event, value) => {
          setTab(value);
        }}
        variant="fullWidth"
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab label={i18n.t('actions:search')} value={TABS.SEARCH} />
        <Tab label={i18n.t('actions:add')} value={TABS.ADD} />
      </Tabs>
      <Divider />
      {tab === TABS.SEARCH &&
      <LocationsList
        node={node}
        keyword={keyword}
        onKeywordChange={setKeyword}
        queryFilters={{
          nearby_latitude: here.latitude,
          nearby_longitude: here.longitude,
        }}
        handleClose={handleClose}
        onCreate={() => {
          setTab(TABS.ADD);
        }}
        selectedLocations={selectedLocations}
        onChange={handleChanged}
      />}
      {tab === TABS.ADD &&
      <AddLocation
        node={node}
        name={keyword}
        callback={() => {
          handleChanged();
          handleClose();
        }}
      />}
    </Dialog>
  );
};

LocationsSelector.propTypes = {
  node: NodeType.isRequired,
  isOpen: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  selectedLocations: PropTypes.arrayOf(NodeType),
  onChange: PropTypes.func,
};

export default LocationsSelector;
