import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  geolocated,
  geoPropTypes,
} from 'react-geolocated';
import { makeStyles } from 'tss-react/mui';
import AppBar from '@mui/material/AppBar';
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

const useStyles = makeStyles()((theme) => {
  return {
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  };
});

const LocationsSelector = ({
  node,
  isOpen,
  handleClose,
  coords,
  isGeolocationAvailable,
  isGeolocationEnabled,
  selectedLocations = [],
  onChange = null,
}) => {
  const { classes } = useStyles();

  const [tab, setTab] = useState(TABS.SEARCH);
  const [keyword, setKeyword] = useState('');

  const here = {
    longitude: 0,
    latitude: 0,
  };

  const changeTab = (event, value) => {
    setTab(value);
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
    <>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {i18n.t('locations:add.cTitle')}
          <IconButton
            onClick={handleClose}
            style={{
              float: 'right',
            }}
            className={classes.closeButton}
            size="large"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider light />
        <AppBar
          position="sticky"
          color="inherit"
          elevation={1}
        >
          <Tabs
            value={tab}
            onChange={changeTab}
            centered
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label={i18n.t('actions:search')} value={TABS.SEARCH} />
            <Tab label={i18n.t('actions:add')} value={TABS.ADD} />
          </Tabs>
        </AppBar>
        {tab === TABS.SEARCH &&
          <LocationsList
            node={node}
            queryFilters={{
              nearby_latitude: here.latitude,
              nearby_longitude: here.longitude,
            }}
            handleClose={handleClose}
            noResultsCallback={(newKeyword) => {
              setKeyword(newKeyword);
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
    </>
  );
};

LocationsSelector.propTypes = {
  node: NodeType.isRequired,
  isOpen: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  selectedLocations: PropTypes.arrayOf(NodeType),
  onChange: PropTypes.func,
  ...geoPropTypes,
};

export default geolocated({
  positionOptions: {
    enableHighAccuracy: false,
  },
  userDecisionTimeout: 5000,
})(LocationsSelector);
