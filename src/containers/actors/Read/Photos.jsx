import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';

import api from '../../../api';
import ActorType from '../../../proptypes/Actor';
import i18n from '../../../languages';
import photoFiles from '../../../utils/photoFiles';
import utils from '../../../utils';

const { getPortraitURL, getURL } = utils.node;

// Three across: a row of them where the column is the page's width, as on a
// phone, so the posts are not pushed far down; three rows beside the posts.
const ACROSS = 3;
const NARROW = ACROSS;
const WIDE = ACROSS * 3;

// The profile's latest photos, beside its posts, between About and
// Locations: a photo says at a glance who somebody is and what they care
// about (the user, 2026-10-28). Each opens its post; See all opens the
// Photos tab. Only its own, not those it is tagged in (Tagged), and nothing
// at all where it has none.
const ActorPhotos = ({ actor, onSeeAll }) => {
  const wide = useMediaQuery((theme) => { return theme.breakpoints.up('md'); });
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    let current = true;
    api.photos.browse({ oid: actor.id, start: 0, limit: WIDE }).then((result) => {
      if (current) {
        setPhotos((result.data && result.data.data) || []);
      }
    }).catch(() => {
      // No card: the Photos tab says what went wrong.
    });
    return () => {
      current = false;
    };
  }, [actor.id]);

  if (photos.length === 0) {
    return null;
  }

  const shown = photos.slice(0, wide ? WIDE : NARROW);

  return (
    <Card>
      <CardHeader
        title={
          <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 500 }}>
            {i18n.t('photos:mTitle')}
          </Typography>
        }
      />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${ACROSS}, 1fr)`,
          gap: 1,
          px: 2,
        }}
      >
        {shown.map((photo) => {
          const thumb = getPortraitURL(photo, 'square') || getPortraitURL(photo, 'medium');
          return (
            <ButtonBase
              key={`actor-photo-${photo.id}`}
              component={Link}
              to={getURL(photo)}
              aria-label={photoFiles.altOf(photo) || i18n.t('photos:cTitle')}
              sx={{
                aspectRatio: '1 / 1',
                borderRadius: 1,
                overflow: 'hidden',
                bgcolor: 'action.hover',
                '&:focus-visible': { outline: 2, outlineColor: 'primary.main' },
              }}
            >
              {thumb &&
                <Box
                  component="img"
                  src={thumb}
                  alt=""
                  loading="lazy"
                  // A file that is not there leaves the plain square, not
                  // the browser's broken picture.
                  onError={(event) => {
                    // eslint-disable-next-line no-param-reassign
                    event.currentTarget.style.visibility = 'hidden';
                  }}
                  sx={{
                    width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                  }}
                />}
            </ButtonBase>
          );
        })}
      </Box>
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button onClick={onSeeAll}>
          {i18n.t('photos:seeAll')}
        </Button>
      </CardActions>
    </Card>
  );
};

ActorPhotos.propTypes = {
  actor: ActorType.isRequired,
  // Opens the Photos tab.
  onSeeAll: PropTypes.func.isRequired,
};

export default ActorPhotos;
