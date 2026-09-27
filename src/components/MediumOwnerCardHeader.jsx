import React from 'react';
import PropTypes from 'prop-types';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';

import ActorAvatar from './ActorAvatar';
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
      <CardHeader
        avatar={
          <ActorAvatar
            actor={owner}
            linked
            size="small"
          />
        }
        title={
          <Link href={url}>
            {owner.name}
          </Link>
        }
        actions={actions}
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
