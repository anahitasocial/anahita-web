import React from 'react';
import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

import ControlBlock from '../../controls/Block';
import ActorType from '../../../proptypes/Actor';
import i18n from '../../../languages';
import utils from '../../../utils';

// Where somebody's posts would be, on the profile of somebody the viewer
// has blocked: that they are blocked, what it does, and the way back.
const BlockedNotice = ({ actor, onChanged }) => {
  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" component="p" sx={{ fontSize: 18, fontWeight: 600 }}>
          {i18n.t('socialgraph:blockedNotice.title', { name: utils.node.getActorName(actor) })}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          {i18n.t('socialgraph:blockedNotice.help')}
        </Typography>
        <ControlBlock
          actor={actor}
          onChange={onChanged}
          buttonProps={{ variant: 'outlined', fullWidth: true, sx: { mt: 2 } }}
        />
      </CardContent>
    </Card>
  );
};

BlockedNotice.propTypes = {
  actor: ActorType.isRequired,
  // Once unblocked: the profile is read again, and shows as it is.
  onChanged: PropTypes.func.isRequired,
};

export default BlockedNotice;
