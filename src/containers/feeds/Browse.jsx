import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import FeedIcon from '@mui/icons-material/DynamicFeedOutlined';

import CustomFeedDetailsDialog from './DetailsDialog';
import FeedRow from './FeedRow';
import useFeedsBrowse, { WHOSE } from './useFeedsBrowse';
import BrowseHeader from '../../components/BrowseHeader';
import Progress from '../../components/Progress';
import actions from '../../actions';
import i18n from '../../languages';
import PageColumn from '../../components/PageColumn';
import SEARCH from '../../constants/search';
import searchAddress from '../../utils/searchAddress';

// Every feed the viewer may see, in one list (roadmap row 125): everyone's,
// theirs among them, the default; the feeds of the people they follow;
// theirs alone; or the ones on their home page, in their order there, with
// the arrows that move them. Newest first and never ranked. A feed is found
// by its words in the site's search, which a line here leads to.
//
// Making, changing and deleting a feed are on its own pages. What the list
// holds, and the changes made from it, are useFeedsBrowse.js's; each feed is
// drawn by FeedRow.jsx.
const CustomFeedsBrowse = ({
  viewer,
  alertSuccess,
  alertError,
}) => {
  const [params, setParams] = useSearchParams();
  const whose = WHOSE.includes(params.get('show')) ? params.get('show') : 'everyone';
  const feeds = useFeedsBrowse({ whose, alertSuccess, alertError });
  const { shown, isLoading, hasFailed } = feeds;
  // The feed whose details are open in the dialog, or 0.
  const [detailsOf, setDetailsOf] = useState(0);

  const row = (feed) => {
    return (
      <FeedRow
        key={`custom-feed-${feed.id}`}
        feed={feed}
        viewer={viewer}
        place={feeds.placeOf(feed)}
        pinnedCount={feeds.pinnedCount}
        canMove={whose === 'home'}
        waiting={feeds.waiting}
        onDetails={setDetailsOf}
        onPin={feeds.pin}
        onMove={feeds.move}
        onDelete={feeds.deleteItem}
      />
    );
  };

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
        {!isLoading && !hasFailed && whose === 'home' && shown.map(row)}
        {!isLoading && !hasFailed && whose !== 'home' &&
        <InfiniteScroll
          dataLength={shown.length}
          next={feeds.more}
          hasMore={feeds.hasMore}
          loader={<Progress key="feeds-progress" />}
          style={{ overflow: 'visible' }}
        >
          {shown.map(row)}
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
