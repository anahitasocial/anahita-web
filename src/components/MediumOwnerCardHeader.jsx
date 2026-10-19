import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';

import ActorAvatar from './ActorAvatar';
import ActorHandle from './ActorHandle';
import NodeType from '../proptypes/Node';
import utils from '../utils';

const { getURL } = utils.node;

const MediumOwner = ({ owner, actions }) => {
  if (!owner) {
    console.debug('MediumOwner: No owner provided', { owner, actions });
    return null;
  }
  const url = getURL(owner);

  return (
    <>
      {/* Where a post was made: a group, or somebody else's profile. Lighter
          than the author's header under it, but in the body's own size and
          colour, so it can be read by anybody: the small grey text it was
          could not be (the user, 2026-10-17). */}
      <CardHeader
        sx={{ py: 1 }}
        avatar={
          <ActorAvatar
            actor={owner}
            linked
          />
        }
        title={
          <Box
            component="span"
            sx={{
              display: 'flex', alignItems: 'baseline', columnGap: 1, flexWrap: 'wrap', minWidth: 0,
            }}
          >
            <Link
              href={url}
              variant="body1"
              color="textPrimary"
              underline="hover"
              sx={{ fontWeight: 500 }}
            >
              {owner.name}
            </Link>
            <ActorHandle actor={owner} variant="body2" />
          </Box>
        }
        action={actions}
      />
      <Divider />
    </>
  );
};

MediumOwner.propTypes = {
  owner: NodeType,
  actions: PropTypes.node,
};

export default MediumOwner;
