import React from 'react';
import slugify from 'slugify';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import SocialgraphMeta from './SocialgraphMeta';
import ScheduledDeletion from '../../../components/ScheduledDeletion';
import ActorType from '../../../proptypes/Actor';
import i18n from '../../../languages';
import utils from '../../../utils';

const { getActorName } = utils.node;

// The top of a profile: its cover, its picture, its name and the buttons to
// act on it, laid out compactly the same way on a mobile and a desktop.
//
//   cover, when there is one, in a wide band
//   picture, over the cover's lower edge | Follow, the other buttons, ⋮
//   Name (pronouns)
//   @handle · Follows you
//   Moved to @new@handle, for somebody who moved their account
//   22 followers · 16 following | the buttons for how its posts are laid out
//
// Left aligned, so that it reads in one line down from the picture, and the
// buttons sit beside the picture rather than in a row of their own below,
// which left a band of white under everything. With no cover the picture
// starts at the top of the card. What the profile says of itself is in its
// About card, not here.
const ActorHeader = ({
  cover,
  hasCover = true,
  avatar,
  actor,
  followAction = null,
  headerActions = null,
  viewToggle = null,
  socialgraphOpenOn = '',
  muted = false,
}) => {
  // A profile the viewer has blocked: its cover and picture blurred, so
  // that who they are is not looked at, while the page still says whose
  // it is. The blur is kept inside each picture's edges.
  const blurred = (amount) => {
    return muted ? { filter: `blur(${amount}px)`, overflow: 'hidden' } : {};
  };
  const pronouns = (actor.personPronouns || '').trim();

  return (
    <Card
      sx={!actor.enabled ? { border: 1, borderColor: 'warning.light' } : undefined}
    >
      <Box sx={{ overflow: 'hidden', '& > *': blurred(16) }}>{cover}</Box>
      <Box sx={{ px: { xs: 2, sm: 3 }, pb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 1,
            // Over the cover's lower edge, or with room above it when there
            // is no cover.
            mt: hasCover ? { xs: -6, sm: -8 } : 2,
          }}
        >
          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              // The picture's own button is sized for a larger circle; here
              // the circle is the size, smaller on a mobile.
              '& .MuiIconButton-root': { width: 'auto', height: 'auto', p: 0 },
              '& .MuiAvatar-root': {
                ...blurred(6),
                width: { xs: 96, sm: 128 },
                height: { xs: 96, sm: 128 },
                fontSize: { xs: 36, sm: 44 },
              },
            }}
          >
            {avatar}
          </Box>
          {/* The buttons, clear of the cover: below its lower edge by a
          step at least, where on a mobile the picture is too short to hold
          them there. They wrap among themselves, to the right, so that the
          room above them stays. */}
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{
              alignItems: 'center',
              justifyContent: 'flex-end',
              flexWrap: 'wrap',
              rowGap: 1,
              minWidth: 0,
              pb: 0.5,
              mt: hasCover ? { xs: 7, sm: 9 } : 0,
            }}
          >
            {followAction}
            {headerActions}
          </Stack>
        </Box>
        <Typography
          variant="h2"
          dir="auto"
          sx={{
            fontSize: { xs: 22, sm: 26 }, fontWeight: 600, mt: 1.5, lineHeight: 1.25,
          }}
        >
          {getActorName(actor)}
          {pronouns &&
            <Box
              component="span"
              sx={{
                fontSize: 16,
                fontWeight: 400,
                color: 'text.secondary',
                ml: 1,
                verticalAlign: 'middle',
                position: 'relative',
                top: '-2px',
                whiteSpace: 'nowrap',
              }}
            >
              {`(${pronouns})`}
            </Box>}
        </Typography>
        <Typography
          variant="body1"
          color="textSecondary"
          sx={{ overflowWrap: 'anywhere' }}
        >
          {utils.federation.displayHandle(actor, slugify)}
          {actor.isFollowingViewer && ` · ${i18n.t('socialgraph:followsYou')}`}
        </Typography>
        {/* Somebody from another server who moved their account (roadmap
        row 124, part 2): where to, under the handle it replaces. */}
        {actor.movedTo && actor.movedTo.alias &&
          <Typography variant="body2" color="textSecondary" sx={{ overflowWrap: 'anywhere' }}>
            {`${i18n.t('socialgraph:moved.to')} `}
            <Link component={RouterLink} to={`/@${actor.movedTo.alias}/`}>
              {`@${actor.movedTo.alias}`}
            </Link>
          </Typography>}
        {/* Seen only by its followers and administrators, and site
            administrators: anybody else cannot reach a deleted profile. */}
        <ScheduledDeletion actor={actor} sx={{ mt: 1 }} />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <SocialgraphMeta actor={actor} openOn={socialgraphOpenOn} />
          {viewToggle}
        </Box>
      </Box>
    </Card>
  );
};

ActorHeader.propTypes = {
  cover: PropTypes.node.isRequired,
  // Whether the profile has a cover picture, which the picture overlaps.
  hasCover: PropTypes.bool,
  avatar: PropTypes.node.isRequired,
  actor: ActorType.isRequired,
  followAction: PropTypes.node,
  headerActions: PropTypes.node,
  // How the profile's posts are laid out, across from its counts.
  viewToggle: PropTypes.node,
  // A list of followers to open on arriving. See SocialgraphMeta.
  socialgraphOpenOn: PropTypes.string,
  // Drawn as a profile the viewer has blocked.
  muted: PropTypes.bool,
};

export default ActorHeader;
