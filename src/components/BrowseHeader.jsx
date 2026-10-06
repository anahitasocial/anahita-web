import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import AddIcon from '@mui/icons-material/Add';

// The header a browse view opens with: what you are looking at, and the one
// thing you can add to it.
//
// Header only, with the list stacked underneath rather than inside — the same
// reason ActorSetting gives: every row below is already a card, and wrapping
// them would draw a border around a column of borders.
//
// The action is a bare +. It sits beside a title that names the entity, which
// is the case shortened button labels rest on, and the words it would have
// carried go to the tooltip and the accessible name instead. A screen reader
// reaching the button hears "Create group", not "Add" with no object, and the
// header stays one line wide on a phone.
//
// No action renders when `actionTo` is empty, which is how a viewer who may
// not add one sees no +. That is a rendering hint and nothing more: the route
// behind it does its own check, so a stale answer here costs a refusal, never
// a way in.
const BrowseHeader = ({
  icon,
  title,
  subheader = '',
  actionTo = '',
  actionLabel = '',
}) => {
  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar>
            {icon}
          </Avatar>
        }
        title={title}
        subheader={subheader || undefined}
        action={actionTo &&
          <Tooltip title={actionLabel}>
            <IconButton
              color="primary"
              component={Link}
              to={actionTo}
              aria-label={actionLabel}
              size="large"
            >
              <AddIcon />
            </IconButton>
          </Tooltip>}
        slotProps={{
          title: { variant: 'h5' },
        }}
      />
    </Card>
  );
};

BrowseHeader.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  // A line under the title, for a page that has something to say about
  // itself.
  subheader: PropTypes.string,
  actionTo: PropTypes.string,
  actionLabel: PropTypes.string,
};

export default BrowseHeader;
