import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

import ListItem from './ListItem';
import LocationsType from '../../../proptypes/Locations';
import NodeType from '../../../proptypes/Node';
import ControlAdd from '../../controls/tags/location/Add';
import Progress from '../../../components/Progress';
import i18n from '../../../languages';

import actions from '../../../actions';
import { App as APP } from '../../../constants';

const { LIMIT } = APP.BROWSE;

const SCROLL_ID = 'locations-add-scroll';

// The search tab: the field stays where it is, and only the results under it
// scroll, a page at a time. A search that finds nothing says so in the list
// and offers to add the place, rather than switching tabs while somebody is
// still typing.
const LocationsList = ({
  browseList,
  resetList,
  keyword,
  onKeywordChange,
  onCreate,
  items,
  hasMore,
  node,
  queryFilters = {
    nearby_latitude: 0,
    nearby_longitude: 0,
  },
  handleClose,
  isFetching,
  selectedLocations = [],
  onChange = null,
}) => {
  const [debouncedKeyword, setDebouncedKeyword] = useState(keyword);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [keyword]);

  const fetchFrom = (start) => {
    browseList({
      start,
      limit: LIMIT,
      q: debouncedKeyword,
      ...queryFilters,
    });
  };

  useEffect(() => {
    resetList();
    fetchFrom(0);

    return () => {
      resetList();
    };
  }, [node.id, debouncedKeyword]);

  const selectedLocationIds = selectedLocations.map((location) => {
    return location.id;
  });

  const count = items.allIds.length;
  const searched = debouncedKeyword !== '';
  const settled = !isFetching && keyword.trim() === debouncedKeyword;

  return (
    <>
      <Box sx={{ px: 3, pt: 2, pb: 1 }}>
        <TextField
          name="keyword"
          value={keyword}
          onChange={(event) => {
            onKeywordChange(event.target.value);
          }}
          variant="outlined"
          placeholder={i18n.t('locations:add.search')}
          fullWidth
          autoFocus
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
            htmlInput: {
              'aria-label': i18n.t('locations:add.search'),
            },
          }}
        />
      </Box>
      <DialogContent id={SCROLL_ID} sx={{ p: 0 }}>
        {count === 0 && settled &&
          <Box sx={{ px: 3, py: 2 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              {searched ?
                i18n.t('locations:add.noneFound', { name: debouncedKeyword }) :
                i18n.t('locations:add.noneNearby')}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={onCreate}
              fullWidth
            >
              {searched ?
                i18n.t('locations:add.create', { name: debouncedKeyword }) :
                i18n.t('actions:add')}
            </Button>
          </Box>}
        {count === 0 && !settled && <Progress />}
        {count > 0 &&
          <InfiniteScroll
            dataLength={count}
            next={() => {
              fetchFrom(count);
            }}
            hasMore={hasMore}
            loader={<Progress key="locations-add-progress" />}
            scrollableTarget={SCROLL_ID}
          >
            <List disablePadding>
              {items.allIds.map((itemId) => {
                const location = items.byId[itemId];
                const showAction = !selectedLocationIds.includes(location.id);
                return (
                  <ListItem
                    key={`location-graph-list-item-${itemId}`}
                    location={location}
                    actions={showAction &&
                      <ControlAdd
                        tag={location}
                        node={node}
                        callback={() => {
                          if (onChange) {
                            onChange();
                          }
                          handleClose();
                        }}
                      />}
                  />
                );
              })}
            </List>
          </InfiniteScroll>}
      </DialogContent>
    </>
  );
};

LocationsList.propTypes = {
  browseList: PropTypes.func.isRequired,
  resetList: PropTypes.func.isRequired,
  keyword: PropTypes.string.isRequired,
  onKeywordChange: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  queryFilters: PropTypes.object,
  items: LocationsType.isRequired,
  hasMore: PropTypes.bool.isRequired,
  node: NodeType.isRequired,
  isFetching: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  selectedLocations: PropTypes.arrayOf(NodeType),
  onChange: PropTypes.func,
};

const mapStateToProps = (state) => {
  const {
    locations: items,
    isFetching,
    hasMore,
  } = state.locations;

  return {
    items,
    isFetching,
    hasMore,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    browseList: (params) => {
      return dispatch(actions.locations.browse(params));
    },
    resetList: () => {
      return dispatch(actions.locations.reset());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(LocationsList);
