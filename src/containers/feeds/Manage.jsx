import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import DownIcon from '@mui/icons-material/ArrowDownward';
import EditIcon from '@mui/icons-material/EditOutlined';
import FeedIcon from '@mui/icons-material/DynamicFeedOutlined';
import PinIcon from '@mui/icons-material/AddHomeOutlined';
import UnpinIcon from '@mui/icons-material/Home';
import UpIcon from '@mui/icons-material/ArrowUpward';

import CopyFeedLink from './CopyLink';
import BrowseHeader from '../../components/BrowseHeader';
import DialogConfirm from '../../components/DialogConfirm';
import Progress from '../../components/Progress';
import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';
import customFeeds from '../../utils/customFeeds';
import utils from '../../utils';

const { getActorName } = utils.node;

// Custom feeds: the ones the viewer made, and the ones of other people's
// they keep on their home page.
//
// A feed on the home page has a filled house; pressing it takes it off, and
// the arrows move it among the tabs there. Making, changing and deleting a
// feed are on its own pages.
const CustomFeedsManage = ({
  viewer,
  alertSuccess,
  alertError,
}) => {
  const [mine, setMine] = useState([]);
  const [pinned, setPinned] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFailed, setHasFailed] = useState(false);
  const [waiting, setWaiting] = useState(false);

  const load = () => {
    return Promise.all([api.customFeeds.mine(), api.customFeeds.pinned()]).then(([made, kept]) => {
      setMine(made.data.data || []);
      setPinned(kept.data.data || []);
      setHasFailed(false);
    }).catch(() => {
      setHasFailed(true);
    }).finally(() => {
      setIsLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const failed = (response) => {
    const data = (response.response && response.response.data) || {};
    const reason = data.error || '';

    alertError(i18n.t(i18n.exists(`customFeeds:form.errors.${reason}`) ?
      `customFeeds:form.errors.${reason}` :
      'customFeeds:prompts.failed'));
  };

  const pinnedIds = pinned.map((feed) => {
    return feed.id;
  });

  const handlePin = (feed, isPinned) => {
    setWaiting(true);
    api.customFeeds.setPinned(feed, isPinned).then(() => {
      alertSuccess(i18n.t(isPinned ? 'customFeeds:prompts.pinned' : 'customFeeds:prompts.unpinned'));
      return load();
    }).catch(failed).finally(() => {
      setWaiting(false);
    });
  };

  const handleDelete = (feed) => {
    setWaiting(true);
    api.customFeeds.remove(feed).then(() => {
      alertSuccess(i18n.t('customFeeds:prompts.deleted'));
      return load();
    }).catch(failed).finally(() => {
      setWaiting(false);
    });
  };

  // Moves a feed one place among the tabs of the home page.
  const handleMove = (feed, by) => {
    const from = pinnedIds.indexOf(feed.id);
    const to = from + by;

    if (from < 0 || to < 0 || to >= pinnedIds.length) {
      return;
    }

    const ids = [...pinnedIds];
    ids.splice(from, 1);
    ids.splice(to, 0, feed.id);

    setWaiting(true);
    api.customFeeds.setPins(ids).then((result) => {
      setPinned(result.data.data || []);
    }).catch(failed).finally(() => {
      setWaiting(false);
    });
  };

  const row = (feed) => {
    const place = pinnedIds.indexOf(feed.id);
    const isPinned = place >= 0;
    const isOwn = Boolean(feed.owner) && feed.owner.id === viewer.id;

    return (
      <Card key={`custom-feed-${feed.id}`} sx={{ mb: 2 }}>
        <CardHeader
          title={
            <Link component={RouterLink} to={customFeeds.urlOf(feed)} underline="hover" color="inherit">
              {feed.name}
            </Link>
          }
          subheader={
            <>
              <Typography variant="body2" color="textSecondary" component="span" sx={{ display: 'block' }}>
                {isOwn ?
                  i18n.t(`customFeeds:access.${feed.access}`) :
                  i18n.t('customFeeds:list.by', { name: getActorName(feed.owner || {}) })}
              </Typography>
              <Typography variant="body2" color="textSecondary" component="span" sx={{ display: 'block' }}>
                {customFeeds.summary(feed.definition, i18n.t.bind(i18n), { isOwn })}
              </Typography>
            </>
          }
          action={
            <Stack direction="row">
              {isPinned &&
                <>
                  <Tooltip title={i18n.t('customFeeds:actions.moveUp')}>
                    <span>
                      <IconButton
                        aria-label={i18n.t('customFeeds:actions.moveUp')}
                        disabled={waiting || place === 0}
                        onClick={() => {
                          handleMove(feed, -1);
                        }}
                      >
                        <UpIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={i18n.t('customFeeds:actions.moveDown')}>
                    <span>
                      <IconButton
                        aria-label={i18n.t('customFeeds:actions.moveDown')}
                        disabled={waiting || place === pinnedIds.length - 1}
                        onClick={() => {
                          handleMove(feed, 1);
                        }}
                      >
                        <DownIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </>}
              <Tooltip title={i18n.t(isPinned ? 'customFeeds:actions.unpin' : 'customFeeds:actions.pin')}>
                <span>
                  <IconButton
                    color={isPinned ? 'primary' : 'default'}
                    aria-label={i18n.t(isPinned ? 'customFeeds:actions.unpin' : 'customFeeds:actions.pin')}
                    aria-pressed={isPinned}
                    disabled={waiting}
                    onClick={() => {
                      handlePin(feed, !isPinned);
                    }}
                  >
                    {isPinned ? <UnpinIcon /> : <PinIcon />}
                  </IconButton>
                </span>
              </Tooltip>
              <CopyFeedLink feed={feed} />
              {feed.authorized && feed.authorized.edit &&
                <Tooltip title={i18n.t('customFeeds:actions.edit')}>
                  <IconButton
                    aria-label={i18n.t('customFeeds:actions.edit')}
                    component={RouterLink}
                    to={`${customFeeds.urlOf(feed)}/edit`}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>}
              {feed.authorized && feed.authorized.delete &&
                <DialogConfirm
                  title={i18n.t('customFeeds:delete.title')}
                  message={i18n.t('customFeeds:delete.message')}
                  confirm={i18n.t('customFeeds:delete.confirm')}
                  dismiss={i18n.t('customFeeds:delete.dismiss')}
                >
                  <IconButton
                    color="error"
                    aria-label={i18n.t('customFeeds:actions.delete')}
                    title={i18n.t('customFeeds:actions.delete')}
                    disabled={waiting}
                    onClick={() => {
                      handleDelete(feed);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </DialogConfirm>}
            </Stack>
          }
          slotProps={{ title: { variant: 'h6', component: 'h3' } }}
        />
      </Card>
    );
  };

  // The viewer's own, the ones on the home page first and in their order
  // there, then the rest.
  const ownPinned = pinned.filter((feed) => {
    return mine.some((each) => {
      return each.id === feed.id;
    });
  });
  const ownOthers = mine.filter((feed) => {
    return !pinnedIds.includes(feed.id);
  });
  const kept = pinned.filter((feed) => {
    return !mine.some((each) => {
      return each.id === feed.id;
    });
  });

  return (
    <>
      <Helmet>
        <title>{i18n.t('customFeeds:cTitle')}</title>
      </Helmet>
      <Grid container sx={{ justifyContent: 'center' }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ mb: 2 }}>
            <BrowseHeader
              icon={<FeedIcon />}
              title={i18n.t('customFeeds:cTitle')}
              subheader={i18n.t('customFeeds:list.subheader')}
              actionTo="/feeds/new"
              actionLabel={i18n.t('customFeeds:list.create')}
            />
          </Box>
          {isLoading && <Progress />}
          {!isLoading && hasFailed &&
            <Typography variant="body2" color="error" role="alert" sx={{ p: 2 }}>
              {i18n.t('customFeeds:list.loadFailed')}
            </Typography>}
          {!isLoading && !hasFailed &&
            <>
              <Typography variant="subtitle1" component="h2" sx={{ px: 2, pb: 1 }}>
                {i18n.t('customFeeds:list.mine')}
              </Typography>
              {mine.length === 0 &&
                <Typography variant="body1" color="textSecondary" sx={{ px: 2, pb: 2 }}>
                  {i18n.t('customFeeds:list.empty')}
                </Typography>}
              {[...ownPinned, ...ownOthers].map(row)}
              <Typography variant="subtitle1" component="h2" sx={{ px: 2, pb: 1 }}>
                {i18n.t('customFeeds:list.kept')}
              </Typography>
              {kept.length === 0 &&
                <Typography variant="body1" color="textSecondary" sx={{ px: 2, pb: 2 }}>
                  {i18n.t('customFeeds:list.emptyKept')}
                </Typography>}
              {kept.map(row)}
            </>}
        </Grid>
      </Grid>
    </>
  );
};

CustomFeedsManage.propTypes = {
  viewer: PropTypes.object.isRequired,
  alertSuccess: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return {
    viewer: state.session.viewer,
  };
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

export default connect(mapStateToProps, mapDispatchToProps)(CustomFeedsManage);
