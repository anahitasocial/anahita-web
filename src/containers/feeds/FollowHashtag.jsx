import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Button from '@mui/material/Button';

import FollowIcon from '@mui/icons-material/AddHomeOutlined';

import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';
import customFeeds from '../../utils/customFeeds';

// Following a hashtag: a custom feed of that one hashtag, the viewer's own
// and seen by them alone, put on their home page.
//
// There is nothing else to following a hashtag, so it is not a feature of
// its own. A feed of exactly this hashtag that the viewer already has is put
// on the home page as it is, and no second one is made.
const FollowHashtag = ({
  tag,
  alertSuccess,
  alertError,
}) => {
  const [waiting, setWaiting] = useState(false);

  const handleFollow = () => {
    const wanted = customFeeds.fingerprint(customFeeds.ofHashtag(tag));

    setWaiting(true);

    api.customFeeds.mine().then((result) => {
      const have = (result.data.data || []).find((feed) => {
        return customFeeds.fingerprint(feed.definition) === wanted;
      });

      if (have) {
        return have;
      }

      return api.customFeeds.add({
        name: `#${tag}`,
        access: 'myself',
        definition: customFeeds.ofHashtag(tag),
      }).then((added) => {
        return added.data;
      });
    }).then((feed) => {
      return api.customFeeds.setPinned(feed, true);
    }).then(() => {
      alertSuccess(i18n.t('customFeeds:prompts.followed', { tag }));
    })
      .catch((response) => {
        const data = (response.response && response.response.data) || {};
        const reason = data.error || '';

        alertError(i18n.t(i18n.exists(`customFeeds:form.errors.${reason}`) ?
          `customFeeds:form.errors.${reason}` :
          'customFeeds:prompts.failed'));
      })
      .finally(() => {
        setWaiting(false);
      });
  };

  return (
    <Button
      startIcon={<FollowIcon />}
      disabled={waiting}
      onClick={handleFollow}
    >
      {i18n.t('customFeeds:actions.follow', { tag })}
    </Button>
  );
};

FollowHashtag.propTypes = {
  // The hashtag as it is kept: no "#", lower case.
  tag: PropTypes.string.isRequired,
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

export default connect(null, mapDispatchToProps)(FollowHashtag);
