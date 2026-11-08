import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import DownIcon from '@mui/icons-material/ArrowDownward';
import EditIcon from '@mui/icons-material/EditOutlined';
import MoreIcon from '@mui/icons-material/MoreVert';
import FeedIcon from '@mui/icons-material/DynamicFeedOutlined';
import PinIcon from '@mui/icons-material/AddHomeOutlined';
import UnpinIcon from '@mui/icons-material/Home';
import UpIcon from '@mui/icons-material/ArrowUpward';

import CustomFeedDetailsDialog from './DetailsDialog';
import BrowseHeader from '../../components/BrowseHeader';
import { ShareMenuItem } from '../controls/Share';
import MenuItemLabel from '../../components/MenuItemLabel';
import CustomFeedIcon from '../../components/CustomFeedIcon';
import DialogConfirm from '../../components/DialogConfirm';
import Progress from '../../components/Progress';
import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';
import customFeeds from '../../utils/customFeeds';
import utils from '../../utils';
import PageColumn from '../../components/PageColumn';
import SEARCH from '../../constants/search';
import searchAddress from '../../utils/searchAddress';

const { getActorName } = utils.node;

// Every feed the viewer may see, in one list (roadmap row 125): everyone's,
// theirs among them, the default; the feeds of the people they follow;
// theirs alone; or the ones on their home page, in their order there, with
// the arrows that move them. Newest first and never ranked. A feed is found
// by its words in the site's search, which a line here leads to.
//
// A feed on the home page has a filled house; pressing it takes it off.
// Making, changing and deleting a feed are on its own pages.
const WHOSE = ['everyone', 'following', 'mine', 'home'];

// What else can be done with a feed, in a menu, so that its row keeps room
// for its name on a mobile: Edit, Delete, then Share, last as everywhere.
// Kept mounted, so that Delete's question stays when the menu is closed.
const FeedMenu = ({ feed, waiting, onDelete }) => {
  const [anchor, setAnchor] = useState(null);
  const close = () => {
    setAnchor(null);
  };
  const canEdit = Boolean(feed.authorized && feed.authorized.edit);
  const canDelete = Boolean(feed.authorized && feed.authorized.delete);
  const canShare = customFeeds.isShared(feed);

  if (!canEdit && !canDelete && !canShare) {
    return null;
  }

  return (
    <>
      <IconButton
        aria-label={i18n.t('customFeeds:actions.more')}
        onClick={(event) => {
          setAnchor(event.currentTarget);
        }}
      >
        <MoreIcon />
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={close} keepMounted>
        {canEdit &&
          <MenuItem component={RouterLink} to={`${customFeeds.urlOf(feed)}/edit`} onClick={close}>
            <MenuItemLabel icon={<EditIcon fontSize="small" />}>
              {i18n.t('customFeeds:actions.edit')}
            </MenuItemLabel>
          </MenuItem>}
        {canDelete &&
          <DialogConfirm
            title={i18n.t('customFeeds:delete.title')}
            message={i18n.t('customFeeds:delete.message')}
            confirm={i18n.t('customFeeds:delete.confirm')}
            dismiss={i18n.t('customFeeds:delete.dismiss')}
          >
            <MenuItem
              disabled={waiting}
              onClick={() => {
                close();
                onDelete(feed);
              }}
            >
              <MenuItemLabel icon={<DeleteIcon fontSize="small" color="error" />}>
                {i18n.t('customFeeds:actions.delete')}
              </MenuItemLabel>
            </MenuItem>
          </DialogConfirm>}
        {canShare &&
          <ShareMenuItem what={customFeeds.toShare(feed)} onDone={close} />}
      </Menu>
    </>
  );
};

FeedMenu.propTypes = {
  feed: PropTypes.object.isRequired,
  waiting: PropTypes.bool.isRequired,
  onDelete: PropTypes.func.isRequired,
};
const PAGE = 20;

const CustomFeedsBrowse = ({
  viewer,
  alertSuccess,
  alertError,
}) => {
  const [params, setParams] = useSearchParams();
  const whose = WHOSE.includes(params.get('show')) ? params.get('show') : 'everyone';
  const [list, setList] = useState([]);
  const [next, setNext] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [pinned, setPinned] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFailed, setHasFailed] = useState(false);
  const [waiting, setWaiting] = useState(false);
  // The feed whose details are open in the dialog, or 0.
  const [detailsOf, setDetailsOf] = useState(0);

  // The feeds on the home page: the list of "On your home", and the house
  // on every row.
  const loadPinned = () => {
    return api.customFeeds.pinned().then((result) => {
      setPinned(result.data.data || []);
    });
  };

  // A page of the chosen list, after `start`; the first page anew.
  const loadPage = (start) => {
    return api.customFeeds.discover({ whose, start, limit: PAGE }).then((result) => {
      const page = result.data.data || [];
      const pagination = result.data.pagination || {};
      setList((before) => {
        return start === 0 ? page : [...before, ...page];
      });
      setNext(pagination.next_start || 0);
      setHasMore(Boolean(pagination.has_more));
    });
  };

  const load = () => {
    setIsLoading(true);
    return Promise.all([loadPinned(), whose === 'home' ? Promise.resolve() : loadPage(0)]).then(() => {
      setHasFailed(false);
    }).catch(() => {
      setHasFailed(true);
    }).finally(() => {
      setIsLoading(false);
    });
  };

  useEffect(() => {
    setList([]);
    setHasMore(false);
    load();
  }, [whose]);

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
      return loadPinned();
    }).catch(failed).finally(() => {
      setWaiting(false);
    });
  };

  const handleDelete = (feed) => {
    setWaiting(true);
    api.customFeeds.deleteItem(feed).then(() => {
      alertSuccess(i18n.t('customFeeds:prompts.deleted'));
      setList((before) => {
        return before.filter((each) => {
          return each.id !== feed.id;
        });
      });
      return loadPinned();
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
          avatar={
            <Avatar>
              <CustomFeedIcon name={feed.icon} />
            </Avatar>
          }
          title={
            <ButtonBase
              onClick={() => {
                setDetailsOf(feed.id);
              }}
              sx={{
                display: 'block',
                maxWidth: '100%',
                font: 'inherit',
                textAlign: 'left',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {feed.name}
            </ButtonBase>
          }
          subheader={
            <>
              <Typography
                variant="body2"
                color="textSecondary"
                component="span"
                noWrap
                sx={{ display: 'block' }}
              >
                {isOwn ?
                  i18n.t(`customFeeds:access.${feed.access}`) :
                  i18n.t('customFeeds:list.by', { name: getActorName(feed.owner || {}) })}
                {/* When it was made, to tell one from another like it. */}
                {customFeeds.madeOn(feed, i18n.language) &&
                  ` · ${i18n.t('customFeeds:made', { date: customFeeds.madeOn(feed, i18n.language) })}`}
              </Typography>
              {/* One line, cut short: what it is for, or what it shows when
                  it does not say. The whole of it is in the dialog its
                  name opens, so every row here is the same height. */}
              <Typography
                variant="body2"
                color="textSecondary"
                component="span"
                noWrap
                sx={{ display: 'block' }}
              >
                {feed.body || customFeeds.summary(feed.definition, i18n.t.bind(i18n), { isOwn })}
              </Typography>
            </>
          }
          action={
            <Stack direction="row">
              {isPinned && whose === 'home' &&
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
              <FeedMenu feed={feed} waiting={waiting} onDelete={handleDelete} />
            </Stack>
          }
          slotProps={{
            title: {
              variant: 'subtitle1', component: 'h3', noWrap: true, sx: { fontWeight: 500 },
            },
            // Lets the lines be cut short instead of pushing the buttons
            // off the card.
            content: { sx: { minWidth: 0 } },
          }}
        />
      </Card>
    );
  };

  const shown = whose === 'home' ? pinned : list;

  return (
    <>
      <Helmet>
        <title>{i18n.t('customFeeds:cTitle')}</title>
      </Helmet>
      {/* As wide as a post's page: room for a feed's name and what it is
          for, on one line each. */}
      <PageColumn width={800}>
        <Box sx={{ mb: 2 }}>
          <BrowseHeader
            icon={<FeedIcon />}
            title={i18n.t('customFeeds:cTitle')}
            subheader={i18n.t('customFeeds:list.subheader')}
            actionTo="/feeds/add"
            actionLabel={i18n.t('customFeeds:list.create')}
          >
            {/* Whose feeds, and the way to find one by its words: side by
                side, or one above the other on a mobile. */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 1, sm: 2 }}
              sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}
            >
              <TextField
                select
                size="small"
                label={i18n.t('customFeeds:list.show')}
                value={whose}
                onChange={(event) => {
                  const chosen = event.target.value;
                  setParams(chosen === 'everyone' ? {} : { show: chosen }, { replace: true });
                }}
                sx={{ width: { xs: '100%', sm: 8 * 28 }, flexShrink: 0 }}
              >
                {WHOSE.map((each) => {
                  return (
                    <MenuItem key={`whose-${each}`} value={each}>
                      {i18n.t(`customFeeds:list.whose.${each}`)}
                    </MenuItem>
                  );
                })}
              </TextField>
              <Typography variant="body2" color="textSecondary">
                {i18n.t('customFeeds:list.findOne')}
                {' '}
                <Link component={RouterLink} to={searchAddress.of({ scope: SEARCH.SCOPE.FEEDS })} underline="hover">
                  {i18n.t('customFeeds:list.searchFeeds')}
                </Link>
              </Typography>
            </Stack>
          </BrowseHeader>
        </Box>
        {isLoading && <Progress />}
        {!isLoading && hasFailed &&
        <Typography variant="body2" color="error" role="alert" sx={{ p: 2 }}>
          {i18n.t('customFeeds:list.loadFailed')}
        </Typography>}
        {!isLoading && !hasFailed && shown.length === 0 &&
        <Typography variant="body1" color="textSecondary" sx={{ px: 2, pb: 2 }}>
          {i18n.t(`customFeeds:list.none.${whose}`)}
        </Typography>}
        {!isLoading && !hasFailed && whose === 'home' && pinned.map(row)}
        {!isLoading && !hasFailed && whose !== 'home' &&
        <InfiniteScroll
          dataLength={list.length}
          next={() => {
            loadPage(next).catch(() => {
              setHasMore(false);
            });
          }}
          hasMore={hasMore}
          loader={<Progress key="feeds-progress" />}
          style={{ overflow: 'visible' }}
        >
          {list.map(row)}
        </InfiniteScroll>}
      </PageColumn>
      {detailsOf > 0 &&
        <CustomFeedDetailsDialog
          feedId={detailsOf}
          onClose={() => {
            setDetailsOf(0);
          }}
        />}
    </>
  );
};

CustomFeedsBrowse.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(CustomFeedsBrowse);
