import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';

import ActorAvatar from './ActorAvatar';
import i18n from '../languages';
import utils from '../utils';

const { getActorName, getURL } = utils.node;

const oneLine = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

// A profile in a list of profiles: its picture, its name, its handle, and
// whether it follows the viewer, with what can be done about it at the end.
// Each is one line, cut short when there is no room, and the buttons take
// their own room beside them rather than sitting over the text, as a
// list item's secondary action does on a phone.
const ProfileRow = ({
  actor,
  actions = null,
  followsYou = Boolean(actor.isFollowingViewer),
  children = null,
}) => {
  return (
    <ListItem divider sx={{ gap: 1 }}>
      <ListItemAvatar>
        <ActorAvatar actor={actor} linked />
      </ListItemAvatar>
      <ListItemText
        sx={{ minWidth: 0 }}
        primary={
          <Link href={getURL(actor)} color="inherit" underline="hover" sx={{ display: 'block', ...oneLine }}>
            {getActorName(actor)}
          </Link>
        }
        secondary={
          <>
            <Box component="span" sx={{ display: 'flex', minWidth: 0 }}>
              {actor.alias &&
                <Box component="span" sx={oneLine}>
                  {`@${actor.alias}`}
                </Box>}
              {followsYou &&
                <Box component="span" sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
                  {actor.alias ? ` · ${i18n.t('socialgraph:followsYou')}` : i18n.t('socialgraph:followsYou')}
                </Box>}
            </Box>
            {children}
          </>
        }
        slotProps={{ secondary: { component: 'div' } }}
      />
      {actions &&
        <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          {actions}
        </Box>}
    </ListItem>
  );
};

ProfileRow.propTypes = {
  actor: PropTypes.object.isRequired,
  // Buttons, at the end of the row.
  actions: PropTypes.node,
  // Whether to say that the profile follows the viewer: by default when it
  // does, but not beside a "Follow back" button, which says it already.
  followsYou: PropTypes.bool,
  // More under the handle, such as when the profile is to be deleted.
  children: PropTypes.node,
};

export default ProfileRow;
