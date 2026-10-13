import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';

import FediverseIcon from '@mui/icons-material/Hub';

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
// profile it is. RemoteBadge sits under their handle; RemoteLink sits
// with the profile's other buttons; and the longer words, what of them is
// here and where the rest is, are in the About card
// (containers/actors/Read/About.jsx).

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
      <Chip
        size="small"
        variant="outlined"
        icon={bluesky ? <BlueskyIcon /> : <FediverseIcon />}
        label={bluesky ?
          i18n.t('federation:remote.onBluesky') :
          i18n.t('federation:remote.on', { domain })}
      />
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

// Their page there: kept as their website when they were looked up. The
// button carries the mark of the network it leads to.
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
      startIcon={onBluesky(node) ? <BlueskyIcon /> : <FediverseIcon />}
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
