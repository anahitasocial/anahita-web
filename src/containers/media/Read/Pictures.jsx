import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';

import MediumType from '../../../proptypes/Medium';
import AltBadge from '../../../components/AltBadge';
import PhotoSlides from '../../../components/PhotoSlides';
import Progress from '../../../components/Progress';
import RemovedPictures from '../../../components/RemovedPictures';
import VideoElsewhere from '../../../components/VideoElsewhere';
import i18n from '../../../languages';
import photoFiles from '../../../utils/photoFiles';
import PeopleInPost from '../PeopleInPost';

// The top of a post's own page, above who wrote it: an article's cover, a
// post's photo or photos, or the poster of a video from elsewhere, and who
// is in it. What there is to show is worked out by useMediumRead (`read`).
const Pictures = ({
  classes,
  medium,
  read,
  cover = null,
  handleView = null,
}) => {
  const {
    portrait,
    elsewhere,
    coverUrl,
    hasSlides,
    isRemoved,
    isLoaded,
  } = read;

  const portraitMedia = (
    <CardMedia
      component="img"
      title={medium.title}
      alt={photoFiles.altOf(medium)}
      image={portrait}
    />
  );

  return (
    <>
      {cover}
      {!cover && coverUrl &&
      <CardMedia
        className={classes.cover}
        title={medium.title}
        image={coverUrl}
        src="picture"
      />}
      {isRemoved &&
      <RemovedPictures medium={medium} auto />}
      {hasSlides &&
      <PhotoSlides
        medium={medium}
        size="large"
        onOpen={handleView ? () => {
          handleView();
        } : null}
      />}
      {/* One photo opens in the theatre too, as several do, to be seen
        larger and zoomed into (asked for again by the user on
        2026-10-17). */}
      {elsewhere &&
      <VideoElsewhere
        node={medium}
        elsewhere={elsewhere}
        poster={hasSlides ? '' : (portrait || '')}
        alt={photoFiles.altOf(medium)}
        description={photoFiles.descriptionOf(medium)}
        title={medium.title || ''}
      />}
      {!hasSlides && portrait && isLoaded && !elsewhere &&
      <Box sx={{ position: 'relative' }}>
        {handleView ?
          <ButtonBase
            onClick={handleView}
            aria-label={i18n.t('media:stepper.open')}
            sx={{ display: 'block', width: '100%' }}
          >
            {portraitMedia}
          </ButtonBase> :
          portraitMedia}
        <AltBadge text={photoFiles.descriptionOf(medium)} />
      </Box>}
      {!hasSlides && !isLoaded &&
      <CardContent>
        <Progress />
      </CardContent>}
      {/* Who is in it, right under the picture (roadmap row 103). */}
      {!medium.video && <PeopleInPost medium={medium} />}
    </>
  );
};

Pictures.propTypes = {
  classes: PropTypes.object.isRequired,
  medium: MediumType.isRequired,
  // What useMediumRead gives.
  read: PropTypes.object.isRequired,
  // An article's cover as its author may change it, in place of the
  // picture alone.
  cover: PropTypes.node,
  // Opens the post in the theatre.
  handleView: PropTypes.func,
};

export default Pictures;
