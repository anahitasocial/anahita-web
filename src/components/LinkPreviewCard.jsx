import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import RemoveIcon from '@mui/icons-material/Close';

import { OutboundMark } from './SmartLink';
import i18n from '../languages';
import linkPreviews from '../utils/linkPreviews';

const clamp = (lines) => {
  return {
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    overflowWrap: 'anywhere',
  };
};

// The card for a link in a note: the page's picture, the site it is on,
// its title and a line about it. All of it is the link.
//
// It is as the page was when the note was written, and its picture is this
// installation's own copy, so drawing it asks nothing of the other site.
//
// `onRemove`, when given, is for a note being written: a way to post it
// without the card.
const LinkPreviewCard = ({
  preview = null,
  onRemove = null,
}) => {
  if (!preview || !preview.url || !preview.title) {
    return null;
  }

  const image = linkPreviews.imageOf(preview);
  const site = linkPreviews.siteOf(preview);

  return (
    <Box
      sx={{
        mt: 2,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Link
        href={preview.url}
        target="_blank"
        rel="noopener noreferrer nofollow"
        underline="none"
        color="inherit"
        sx={{ display: 'block' }}
      >
        {image &&
          <Box
            component="img"
            src={image}
            alt=""
            loading="lazy"
            sx={{
              width: '100%',
              aspectRatio: '1.91 / 1',
              objectFit: 'cover',
              display: 'block',
              borderBottom: 1,
              borderColor: 'divider',
            }}
          />}
        <Box sx={{ p: 2, pr: onRemove && !image ? 6 : 2 }}>
          {/* The site it is on, marked as a page that opens in a new tab. */}
          <Typography variant="caption" color="textSecondary" noWrap component="div">
            {site}
            <OutboundMark />
          </Typography>
          <Typography variant="subtitle2" dir="auto" sx={clamp(2)}>
            {preview.title}
          </Typography>
          {preview.description &&
            <Typography variant="body2" color="textSecondary" dir="auto" sx={clamp(2)}>
              {preview.description}
            </Typography>}
        </Box>
      </Link>
      {onRemove &&
        <IconButton
          size="small"
          onClick={onRemove}
          aria-label={i18n.t('linkPreviews:remove')}
          title={i18n.t('linkPreviews:remove')}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'background.paper',
            '&:hover': { bgcolor: 'background.paper' },
          }}
        >
          <RemoveIcon fontSize="small" />
        </IconButton>}
    </Box>
  );
};

LinkPreviewCard.propTypes = {
  preview: PropTypes.shape({
    url: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    siteName: PropTypes.string,
    image: PropTypes.string,
  }),
  onRemove: PropTypes.func,
};

export default LinkPreviewCard;
