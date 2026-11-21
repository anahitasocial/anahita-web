import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';

import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import SearchWeightsDialog from './WeightsDialog';
import { Search as SEARCH } from '../../../constants';
import i18n from '../../../languages';
import searchAddress from '../../../utils/searchAddress';

const { SORTING } = SEARCH;

const marks = [25, 50, 75, 100].map((radius) => {
  return { value: radius, label: i18n.t('search:km', { radius }) };
}).concat([{ value: searchAddress.ANYWHERE, label: <AllInclusiveIcon fontSize="small" /> }]);

// Everything a search may be set to besides its words and its tab, in one
// dialog that the bar's one button opens (roadmap row 164): on a mobile they
// took a third of the screen above the results. Full screen on a mobile. What
// is changed here is the search only on Done; Cancel leaves it as it was.
// "Adjust" is a step of its own, the weights (WeightsDialog), in this
// dialog's place, and back to it after.
const SearchOptionsDialog = ({
  open,
  signedIn,
  sort,
  km,
  choices,
  onDone,
  onCancel,
  onWeighed,
}) => {
  const mobile = useMediaQuery((theme) => { return theme.breakpoints.down('sm'); });

  // What is being chosen, from what the search is set to each time the
  // dialog opens.
  const [draft, setDraft] = useState({ sort, km, ...choices });
  useEffect(() => {
    if (open) {
      setDraft({ sort, km, ...choices });
    }
  }, [open]);
  const [isWeighing, setIsWeighing] = useState(false);

  const relevant = draft.sort === SORTING.RELEVANT;

  return (
    <>
      <Dialog
        open={open && !isWeighing}
        onClose={onCancel}
        fullScreen={mobile}
        fullWidth
        maxWidth="xs"
        aria-labelledby="search-options-title"
      >
        <DialogTitle id="search-options-title">
          {i18n.t('search:options.title')}
        </DialogTitle>
        <DialogContent dividers>
          <FormControl component="fieldset" sx={{ display: 'block' }}>
            <FormLabel component="legend">
              <Typography variant="caption" color="textSecondary">
                {i18n.t('search:sort')}
              </Typography>
            </FormLabel>
            <RadioGroup
              value={draft.sort}
              onChange={(event) => {
                setDraft({ ...draft, sort: event.target.value });
              }}
            >
              {[SORTING.RELEVANT, SORTING.RECENT].map((value) => {
                return (
                  <FormControlLabel
                    key={value}
                    value={value}
                    control={<Radio />}
                    label={i18n.t(`search:sortOptions.${value === SORTING.RELEVANT ? 'relevant' : 'recent'}`)}
                  />
                );
              })}
            </RadioGroup>
          </FormControl>
          {/* The searcher's own choices for "Most relevant", for somebody
              signed in: a visitor follows nobody, and has nowhere to keep
              them. */}
          {relevant && signedIn &&
            <List disablePadding sx={{ mt: 1 }}>
              {['followedFirst', 'recentFirst'].map((which) => {
                const labelId = `search-option-${which}`;
                return (
                  <ListItem
                    key={which}
                    disableGutters
                    secondaryAction={
                      <Switch
                        edge="end"
                        checked={Boolean(draft[which])}
                        onChange={(event) => {
                          setDraft({ ...draft, [which]: event.target.checked });
                        }}
                        slotProps={{ input: { 'aria-labelledby': labelId } }}
                      />
                    }
                  >
                    <ListItemText
                      id={labelId}
                      primary={i18n.t(`search:choices.${which}`)}
                      secondary={i18n.t(`search:choices.${which}Help`)}
                      slotProps={{ primary: { variant: 'body2' }, secondary: { variant: 'caption' } }}
                      sx={{ pr: 2 }}
                    />
                  </ListItem>
                );
              })}
              <ListItemButton
                disableGutters
                aria-haspopup="dialog"
                onClick={() => {
                  setIsWeighing(true);
                }}
              >
                <ListItemText
                  primary={i18n.t('search:weights.open')}
                  secondary={i18n.t('search:weights.openHelp')}
                  slotProps={{ primary: { variant: 'body2' }, secondary: { variant: 'caption' } }}
                  sx={{ pr: 2 }}
                />
                <ChevronRightIcon color="action" />
              </ListItemButton>
            </List>}
          {/* Padded so that the marks at the slider's ends are not cut
              off. */}
          <Box sx={{ mt: 2 }}>
            <Typography
              id="search-range-label"
              variant="caption"
              color="textSecondary"
              component="div"
            >
              {i18n.t('search:distanceLabel')}
            </Typography>
            <Box sx={{ px: 2 }}>
              <Slider
                value={draft.km}
                getAriaValueText={(value) => {
                  return value === searchAddress.ANYWHERE ?
                    i18n.t('search:anywhere') :
                    i18n.t('search:within', { radius: value });
                }}
                onChange={(event, value) => {
                  setDraft({ ...draft, km: value });
                }}
                aria-labelledby="search-range-label"
                min={25}
                max={searchAddress.ANYWHERE}
                step={25}
                marks={marks}
                size="small"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button fullWidth onClick={onCancel}>
            {i18n.t('search:options.cancel')}
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              onDone({
                sort: draft.sort,
                km: draft.km,
                choices: {
                  followedFirst: Boolean(draft.followedFirst),
                  recentFirst: Boolean(draft.recentFirst),
                },
              });
            }}
          >
            {i18n.t('search:options.done')}
          </Button>
        </DialogActions>
      </Dialog>
      {open && isWeighing &&
        <SearchWeightsDialog
          onClose={() => {
            setIsWeighing(false);
          }}
          onSaved={() => {
            setIsWeighing(false);
            onWeighed();
          }}
        />}
    </>
  );
};

SearchOptionsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  // Somebody signed in, who has choices of their own for "Most relevant".
  signedIn: PropTypes.bool.isRequired,
  sort: PropTypes.string.isRequired,
  km: PropTypes.number.isRequired,
  choices: PropTypes.shape({
    followedFirst: PropTypes.bool,
    recentFirst: PropTypes.bool,
  }).isRequired,
  // Done: { sort, km, choices }, the search as it is to be.
  onDone: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  // The weights saved: the results are read again.
  onWeighed: PropTypes.func.isRequired,
};

export default SearchOptionsDialog;
