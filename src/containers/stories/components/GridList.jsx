import React from 'react';
import { Img } from 'react-image';
import PropTypes from 'prop-types';
import { withStyles } from 'tss-react/mui';
import CircularProgress from '@mui/material/CircularProgress';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import Link from '@mui/material/Link';
import MediaType from '../../proptypes/Media';
import utils from '../../utils';

const {
  getURL,
  getPortraitURL,
} = utils.node;

const styles = (theme) => {
  return {
    // v5's ImageList is a CSS grid, which can't show 1.1 columns; lay the
    // strip out as a row that scrolls sideways instead.
    imageList: {
      display: 'flex',
      flexWrap: 'nowrap',
      overflowX: 'auto',
      // Promote the list into his own layer on Chrome.
      // This cost memory but helps keeping high FPS.
      transform: 'translateZ(0)',
    },
    item: {
      flex: '0 0 91%',
    },
    title: {
      color: theme.palette.white,
    },
    titleBar: {
      background:
        'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
    },
  };
};

const SingleLineImageList = (props) => {
  const { classes, photos } = props;

  return (
    <ImageList
      className={classes.imageList}
      gap={1}
      rowHeight={320}
    >
      {photos.map((photo) => {
        const src = getPortraitURL(photo);
        const url = getURL(photo);
        return (
          <ImageListItem
            key={`gridlist-photo-${photo.id}`}
            className={classes.item}
          >
            <Link href={url}>
              <Img
                src={src}
                alt={photo.name}
                loader={<CircularProgress />}
              />
            </Link>
            {photo.name &&
            <ImageListItemBar
              title={photo.name}
              classes={{
                root: classes.titleBar,
                title: classes.title,
              }}
            />}
          </ImageListItem>
        );
      })}
    </ImageList>
  );
};

SingleLineImageList.propTypes = {
  classes: PropTypes.object.isRequired,
  photos: PropTypes.arrayOf(MediaType.isRequired).isRequired,
};

export default withStyles(SingleLineImageList, styles);
