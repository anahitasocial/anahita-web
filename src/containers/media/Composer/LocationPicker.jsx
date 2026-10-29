import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import AddIcon from '@mui/icons-material/Add';
import BackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import LocationIcon from '@mui/icons-material/LocationOnOutlined';
import NearMeIcon from '@mui/icons-material/MyLocation';
import PhotoIcon from '@mui/icons-material/PhotoOutlined';

import AddLocation from '../../locations/Add/Add';
import DetailRow from '../../../components/DetailRow';
import api from '../../../api';
import permissions from '../../../permissions';
import i18n from '../../../languages';
import { Medium as MEDIUM } from '../../../constants';

// How long to wait after the last keystroke before searching.
const SEARCH_DELAY_MS = 250;
// As many results as fit the popover without scrolling far.
const LIMIT = 8;

// Add location, among a composer's small buttons (roadmap row 82, part 3): a
// popover with a search as one types, a Near me chip that asks the browser
// for a position only when tapped, and, for those who may add a location
// (LOCATIONS_FROM), Add "…" as a new location. The arrow keys and Enter work
// as in the hashtag suggestions. What is chosen goes to `onPick`.
//
// `photoPoint` is where a photo of the post was taken, read in the browser
// (part 5). It is offered in one line, and only when that line is tapped is
// it used, as the point of this search; never shown, sent elsewhere or kept.
const LocationPicker = ({
  chosen,
  onPick,
  disabled = false,
  photoPoint = null,
  row = false,
}) => {
  const phone = useMediaQuery((theme) => { return theme.breakpoints.down('sm'); });
  const canAdd = useSelector((state) => {
    const { nodeInfo } = state.app;
    return permissions.location.canAdd(
      state.session.viewer,
      (nodeInfo && nodeInfo.metadata) || {},
    );
  });

  const buttonRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [near, setNear] = useState(null);
  // Whose point `near` is: the viewer's, asked of the browser, or the
  // photo's.
  const [nearFrom, setNearFrom] = useState('');
  const [asking, setAsking] = useState(false);
  const [denied, setDenied] = useState(false);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [active, setActive] = useState(0);
  const [adding, setAdding] = useState(false);

  const max = MEDIUM.MAX_LOCATIONS;
  const full = chosen.length >= max;
  const keyword = q.trim();

  // Searched as one types, near the viewer once they have asked for that.
  useEffect(() => {
    if (!open || (!keyword && !near)) {
      setResults([]);
      setSearched(false);
      return undefined;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      setIsFetching(true);
      api.locations.browse({
        keywordFilter: keyword || undefined,
        nearby_latitude: near ? near.latitude : undefined,
        nearby_longitude: near ? near.longitude : undefined,
        limit: LIMIT,
      }).then(({ data }) => {
        if (!cancelled) {
          setResults(data.data || []);
          setSearched(true);
          setActive(0);
        }
      }).catch(() => {
        if (!cancelled) {
          setResults([]);
          setSearched(true);
        }
      }).finally(() => {
        if (!cancelled) {
          setIsFetching(false);
        }
      });
    }, SEARCH_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, keyword, near]);

  const close = () => {
    setOpen(false);
    setQ('');
    setResults([]);
    setSearched(false);
  };

  const isChosen = (location) => {
    return chosen.some((each) => { return each.id === location.id; });
  };

  const pick = (location) => {
    if (!isChosen(location) && !full) {
      onPick(location);
    }
    close();
  };

  // One reading of where the viewer is, only when Near me is tapped, used
  // for this search and kept nowhere.
  const askNear = () => {
    if (near && nearFrom === 'me') {
      setNear(null);
      setNearFrom('');
      return;
    }
    if (!navigator.geolocation) {
      setDenied(true);
      return;
    }
    setAsking(true);
    setDenied(false);
    navigator.geolocation.getCurrentPosition((position) => {
      setAsking(false);
      setNearFrom('me');
      setNear({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    }, () => {
      setAsking(false);
      setDenied(true);
    }, { maximumAge: 60000, timeout: 10000 });
  };

  const offerAdd = canAdd && keyword !== '' && searched;
  const rows = results.length + (offerAdd ? 1 : 0);

  const onKeyDown = (event) => {
    if (rows === 0) {
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((active + 1) % rows);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((active - 1 + rows) % rows);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (active < results.length) {
        pick(results[active]);
      } else {
        setAdding(true);
        setOpen(false);
      }
    }
  };

  let hint = '';
  if (asking) {
    hint = i18n.t('locations:lists.asking');
  } else if (denied) {
    hint = i18n.t('locations:point.denied');
  } else if (!keyword && !near) {
    hint = i18n.t('composer:locations.hint');
  } else if (searched && results.length === 0) {
    hint = keyword ?
      i18n.t('locations:add.noneFound', { name: keyword }) :
      i18n.t('locations:add.noneNearby');
  }

  const panel = (
    <>
      <Box sx={{ p: 2, pb: 1 }}>
        {full ?
          <Typography variant="body2" color="textSecondary">
            {i18n.t('locations:add.full', { count: max })}
          </Typography> :
          <>
            <TextField
              value={q}
              onChange={(event) => {
                setQ(event.target.value);
              }}
              onKeyDown={onKeyDown}
              placeholder={i18n.t('locations:add.search')}
              size="small"
              fullWidth
              autoFocus
              slotProps={{
                htmlInput: {
                  'aria-label': i18n.t('locations:add.search'),
                },
              }}
            />
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, mt: 1 }}>
              <Chip
                icon={<NearMeIcon />}
                label={i18n.t('composer:locations.nearMe')}
                size="small"
                color={nearFrom === 'me' ? 'primary' : 'default'}
                variant={nearFrom === 'me' ? 'filled' : 'outlined'}
                onClick={askNear}
                disabled={asking}
              />
              {nearFrom === 'photo' &&
                <Chip
                  icon={<PhotoIcon />}
                  label={i18n.t('composer:locations.nearPhoto')}
                  size="small"
                  color="primary"
                  onDelete={() => {
                    setNear(null);
                    setNearFrom('');
                  }}
                />}
            </Stack>
          </>}
      </Box>
      {!full &&
        <>
          {isFetching && <LinearProgress />}
          {hint &&
            <Typography variant="body2" color="textSecondary" sx={{ px: 2, pb: 1 }}>
              {hint}
            </Typography>}
          {photoPoint && !nearFrom &&
            <List dense sx={{ pt: 0 }}>
              <ListItemButton
                onClick={() => {
                  setNearFrom('photo');
                  setNear(photoPoint);
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <PhotoIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={i18n.t('composer:locations.photoSuggest')} />
              </ListItemButton>
            </List>}
          {rows > 0 &&
            <List dense sx={{ pt: 0 }}>
              {results.map((location, index) => {
                const already = isChosen(location);
                return (
                  <ListItemButton
                    key={location.id}
                    selected={index === active}
                    disabled={already}
                    onClick={() => {
                      pick(location);
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {already ? <CheckIcon fontSize="small" /> : <LocationIcon fontSize="small" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={location.name}
                      secondary={location.city || null}
                    />
                  </ListItemButton>
                );
              })}
              {offerAdd &&
                <ListItemButton
                  selected={active === results.length}
                  onClick={() => {
                    setAdding(true);
                    setOpen(false);
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <AddIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={i18n.t('composer:locations.addNew', { name: keyword })} />
                </ListItemButton>}
            </List>}
        </>}
    </>
  );

  return (
    <>
      {row &&
        <DetailRow
          ref={buttonRef}
          icon={<LocationIcon />}
          // What is chosen is in chips under the row, where each can be
          // taken off.
          label={i18n.t('composer:details.location')}
          aria-haspopup="dialog"
          disabled={disabled}
          onClick={() => {
            setOpen(true);
          }}
        />}
      {!row &&
      <Tooltip title={i18n.t('composer:locations.add')}>
        <span>
          <IconButton
            ref={buttonRef}
            aria-label={i18n.t('composer:locations.add')}
            disabled={disabled}
            onClick={() => {
              setOpen(true);
            }}
          >
            <LocationIcon />
          </IconButton>
        </span>
      </Tooltip>}
      {/* On a phone, from the Details page, a page of its own, with the
          whole screen for the search and its results (roadmap row 114);
          back returns to Details. Elsewhere, a popover by its button. */}
      {row && phone ?
        <Dialog
          open={open}
          onClose={close}
          fullScreen
          aria-labelledby="composer-location-pick-title"
        >
          <DialogTitle
            id="composer-location-pick-title"
            sx={{
              display: 'flex', alignItems: 'center', gap: 1, px: 1,
            }}
          >
            <IconButton onClick={close} aria-label={i18n.t('composer:details.back')}>
              <BackIcon />
            </IconButton>
            {i18n.t('composer:locations.add')}
          </DialogTitle>
          {panel}
        </Dialog> :
        <Popover
          open={open}
          anchorEl={buttonRef.current}
          onClose={close}
          anchorOrigin={row ?
            { vertical: 'bottom', horizontal: 'left' } :
            { vertical: 'top', horizontal: 'left' }}
          transformOrigin={row ?
            { vertical: 'top', horizontal: 'left' } :
            { vertical: 'bottom', horizontal: 'left' }}
          slotProps={{
            paper: {
              sx: { width: phone ? 'calc(100vw - 32px)' : 360, maxWidth: 360 },
            },
          }}
        >
          {panel}
        </Popover>}
      {/* A new location, with the name searched for; it comes back here
          to be chosen. The same form as the Add locations dialog. */}
      <Dialog
        open={adding}
        onClose={() => {
          setAdding(false);
        }}
        maxWidth="sm"
        fullWidth
        fullScreen={phone}
        aria-labelledby="composer-location-add-title"
        slotProps={{ paper: { sx: phone ? {} : { height: 'min(640px, calc(100% - 64px))' } } }}
      >
        <DialogTitle
          id="composer-location-add-title"
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <span style={{ flexGrow: 1 }}>
            {i18n.t('composer:locations.addTitle')}
          </span>
          <IconButton
            onClick={() => {
              setAdding(false);
            }}
            aria-label={i18n.t('actions:close')}
            edge="end"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        {adding &&
          <AddLocation
            name={keyword}
            near={near}
            startPoint={nearFrom === 'photo' ? near : null}
            callback={(location) => {
              setAdding(false);
              setQ('');
              if (location && location.id) {
                onPick(location);
              }
            }}
          />}
      </Dialog>
    </>
  );
};

LocationPicker.propTypes = {
  // The locations chosen so far.
  chosen: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
  })).isRequired,
  onPick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  // Where a photo of the post was taken, offered for a search near it.
  photoPoint: PropTypes.shape({
    latitude: PropTypes.number,
    longitude: PropTypes.number,
  }),
  // A row of a post's Details page, in place of the pin.
  row: PropTypes.bool,
};

export default LocationPicker;
