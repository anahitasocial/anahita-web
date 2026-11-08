import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from 'tss-react/mui';

import InfiniteScroll from 'react-infinite-scroll-component';

import actions from '../../../actions';
import NodeType from '../../../proptypes/Node';

import ActorCard from '../../../components/ActorCard';
import Masonry from '../../../components/BreakpointMasonry';
import MediumNode from '../../nodes/MediumNode';
import Progress from '../../../components/Progress';
import { App as APP } from '../../../constants';

import useBrowse from '../../browse/useBrowse';
import utils from '../../../utils/node';

const {
  SORTING: {
    TOP,
    RECENT,
  },
} = APP.BROWSE;

// Counted against the total, as the server says how many there are.
const select = (state) => {
  const {
    inbounds: items, error, total, isFetching,
  } = state.inbounds;
  return {
    items, error, total, isFetching,
  };
};

const useStyles = makeStyles()((theme) => {
  return {
    card: {
      marginBottom: theme.spacing(2),
    },
  };
});

// The posts and profiles tagged with a hashtag or a location: the list
// through useBrowse, drawn as cards in a masonry. The page gives each sort
// its own list.
const InboundsBrowse = ({
  tag,
  queryFilters: {
    sort = TOP,
  },
}) => {
  const { classes } = useStyles();

  const list = useMemo(() => {
    const tagged = actions.inbounds(tag);
    return {
      browse: tagged.browse,
      reset: tagged.reset,
    };
  }, [tag.id]);

  const { items, hasMore, next } = useBrowse({
    ...list,
    select,
    params: { tag, sort },
    queryKey: `${tag.id}|${sort}`,
  });

  return (
    <InfiniteScroll
      dataLength={items.allIds.length}
      next={next}
      hasMore={hasMore}
      loader={
        <Progress key="items-progress" />
      }
    >
      <Masonry>
        {items.allIds.map((itemId) => {
          const node = items.byId[itemId];
          const key = `node_${node.id}`;
          return (
            <div key={key} className={classes.card}>
              {utils.isActor(node) &&
                <ActorCard actor={node} />}
              {utils.isMedium(node) &&
                <MediumNode medium={node} />}
            </div>
          );
        })}
      </Masonry>
    </InfiniteScroll>
  );
};

InboundsBrowse.propTypes = {
  tag: NodeType.isRequired,
  queryFilters: PropTypes.shape({
    sort: PropTypes.oneOf([TOP, RECENT]),
    q: PropTypes.string,
  }),
};

export default InboundsBrowse;
