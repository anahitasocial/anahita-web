import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'tss-react/mui';

import Grid from '@mui/material/Grid';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import MediumType from '../../../../proptypes/Medium';
import photoFiles from '../../../../utils/photoFiles';
import { useWarning } from '../../../../components/WarningCover';
import Details from './Details';
import MediaPane from './MediaPane';
import styles from './styles';
import usePortrait from './usePortrait';
import useSwipe from './useSwipe';

// What scrolls, for Cited by's infinite scroll: the side panel beside the
// picture, or the whole lightbox where the two are stacked.
const ROOT_ID = 'medium-stepper-root';
const DETAILS_ID = 'medium-stepper-details';

// A post in the lightbox: its picture or video in a pane, and the post
// beside it, or under it on a narrow screen. Where it has neither, the post
// alone, in the middle.
//
// What the picture does, found, zoomed and panned, is usePortrait's; how
// it is swiped through is useSwipe's. MediaPane and Details draw them.
const MediumStepperLightboxDefault = ({
  classes,
  medium,
  fileIndex = 0,
  handleFileIndex = null,
  actions,
  menu,
  stats,
  locations,
  replies,
  editing,
  form,
  hasNext,
  hasPrev,
  handleNext,
  handlePrev,
}) => {
  const isStacked = useMediaQuery(useTheme().breakpoints.down('md'));
  const fileCount = photoFiles.countOf(medium);
  // A post with several images shows them as a row to swipe through.
  const hasRow = fileCount > 1;
  // Its content warning (row 122): a veil over the picture, its words
  // blurred, until View; each post of the theatre behind its own.
  const warned = useWarning(medium);

  const picture = usePortrait({ medium, fileIndex });
  const swipe = useSwipe({
    medium,
    fileIndex,
    fileCount,
    hasRow,
    isZoomed: picture.isZoomed,
    handleFileIndex,
    hasNext,
    hasPrev,
    handleNext,
    handlePrev,
  });

  const { hasPortrait } = picture;
  const hasPicture = hasPortrait || Boolean(medium && medium.video);

  return (
    <div className={classes.root} id={ROOT_ID}>
      <Grid container>
        <MediaPane
          classes={classes}
          medium={medium}
          fileIndex={fileIndex}
          fileCount={fileCount}
          hasRow={hasRow}
          warned={warned}
          picture={picture}
          swipe={swipe}
          hasNext={hasNext}
          hasPrev={hasPrev}
          handleNext={handleNext}
          handlePrev={handlePrev}
        />
        <Grid size={{ xs: 12, md: hasPicture ? 4 : 12 }}>
          <div className={classes.details} id={DETAILS_ID}>
            <Details
              classes={classes}
              medium={medium}
              warned={warned}
              hasPicture={hasPicture}
              hasPortrait={hasPortrait}
              actions={actions}
              menu={menu}
              stats={stats}
              locations={locations}
              replies={replies}
              editing={editing}
              form={form}
              hasNext={hasNext}
              hasPrev={hasPrev}
              handleNext={handleNext}
              handlePrev={handlePrev}
              scrollableTarget={isStacked ? ROOT_ID : DETAILS_ID}
            />
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

MediumStepperLightboxDefault.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.node,
  stats: PropTypes.node,
  menu: PropTypes.node,
  medium: MediumType.isRequired,
  // Which image of a post with several is on show.
  fileIndex: PropTypes.number,
  // Told which image has been swiped to.
  handleFileIndex: PropTypes.func,
  locations: PropTypes.node,
  // The thread of replies under the post.
  replies: PropTypes.node,
  form: PropTypes.node,
  editing: PropTypes.bool,
  hasNext: PropTypes.bool.isRequired,
  hasPrev: PropTypes.bool.isRequired,
  handleNext: PropTypes.func.isRequired,
  handlePrev: PropTypes.func.isRequired,
};

export default withStyles(MediumStepperLightboxDefault, styles);
