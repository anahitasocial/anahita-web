import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';

import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import PinIcon from '@mui/icons-material/AddHomeOutlined';
import UnpinIcon from '@mui/icons-material/Home';

import CopyFeedLink from './CopyLink';
import CustomFeedIcon from '../../components/CustomFeedIcon';
import Progress from '../../components/Progress';
import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';
import customFeeds from '../../utils/customFeeds';
import utils from '../../utils';

const { getActorName } = utils.node;

const LIMIT = 20;
const WAIT = 300;

// Discover: the feeds other people have shared, newest first, to add to the
// home page. Kept apart from the viewer's own feeds, since it is the list
// that grows.
//
// The server sends only feeds the viewer may see: public ones, ones for
// anyone signed in, and ones for the followers of somebody they follow. A
// feed added from here shows its reader what they could see anyway. The
// list can be narrowed by part of a name.
const CustomFeedsDiscover = ({
  alertSuccess,
  alertError,
}) => {
  const [feeds, setFeeds] = useState([]);
  const [search, setSearch] = useState('');
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

    api.customFeeds.discover({ q, start, limit: LIMIT }).then((result) => {
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

  return (
    <>
      <TextField
        fullWidth
        type="search"
        label={i18n.t('customFeeds:discover.search')}
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
        }}
        slotProps={{ htmlInput: { maxLength: 100 } }}
        sx={{ mb: 2 }}
      />
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
        hasMore={hasMore}
        loader={<Progress key="discover-progress" />}
      >
        {feeds.map((feed) => {
          const pinLabel = i18n.t(feed.isPinned ? 'customFeeds:actions.unpin' : 'customFeeds:actions.pin');

          return (
            <Card key={`discover-feed-${feed.id}`} sx={{ mb: 2 }}>
              <CardHeader
                avatar={
                  <Avatar>
                    <CustomFeedIcon name={feed.icon} />
                  </Avatar>
                }
                title={
                  <Link
                    component={RouterLink}
                    to={customFeeds.urlOf(feed)}
                    underline="hover"
                    color="inherit"
                  >
                    {feed.name}
                  </Link>
                }
                subheader={
                  <>
                    <Typography variant="body2" color="textSecondary" component="span" sx={{ display: 'block' }}>
                      {i18n.t('customFeeds:list.by', { name: getActorName(feed.owner || {}) })}
                    </Typography>
                    {feed.body &&
                      <Typography variant="body2" color="textPrimary" component="span" sx={{ display: 'block' }}>
                        {feed.body}
                      </Typography>}
                    <Typography variant="body2" color="textSecondary" component="span" sx={{ display: 'block' }}>
                      {customFeeds.summary(feed.definition, i18n.t.bind(i18n), {
                        isOwn: Boolean(feed.authorized && feed.authorized.edit),
                      })}
                    </Typography>
                  </>
                }
                action={
                  <Stack direction="row">
                    <CopyFeedLink feed={feed} />
                    {feed.authorized && feed.authorized.pin &&
                      <Tooltip title={pinLabel}>
                        <span>
                          <IconButton
                            color={feed.isPinned ? 'primary' : 'default'}
                            aria-label={pinLabel}
                            aria-pressed={feed.isPinned}
                            disabled={waiting}
                            onClick={() => {
                              handlePin(feed);
                            }}
                          >
                            {feed.isPinned ? <UnpinIcon /> : <PinIcon />}
                          </IconButton>
                        </span>
                      </Tooltip>}
                  </Stack>
                }
                slotProps={{ title: { variant: 'h6', component: 'h3' } }}
              />
            </Card>
          );
        })}
      </InfiniteScroll>
    </>
  );
};

CustomFeedsDiscover.propTypes = {
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
