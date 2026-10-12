import React from 'react';
import slugify from 'slugify';
import PropTypes from 'prop-types';
import moment from 'moment';
import { withStyles } from 'tss-react/mui';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Truncate from 'react-truncate';

import ActorType from '../proptypes/Actor';
import PersonType from '../proptypes/Person';
import ActorTitle from './ActorTitle';
import ActorAvatar from './ActorAvatar';
import ReadMore from './ReadMore';
import utils from '../utils';
import i18n from '../languages';

const {
  getActorName,
  getURL,
  getCoverURL,
  isAdmin,
  isPerson,
} = utils.node;

const styles = (theme) => {
  return {
    actions: {
      padding: 8,
    },
    title: {
      fontSize: 16,
    },
    alias: {
      fontSize: 12,
    },
    media: {
      height: theme.spacing(20),
    },
    disabled: {
      borderColor: theme.palette.warning.light,
    },
  };
};

const ActorCard = ({
  classes,
  actor,
  viewer = null,
  action = null,
  note = '',
  headerAction = null,
}) => {
  const cover = getCoverURL(actor);
  const url = getURL(actor);
  const slug = utils.federation.displayHandle(actor, slugify);
  const createdAt = moment.utc(actor.createdAt).local().format('LLL').toString();
  // Only when the server says when. It does not send this for anybody, and
  // a date made from nothing is this very moment: every card then said its
  // person had last visited just now.
  const lastVisitedAt = isPerson(actor) && actor.lastVisitedAt ?
    moment.utc(actor.lastVisitedAt).local().format('LLL').toString() : null;

  return (
    <Card
      component="section"
      className={!actor.enabled ? classes.disabled : ''}
    >
      {cover &&
        <Link href={url}>
          <CardMedia
            component="img"
            title={getActorName(actor)}
            alias={actor.name}
            image={cover}
          />
        </Link>}
      <CardHeader
        action={headerAction}
        avatar={
          <ActorAvatar
            actor={actor}
            linked
          />
        }
        title={
          <ActorTitle
            actor={actor}
            typographyProps={{
              variant: 'h6',
              className: classes.title,
            }}
            linked
          />
        }
        subheader={
          <Typography
            variant="subtitle1"
            className={classes.alias}
          >
            <Truncate width={300}>
              {slug}
            </Truncate>
          </Typography>
        }
      />
      {/* A line about the profile from whoever lists it: why it is
          recommended. Inside the card, under the name it is said of. */}
      {note &&
        <CardContent sx={{ py: 0 }}>
          <Typography variant="body2" color="textSecondary">
            {note}
          </Typography>
        </CardContent>}
      {actor.body &&
      <CardContent>
        <ReadMore charLimit={160} contentFilter>
          {actor.body}
        </ReadMore>
      </CardContent>}
      {viewer && isAdmin(viewer) &&
        <CardContent>
          <div>
            <Typography variant="caption">
              {i18n.t('people:person.joinedDate', {
                date: createdAt,
              })}
            </Typography>
          </div>
          <div>
            {lastVisitedAt &&
            <Typography variant="caption">
              {i18n.t('people:person.lastVisitOn', {
                date: lastVisitedAt,
              })}
            </Typography>}
          </div>
        </CardContent>}
      <CardActions className={classes.actions}>
        {action}
      </CardActions>
    </Card>
  );
};

ActorCard.propTypes = {
  classes: PropTypes.object.isRequired,
  action: PropTypes.node,
  note: PropTypes.string,
  // At the top right of the card: a way to turn a recommendation down.
  headerAction: PropTypes.node,
  actor: ActorType.isRequired,
  viewer: PersonType,
};

export default withStyles(ActorCard, styles);
