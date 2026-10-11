import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import LinkIcon from '@mui/icons-material/LinkOutlined';

import actions from '../../actions';
import i18n from '../../languages';
import customFeeds from '../../utils/customFeeds';

// Copies the address of a custom feed, to send to somebody.
//
// Offered only for a feed that somebody else can open: one kept to its
// owner would be a link to a page saying there is nothing there. Whoever
// opens the link sees the feed only if its audience admits them, and reads
// in it only what they could see anyway.
const CopyFeedLink = ({
  feed,
  alertSuccess,
  alertError,
}) => {
  if (!customFeeds.isShared(feed)) {
    return null;
  }

  const handleCopy = () => {
    const address = `${window.location.origin}${customFeeds.urlOf(feed)}`;

    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      alertError(i18n.t('customFeeds:prompts.linkFailed', { address }));
      return;
    }

    navigator.clipboard.writeText(address).then(() => {
      alertSuccess(i18n.t('customFeeds:prompts.linkCopied'));
    }).catch(() => {
      alertError(i18n.t('customFeeds:prompts.linkFailed', { address }));
    });
  };

  return (
    <Tooltip title={i18n.t('customFeeds:actions.copyLink')}>
      <IconButton
        aria-label={i18n.t('customFeeds:actions.copyLink')}
        onClick={handleCopy}
      >
        <LinkIcon />
      </IconButton>
    </Tooltip>
  );
};

CopyFeedLink.propTypes = {
  feed: PropTypes.object.isRequired,
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

export default connect(null, mapDispatchToProps)(CopyFeedLink);
