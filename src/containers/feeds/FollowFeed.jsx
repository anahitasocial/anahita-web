import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Button from '@mui/material/Button';

import AddIcon from '@mui/icons-material/Add';

import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';
import customFeeds from '../../utils/customFeeds';

// Following something that is not a profile, a hashtag or a place: a
// custom feed of that one thing, the viewer's own and seen by them alone,
// put on their home page.
//
// There is nothing else to following either, so it is not a feature of its
// own. A feed of exactly this that the viewer already has is put on the
// home page as it is, and no second one is made.
const FollowFeed = ({
  name,
  icon,
  definition,
  done,
  alertSuccess,
  alertError,
}) => {
  const [waiting, setWaiting] = useState(false);

  const handleFollow = () => {
    const wanted = customFeeds.fingerprint(definition);

    setWaiting(true);

    api.customFeeds.mine().then((result) => {
      const have = (result.data.data || []).find((feed) => {
        return customFeeds.fingerprint(feed.definition) === wanted;
      });

      if (have) {
        return have;
      }

      return api.customFeeds.add({
        name,
        // The feed's picture is what it is a feed of: a hashtag, a place.
        icon,
        access: 'myself',
        definition,
      }).then((added) => {
        return added.data;
      });
    }).then((feed) => {
      return api.customFeeds.setPinned(feed, true);
    }).then(() => {
      alertSuccess(done);
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
      startIcon={<AddIcon />}
      disabled={waiting}
      onClick={handleFollow}
    >
      {i18n.t('actions:follow')}
    </Button>
  );
};

FollowFeed.propTypes = {
  // What the feed is called, and what it shows.
  name: PropTypes.string.isRequired,
  // The feed's picture, one of the feed icons.
  icon: PropTypes.string.isRequired,
  definition: PropTypes.object.isRequired,
  // What is said when it is done. The button says Follow, as every
  // button that follows anything does.
  done: PropTypes.string.isRequired,
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

export default connect(null, mapDispatchToProps)(FollowFeed);
