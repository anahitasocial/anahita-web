import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import api from '../../../api';
import PhotoSlides from '../../../components/PhotoSlides';
import ActorType from '../../../proptypes/Actor';
import i18n from '../../../languages';
import photoFiles from '../../../utils/photoFiles';
import utils from '../../../utils';

const { getURL } = utils.node;

// How many: slides, swiped through as the photos of a post are, at every
// width, so that there is never a grid with a row half full (the user,
// 2026-10-28).
const SHOWN = 10;

// The profile's latest photos, beside its posts, between About and
// Locations: a photo says at a glance who somebody is and what they care
// about (the user, 2026-10-28). Each post by its first image, and each
// opens its post; See all opens the Photos tab. Only its own, not those it
// is tagged in (Tagged), and nothing at all where it has none.
const ActorPhotos = ({ actor, onSeeAll }) => {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    let current = true;
    api.photos.browse({ oid: actor.id, start: 0, limit: SHOWN }).then((result) => {
      if (current) {
        const listed = (result.data && result.data.data) || [];
        setPhotos(listed.filter((photo) => { return photoFiles.filesOf(photo).length > 0; }));
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

  const slides = {
    id: actor.id,
    type: photos[0].type,
    files: photos.map((photo) => { return photoFiles.filesOf(photo)[0]; }),
  };

  return (
    <Card>
      <CardHeader
        title={
          <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 500 }}>
            {i18n.t('photos:mTitle')}
          </Typography>
        }
      />
      <PhotoSlides
        medium={slides}
        onOpen={(at) => {
          navigate(getURL(photos[at]));
        }}
      />
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
