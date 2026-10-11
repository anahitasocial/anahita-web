import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import PinIcon from '@mui/icons-material/AddHomeOutlined';
import UnpinIcon from '@mui/icons-material/HomeOutlined';

import { ShareButton } from '../controls/Share';
import CustomFeedCard from '../../components/CustomFeedCard';
import Masonry from '../../components/BreakpointMasonry';
import Progress from '../../components/Progress';
import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';
import customFeeds from '../../utils/customFeeds';

const LIMIT = 20;
const WAIT = 300;

// Discover: the feeds other people have shared, newest first, to add to the
// home page. Kept apart from the viewer's own feeds, since it is the list
// that grows.
//
// The server sends only feeds the viewer may see: public ones, ones for
// anyone signed in, and ones for the followers of somebody they follow. A
// feed added from here shows its reader what they could see anyway. The
// list can be narrowed by part of a feed's name, of what it is for, or of
// its owner's name.
//
// This is the Feeds tab of the site's search: given `query`, it lists what
// matches and has no field of its own. The feeds are drawn as cards in the
// columns the other search results are in.
//
// With `max`, it is the few that lead the All tab: that many at most, no
// more as the reader scrolls, nothing at all when none match, and a button
// to the rest (`onMore`) when there are more.
const CustomFeedsDiscover = ({
  query = null,
  max = 0,
  onMore = null,
  alertSuccess,
  alertError,
}) => {
  const [feeds, setFeeds] = useState([]);
  const [typed, setTyped] = useState('');
  const search = query === null ? typed : query;
  const [hasMore, setHasMore] = useState(true);
  const [hasFailed, setHasFailed] = useState(false);
  const [waiting, setWaiting] = useState(false);
  // Where the next page starts, as the server counts it, and which reading
  // of the list is the latest, so one that answers late is not shown.
  const nextStart = useRef(0);
  const asked = useRef(0);

  const load = (q, fromStart) => {
    asked.current += fromStart ? 1 : 0;
    const mine = asked.current;
    const start = fromStart ? 0 : nextStart.current;

    api.customFeeds.discover({ q, start, limit: max || LIMIT }).then((result) => {
      if (mine !== asked.current) {
        return;
      }

      const page = result.data.data || [];
      const pagination = result.data.pagination || {};

      nextStart.current = pagination.nextStart || 0;
      setHasMore(Boolean(pagination.hasMore));
      setHasFailed(false);
      setFeeds((before) => {
        const known = {};
        (fromStart ? [] : before).forEach((feed) => {
          known[feed.id] = true;
        });

        return fromStart ? page : [...before, ...page.filter((feed) => {
          return !known[feed.id];
        })];
      });
    }).catch(() => {
      if (mine === asked.current) {
        setHasFailed(true);
        setHasMore(false);
      }
    });
  };

  // Begun again a moment after the typing stops.
  useEffect(() => {
    const timer = setTimeout(() => {
      load(search.trim(), true);
    }, search ? WAIT : 0);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  const handlePin = (feed) => {
    const isPinned = !feed.isPinned;

    setWaiting(true);
    api.customFeeds.setPinned(feed, isPinned).then(() => {
      alertSuccess(i18n.t(isPinned ? 'customFeeds:prompts.pinned' : 'customFeeds:prompts.unpinned'));
      setFeeds((before) => {
        return before.map((each) => {
          return each.id === feed.id ? { ...each, isPinned } : each;
        });
      });
    }).catch((response) => {
      const data = (response.response && response.response.data) || {};
      const reason = data.error || '';

      alertError(i18n.t(i18n.exists(`customFeeds:form.errors.${reason}`) ?
        `customFeeds:form.errors.${reason}` :
        'customFeeds:prompts.failed'));
    }).finally(() => {
      setWaiting(false);
    });
  };

  const isShort = max > 0;

  // The few on the All tab: there only when something matches.
  if (isShort && feeds.length === 0) {
    return null;
  }

  return (
    <>
      {isShort &&
        <Typography variant="subtitle1" component="h2" sx={{ px: 2, pb: 1 }}>
          {i18n.t('customFeeds:discover.heading')}
        </Typography>}
      {query === null &&
        <TextField
          fullWidth
          type="search"
          label={i18n.t('customFeeds:discover.search')}
          value={typed}
          onChange={(event) => {
            setTyped(event.target.value);
          }}
          slotProps={{ htmlInput: { maxLength: 100 } }}
          sx={{ mb: 2 }}
        />}
      {hasFailed &&
        <Typography variant="body2" color="error" role="alert" sx={{ p: 2 }}>
          {i18n.t('customFeeds:list.loadFailed')}
        </Typography>}
      {!hasFailed && !hasMore && feeds.length === 0 &&
        <Typography variant="body1" color="textSecondary" sx={{ p: 2 }}>
          {i18n.t(search.trim() ? 'customFeeds:discover.noMatch' : 'customFeeds:discover.empty')}
        </Typography>}
      <InfiniteScroll
        dataLength={feeds.length}
        next={() => {
          load(search.trim(), false);
        }}
        hasMore={hasMore && !isShort}
        loader={<Progress key="discover-progress" />}
      >
        <Masonry>
          {feeds.map((feed) => {
            const canPin = Boolean(feed.authorized && feed.authorized.pin);

            return (
              <Box key={`discover-feed-${feed.id}`} sx={{ mb: 2 }}>
                <CustomFeedCard
                  feed={feed}
                  headerAction={<ShareButton what={customFeeds.toShare(feed)} />}
                  action={canPin &&
                    <Button
                      fullWidth
                      variant={feed.isPinned ? 'outlined' : 'contained'}
                      startIcon={feed.isPinned ? <UnpinIcon /> : <PinIcon />}
                      disabled={waiting}
                      onClick={() => {
                        handlePin(feed);
                      }}
                    >
                      {i18n.t(feed.isPinned ? 'customFeeds:actions.unpin' : 'customFeeds:actions.pin')}
                    </Button>}
                />
              </Box>
            );
          })}
        </Masonry>
      </InfiniteScroll>
      {isShort && hasMore && onMore &&
        <Button onClick={onMore} sx={{ mx: 1, mb: 2 }}>
          {i18n.t('customFeeds:discover.more')}
        </Button>}
    </>
  );
};

CustomFeedsDiscover.propTypes = {
  // What to look for, when whoever draws this has the field for it.
  query: PropTypes.string,
  // How many to show at most, when it is a few above other results.
  max: PropTypes.number,
  // Asked for the rest of them.
  onMore: PropTypes.func,
  alertSuccess: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => {
  return {
    alertSuccess: (message) => {
      return dispatch(actions.app.alert.success(message));
    },
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
};

export default connect(null, mapDispatchToProps)(CustomFeedsDiscover);
