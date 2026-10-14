import React from 'react';
import slugify from 'slugify';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import SocialgraphMeta from './SocialgraphMeta';
import ActorType from '../../../proptypes/Actor';
import i18n from '../../../languages';
import utils from '../../../utils';

const { getActorName } = utils.node;

// The top of a profile: its cover, its picture, its name and the buttons to
// act on it, laid out compactly the same way on a phone and a desktop.
//
//   cover, when there is one, in a wide band
//   picture, over the cover's lower edge | Follow, the other buttons, ⋮
//   Name (pronouns)
//   @handle · Follows you
//   22 followers · 16 following
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
  socialgraphOpenOn = '',
}) => {
  const pronouns = (actor.personPronouns || '').trim();

  return (
    <Card
      sx={!actor.enabled ? { border: 1, borderColor: 'warning.light' } : undefined}
    >
      {cover}
      <Box sx={{ px: { xs: 2, sm: 3 }, pb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
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
              // the circle is the size, smaller on a phone.
              '& .MuiIconButton-root': { width: 'auto', height: 'auto', p: 0 },
              '& .MuiAvatar-root': {
                width: { xs: 96, sm: 128 },
                height: { xs: 96, sm: 128 },
                fontSize: { xs: 36, sm: 44 },
              },
            }}
          >
            {avatar}
          </Box>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: 'center', flexWrap: 'wrap', rowGap: 1, pb: 0.5,
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
                fontSize: 16, fontWeight: 400, color: 'text.secondary', ml: 1, whiteSpace: 'nowrap',
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
        <SocialgraphMeta actor={actor} openOn={socialgraphOpenOn} />
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
  // A list of followers to open on arriving. See SocialgraphMeta.
  socialgraphOpenOn: PropTypes.string,
};

export default ActorHeader;
