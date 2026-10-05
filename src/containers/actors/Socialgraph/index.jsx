import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { makeStyles } from 'tss-react/mui';

import InfiniteScroll from 'react-infinite-scroll-component';

import SignInPrompt from '../../../components/SignInPrompt';
import visitor from '../../../utils/visitor';
import actions from '../../../actions';

import ActorType from '../../../proptypes/Actor';
import ActorsType from '../../../proptypes/Actors';
import ActorsCard from './Card';
import Masonry from '../../../components/BreakpointMasonry';
import Progress from '../../../components/Progress';
import { App as APP } from '../../../constants';

const { LIMIT } = APP.BROWSE;

const useStyles = makeStyles()((theme) => {
  return {
    card: {
      marginBottom: theme.spacing(2),
    },
  };
});

const ActorsSocialgraph = ({
  browseList,
  resetList,
  items,
  actorNode,
  total = 0,
  filter,
  queryFilters = {
    q: '',
  },
  heldBack = false,
}) => {
  const { classes } = useStyles();
  const { q = '' } = queryFilters;
  const [start, setStart] = useState(0);

  useEffect(() => {
    return () => {
      resetList();
    };
  }, []);

  useEffect(() => {
    // Not asked for when the answer is known to be no: who follows whom
    // is held back from a visitor on a preview site.
    if (heldBack) {
      return;
    }

    Promise.resolve(browseList({
      q,
      filter,
      actor: actorNode,
      start,
      limit: LIMIT,
      ...queryFilters,
    })).catch(() => {
      // The failure is in the store. Uncaught, the browser shows it raw.
    });
  }, [q, filter, start, heldBack]);

  const fetchList = () => {
    return setStart(start + LIMIT);
  };

  const hasMore = total > items.allIds.length;

  // Where the list would be, a way to it. The counts on the profile are
  // still shown; it is the names that need signing in.
  if (heldBack) {
    return <SignInPrompt what="followers" />;
  }

  return (
    <InfiniteScroll
      dataLength={items.allIds.length}
      next={fetchList}
      hasMore={hasMore}
      loader={
        <Progress key="items-progress" />
        }
    >
      <Masonry>
        {items.allIds.map((itemId) => {
          const follower = items.byId[itemId];
          const key = `socialgraph_node_${follower.id}`;
          return (
            <div
              className={classes.card}
              key={key}
            >
              <ActorsCard leader={actorNode} actor={follower} />
            </div>
          );
        })}
      </Masonry>
    </InfiniteScroll>
  );
};

ActorsSocialgraph.propTypes = {
  items: ActorsType.isRequired,
  actorNode: ActorType.isRequired,
  browseList: PropTypes.func.isRequired,
  resetList: PropTypes.func.isRequired,
  filter: PropTypes.oneOf([
    'followers',
    'leaders',
    'mutuals',
    'blocks',
  ]).isRequired,
  queryFilters: PropTypes.object,
  // The list is not shown to this viewer: a visitor on a site that shows
  // visitors only the start of things.
  heldBack: PropTypes.bool,
  total: PropTypes.number,
};

const mapStateToProps = () => {
  return (state) => {
    const {
      actors: items,
      error,
      total,
    } = state.socialgraph;

    const {
      viewer,
    } = state.session;

    return {
      items,
      error,
      total,
      viewer,
      heldBack: visitor.isPreviewVisitor(state),
    };
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    browseList: (params) => {
      return dispatch(actions.socialgraph.browse(params));
    },
    resetList: () => {
      return dispatch(actions.socialgraph.reset());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ActorsSocialgraph);
