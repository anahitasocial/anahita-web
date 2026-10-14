import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Button from '@mui/material/Button';

import PinIcon from '@mui/icons-material/AddHomeOutlined';
import UnpinIcon from '@mui/icons-material/HomeOutlined';

import CustomFeedCard from '../../components/CustomFeedCard';
import usePinnedFeeds from './usePinnedFeeds';
import { ShareButton } from '../controls/Share';
import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';
import customFeeds from '../../utils/customFeeds';

// A custom feed among search results, as a card like the profiles and posts
// around it, with the button that adds it to the home page. Also among
// suggestions, where it comes as a feed (`feed`) and not as a node.
//
// Search sends a feed as a node, with its picture and what it shows in a
// `feed` block. Whether it is on the viewer's home page is read from the
// list of the ones that are, which the menu keeps too.
const CustomFeedSearchCard = ({
  node = null,
  feed: given = null,
  isAuthenticated,
  alertSuccess,
  alertError,
}) => {
  const pinned = usePinnedFeeds(isAuthenticated);
  const [waiting, setWaiting] = useState(false);

  const feed = given || customFeeds.fromSearch(node);
  const isPinned = pinned.some((each) => {
    return each.id === feed.id;
  });

  const handlePin = () => {
    setWaiting(true);
    api.customFeeds.setPinned(feed, !isPinned).then(() => {
      alertSuccess(i18n.t(isPinned ? 'customFeeds:prompts.unpinned' : 'customFeeds:prompts.pinned'));
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
    <CustomFeedCard
      feed={feed}
      headerAction={<ShareButton what={customFeeds.toShare(feed)} />}
      action={isAuthenticated &&
        <Button
          fullWidth
          variant={isPinned ? 'outlined' : 'contained'}
          startIcon={isPinned ? <UnpinIcon /> : <PinIcon />}
          disabled={waiting}
          onClick={handlePin}
        >
          {i18n.t(isPinned ? 'customFeeds:actions.unpin' : 'customFeeds:actions.pin')}
        </Button>}
    />
  );
};

CustomFeedSearchCard.propTypes = {
  // The feed, as search sends it, or as a feed.
  node: PropTypes.object,
  feed: PropTypes.object,
  isAuthenticated: PropTypes.bool.isRequired,
  alertSuccess: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return {
    isAuthenticated: state.session.isAuthenticated,
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

export default connect(mapStateToProps, mapDispatchToProps)(CustomFeedSearchCard);
