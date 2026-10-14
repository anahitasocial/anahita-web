import React from 'react';
import PropTypes from 'prop-types';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

// The title of an article, a topic or a photo on a card in a list: one size
// everywhere, a little larger and bolder than the text under it, in the
// text's own colour, and a link to the post, not underlined: the card's
// title and text open the post when clicked (utils/openOnClick.js).
// It is a heading for screen readers, but drawn to sit with the card, not
// above it.
const PostTitle = ({ children, href = '', lang = '' }) => {
  return (
    <Typography
      variant="h2"
      dir="auto"
      lang={lang && lang !== 'und' ? lang : undefined}
      sx={{
        fontSize: { xs: 18, sm: 20 },
        fontWeight: 600,
        lineHeight: 1.3,
        mb: 1,
        overflowWrap: 'anywhere',
      }}
    >
      {href ?
        <Link href={href} color="inherit" underline="none">
          {children}
        </Link> :
        children}
    </Typography>
  );
};

PostTitle.propTypes = {
  children: PropTypes.node.isRequired,
  // Where the post is read, when the title is to lead there.
  href: PropTypes.string,
  // The post's language.
  lang: PropTypes.string,
};

export default PostTitle;
