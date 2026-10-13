import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';

import FediverseIcon from '@mui/icons-material/Hub';
import OpenIcon from '@mui/icons-material/OpenInNew';

import BlueskyIcon from './BlueskyIcon';
import i18n from '../languages';
import federation from '../utils/federation';

// Said on the profile of somebody who is on another server: that they are,
// and where to see them in full.
//
// What is kept of them here is what their server shares with everybody,
// and their posts from the day somebody here began to follow them. Their
// own page has the rest.
//
// In two small parts, and not as a notice across the page: a notice is for
// something the reader must act on, and this is only a fact about whose
// profile it is. RemoteBadge sits under their handle, with the longer
// words for whoever points at it; RemoteLink sits with the profile's other
// buttons.

const onBluesky = (node) => {
  const type = (node && typeof node.type === 'string') ? node.type : '';
  const uri = (node && typeof node.uri === 'string') ? node.uri : '';

  return type.includes('.atproto-service.') || uri.startsWith('at://');
};

// Which network they are on, by its mark and its name.
export const RemoteBadge = ({ node }) => {
  const domain = federation.domainOf(node);
  const bluesky = onBluesky(node);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
      <Tooltip title={i18n.t('federation:remote.onAnotherServer', { domain })}>
        <Chip
          size="small"
          variant="outlined"
          icon={bluesky ? <BlueskyIcon /> : <FediverseIcon />}
          label={bluesky ?
            i18n.t('federation:remote.onBluesky') :
            i18n.t('federation:remote.on', { domain })}
        />
      </Tooltip>
    </Box>
  );
};

RemoteBadge.propTypes = {
  node: PropTypes.shape({
    alias: PropTypes.string,
    type: PropTypes.string,
    uri: PropTypes.string,
    originDomain: PropTypes.string,
  }).isRequired,
};

// Their page there: kept as their website when they were looked up.
export const RemoteLink = ({ node }) => {
  const page = node.websiteUrl || federation.pageOf(node);

  if (!page) {
    return null;
  }

  return (
    <Button
      component="a"
      href={page}
      target="_blank"
      rel="noopener noreferrer"
      endIcon={<OpenIcon fontSize="small" />}
    >
      {i18n.t('federation:remote.viewOriginal', { domain: federation.domainOf(node) })}
    </Button>
  );
};

RemoteLink.propTypes = {
  node: PropTypes.shape({
    alias: PropTypes.string,
    uri: PropTypes.string,
    originDomain: PropTypes.string,
    websiteUrl: PropTypes.string,
  }).isRequired,
};

export default RemoteBadge;
