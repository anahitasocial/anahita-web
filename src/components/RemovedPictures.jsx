import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';

import PicturesIcon from '@mui/icons-material/PhotoLibraryOutlined';
import GoneIcon from '@mui/icons-material/HideImageOutlined';

import AltBadge from './AltBadge';
import PhotoSlides from './PhotoSlides';
import api from '../api';
import i18n from '../languages';
import federation from '../utils/federation';
import photoFiles from '../utils/photoFiles';
import utils from '../utils';

// In place of the pictures of a post from another server, when they are
// no longer stored here.
//
// A site keeps the pictures of posts from elsewhere for a while and then
// removes them, since they are nearly all of what such posts cost to
// keep. The post stays, and says how many pictures it had and what each
// showed. Whoever wants to see them presses the button, and they are
// copied here again from where the post came from; then they are drawn as
// they always were. On the post's own page they are asked for at once
// (`auto`): somebody who opened the post wants to see it.
//
// When they are no longer to be had, because the post was taken away
// where it was written, it says that, and what they showed.
const RemovedPictures = ({ medium, auto = false }) => {
  const removed = medium.mediaRemoved || {};
  const [status, setStatus] = useState(removed.gone ? 'gone' : 'idle');
  // The post as it is once its pictures are back.
  const [fresh, setFresh] = useState(null);
  const asked = useRef(false);

  const ask = () => {
    setStatus('asking');

    api.federation.restorePictures(medium).then(() => {
      return api.photos.read(medium.id);
    }).then((result) => {
      setFresh(result.data);
      setStatus('idle');
    }).catch((error) => {
      setStatus(federation.reasonOf(error) === 'media_gone' ? 'gone' : 'failed');
    });
  };

  useEffect(() => {
    if (auto && !asked.current && !removed.gone) {
      asked.current = true;
      ask();
    }
  }, [auto, medium.id]);

  if (fresh && photoFiles.countOf(fresh) > 1) {
    return <PhotoSlides medium={fresh} size="large" />;
  }
  if (fresh && photoFiles.countOf(fresh) === 1) {
    return (
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          alt={photoFiles.altOf(fresh)}
          image={utils.node.getPortraitURL(fresh, 'large') || utils.node.getPortraitURL(fresh)}
        />
        <AltBadge text={photoFiles.descriptionOf(fresh)} />
      </Box>
    );
  }

  const alts = (removed.alts || []).filter(Boolean);
  const count = removed.count || 0;
  const domain = federation.domainOf(medium);
  const gone = status === 'gone';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 3,
        textAlign: 'center',
        bgcolor: 'action.hover',
      }}
    >
      {gone ? <GoneIcon color="action" /> : <PicturesIcon color="action" />}
      <Typography variant="body2" color="textSecondary">
        {gone ?
          i18n.t('photos:removed.gone', { count, domain }) :
          i18n.t('photos:removed.kept', { count })}
      </Typography>
      {alts.map((alt, index) => {
        return (
          <Typography
            // The descriptions of one post, which do not change places.
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            variant="body2"
            dir="auto"
            sx={{ fontStyle: 'italic', overflowWrap: 'anywhere' }}
          >
            {alt}
          </Typography>
        );
      })}
      {status === 'failed' &&
        <Typography variant="body2" color="error" role="alert">
          {i18n.t('photos:removed.failed')}
        </Typography>}
      {!gone &&
        <Button
          variant="outlined"
          color="inherit"
          loading={status === 'asking'}
          onClick={(event) => {
            // The card it is on is often a link.
            event.preventDefault();
            event.stopPropagation();
            ask();
          }}
        >
          {i18n.t('photos:removed.show', { count })}
        </Button>}
    </Box>
  );
};

RemovedPictures.propTypes = {
  medium: PropTypes.shape({
    id: PropTypes.number,
    uri: PropTypes.string,
    mediaRemoved: PropTypes.shape({
      count: PropTypes.number,
      alts: PropTypes.arrayOf(PropTypes.string),
      gone: PropTypes.bool,
    }),
  }).isRequired,
  // Asked for as soon as it is drawn, and not on a press.
  auto: PropTypes.bool,
};

export default RemovedPictures;
