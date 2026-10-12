import React from 'react';
import PropTypes from 'prop-types';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

import i18n from '../languages';
import federation from '../utils/federation';

// Said on the profile of somebody who is on another server: that they are,
// which server, and where to see them in full.
//
// What is kept of them here is what their server shares with everybody,
// and their posts from the day somebody here began to follow them. Their
// own page has the rest.
const RemoteNotice = ({ node }) => {
  const domain = federation.domainOf(node);
  // Their page there: kept as their website when they were looked up.
  const page = node.websiteUrl || node.uri;

  return (
    <Alert
      severity="info"
      sx={{ mx: 2, mb: 2 }}
      action={page ?
        <Button
          color="inherit"
          size="small"
          component="a"
          href={page}
          target="_blank"
          rel="noopener noreferrer"
        >
          {i18n.t('federation:remote.viewOriginal', { domain })}
        </Button> : null}
    >
      {i18n.t('federation:remote.onAnotherServer', { domain })}
    </Alert>
  );
};

RemoteNotice.propTypes = {
  node: PropTypes.shape({
    alias: PropTypes.string,
    uri: PropTypes.string,
    originDomain: PropTypes.string,
    websiteUrl: PropTypes.string,
  }).isRequired,
};

export default RemoteNotice;
