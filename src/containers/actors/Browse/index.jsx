import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { makeStyles } from 'tss-react/mui';

import InfiniteScroll from 'react-infinite-scroll-component';

import actions from '../../../actions';

import ActorsCard from './Card';
import Masonry from '../../../components/BreakpointMasonry';
import Progress from '../../../components/Progress';
import useBrowse from '../../browse/useBrowse';

const DEFAULT_FILTERS = {
  q: '',
  disabled: false,
  oid: 0,
  filter: '',
};

const useStyles = makeStyles()((theme) => {
  return {
    card: {
      marginBottom: theme.spacing(2),
    },
  };
});

// People, groups or events, by `namespace`: the list through useBrowse, kept
// to what the filters ask for, drawn as cards in a masonry. No alert on an
// error, as before.
const ActorsBrowse = ({ namespace, queryFilters = DEFAULT_FILTERS }) => {
  const { classes } = useStyles();
  const viewer = useSelector((state) => { return state.session.viewer; });

  const {
    q = '',
    disabled = false,
    oid = 0,
    filter = '',
  } = queryFilters;

  const list = useMemo(() => {
    return {
      browse: actions[namespace].browse,
      reset: actions[namespace].reset,
      select: (state) => {
        const { total, isFetching } = state[namespace];
        return { items: state[namespace][namespace], total, isFetching };
      },
    };
  }, [namespace]);

  const { items, hasMore, next } = useBrowse({
    ...list,
    params: {
      q, disabled, oid, filter,
    },
    queryKey: `${namespace}|${q}|${disabled}|${oid}|${filter}`,
  });

  return (
    <InfiniteScroll
      dataLength={items.allIds.length}
      next={next}
      hasMore={hasMore}
      loader={
        <Progress key={`${namespace}-progress`} />
        }
    >
      <Masonry>
        {items.allIds.map((itemId) => {
          const node = items.byId[itemId];
          const key = `${namespace}_node_list_item_${node.id}`;
          return (
            <div
              className={classes.card}
              key={key}
            >
              <ActorsCard actor={node} viewer={viewer} />
            </div>
          );
        })}
      </Masonry>
    </InfiniteScroll>
  );
};

ActorsBrowse.propTypes = {
  namespace: PropTypes.string.isRequired,
  queryFilters: PropTypes.object,
};

// One component for each namespace, made once: callers ask for it while
// drawing, and a new component each time would empty and read the list again
// on every unrelated redraw of the page.
const byNamespace = {};

export default (namespace) => {
  if (!byNamespace[namespace]) {
    const ForNamespace = (props) => {
      return <ActorsBrowse {...props} namespace={namespace} />;
    };
    byNamespace[namespace] = ForNamespace;
  }

  return byNamespace[namespace];
};
