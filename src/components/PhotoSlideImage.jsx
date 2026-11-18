import React, { useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import MediumType from '../proptypes/Medium';
import utils from '../utils';
import photoFiles from '../utils/photoFiles';

const { getPortraitURLs } = utils.node;

// One photo of a post at a wanted size, stepping down to a smaller one if
// that size was never stored: a slide of PhotoSlides, and of the
// lightbox's own row of a post's images.
const PhotoSlideImage = ({
  medium,
  index,
  size,
  className,
  imageClassName,
  onMeasure = null,
}) => {
  // How many of this photo's sizes have failed to load. A size the server
  // lists is not always one it stored, so the next smaller is tried.
  const [failed, setFailed] = useState(0);

  const candidates = getPortraitURLs(photoFiles.asSingle(medium, index), size);
  const src = candidates[Math.min(failed, candidates.length - 1)] || '';

  return (
    <img
      className={clsx(className, imageClassName)}
      src={src}
      alt={photoFiles.altOf(medium, index)}
      // The first is wanted now. The others wait until they are about to
      // come into view, so a post of four loads one until somebody swipes.
      loading={index === 0 ? 'eager' : 'lazy'}
      draggable={false}
      onLoad={(event) => {
        const { naturalWidth, naturalHeight } = event.currentTarget;
        if (onMeasure && naturalWidth && naturalHeight) {
          onMeasure(naturalWidth / naturalHeight);
        }
      }}
      onError={() => {
        if (failed < candidates.length - 1) {
          setFailed(failed + 1);
        }
      }}
    />
  );
};

PhotoSlideImage.propTypes = {
  medium: MediumType.isRequired,
  index: PropTypes.number.isRequired,
  size: PropTypes.string.isRequired,
  className: PropTypes.string,
  imageClassName: PropTypes.string,
  // Told the photo's own shape once it has loaded.
  onMeasure: PropTypes.func,
};

export default PhotoSlideImage;
