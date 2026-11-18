import { useEffect, useState } from 'react';

import utils from '../../../utils';
import photoFiles from '../../../utils/photoFiles';
import videoElsewhere from '../../../utils/videoElsewhere';
import warnings from '../../../utils/warnings';
import { useWarning } from '../../../components/WarningCover';
import kinds from '../../../utils/postKinds';

const { getPortraitURL, getCoverURL } = utils.node;

// What a post's own page shows of a post, worked out from the post: which
// pictures it has and whether its photo has loaded, its words, and where
// its content warning goes. Default.jsx and Pictures.jsx draw it.
//
// `cover` is an article's cover as its author may change it, when the page
// has one (containers/cover).
const useMediumRead = (medium, cover = null) => {
  const portrait = getPortraitURL(medium, 'original');
  // A video from elsewhere shows as its poster, leading to it, and its
  // words without the line that did.
  const elsewhere = videoElsewhere.of(medium);
  const content = elsewhere ? elsewhere.content : medium.content;
  const coverUrl = getCoverURL(medium, 'large');

  // A post with several images is drawn as slides, which load their own.
  const hasSlides = photoFiles.hasSeveral(medium);
  // Pictures that were there and have been taken away, said where they were.
  const isRemoved = Boolean(medium.mediaRemoved) && photoFiles.countOf(medium) === 0;

  // One photo is shown once it has loaded, with a spinner until then.
  const [isLoaded, setIsLoaded] = useState(!portrait);
  useEffect(() => {
    if (portrait) {
      // eslint-disable-next-line no-undef
      const image = new Image();

      image.src = portrait;

      image.onload = () => {
        setIsLoaded(true);
      };
    }
  }, [portrait]);

  // Its content warning (row 122). A post with a photo, a GIF, a video or a
  // sound has the warning over that, said once, over the first part of it
  // shown, and its words shown. Any other, an article with its cover too,
  // has it over its words, and the rest only blurred. One View opens all.
  const warned = useWarning(medium);
  const media = warnings.hasMedia(medium);
  const hasPictures = Boolean(cover || coverUrl || hasSlides || portrait || elsewhere ||
    isRemoved);

  return {
    portrait,
    elsewhere,
    content,
    coverUrl,
    hasSlides,
    isRemoved,
    isLoaded,
    warned,
    media,
    // Where the warning is: over the pictures, or over what plays, a video
    // or a sound, where there are no pictures. Elsewhere only blurred.
    coversPictures: media && hasPictures,
    coversPlaying: media && !hasPictures,
    isLong: kinds.isLong(medium),
  };
};

export default useMediumRead;
