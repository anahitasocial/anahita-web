import React from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';

import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import CustomFeedIcon from './CustomFeedIcon';
import i18n from '../languages';
import customFeeds from '../utils/customFeeds';
import utils from '../utils';

const { getActorName } = utils.node;

// A custom feed as a card among other cards: its picture and name, whose it
// is, what it is for, and what it shows in a sentence. Built like the cards
// of profiles and posts it sits beside in search results: a header, the
// text, and its buttons along the bottom.
const CustomFeedCard = ({
  feed,
  headerAction = null,
  action = null,
}) => {
  const isOwn = Boolean(feed.authorized && feed.authorized.edit);

  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar>
            <CustomFeedIcon name={feed.icon} />
          </Avatar>
        }
        title={
          <Link
            component={RouterLink}
            to={customFeeds.urlOf(feed)}
            color="inherit"
            underline="hover"
          >
            {feed.name}
          </Link>
        }
        subheader={i18n.t('customFeeds:list.by', { name: getActorName(feed.owner || {}) })}
        action={headerAction}
        slotProps={{
          title: { variant: 'h6' },
        }}
      />
      <CardContent sx={{ pt: 0 }}>
        {feed.body &&
          <Typography variant="body1" sx={{ pb: 1 }}>
            {feed.body}
          </Typography>}
        <Typography variant="body2" color="textSecondary">
          {customFeeds.summary(feed.definition, i18n.t.bind(i18n), { isOwn })}
        </Typography>
      </CardContent>
      {action &&
        <CardActions sx={{ p: 1 }}>
          {action}
        </CardActions>}
    </Card>
  );
};

CustomFeedCard.propTypes = {
  feed: PropTypes.object.isRequired,
  // At the top right of the card: a share button.
  headerAction: PropTypes.node,
  // Along the bottom: the button that adds it to the home page.
  action: PropTypes.node,
};

export default CustomFeedCard;
