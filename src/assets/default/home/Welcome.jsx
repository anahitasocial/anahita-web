import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';

import WelcomeIcon from '@mui/icons-material/WavingHandOutlined';
import AsideIcon from '@mui/icons-material/AlternateEmail';
import FediverseIcon from '@mui/icons-material/Hub';

import BlueskyIcon from '../../../components/BlueskyIcon';

// Which network a link to a handle is on, by its picture, or none.
const networkIcon = (address = '') => {
  if (address.startsWith('https://bsky.app/')) {
    return BlueskyIcon;
  }
  return /^(https:\/\/[^/]+)?\/@/.test(address) ? FediverseIcon : null;
};

// A line of a list in Markdown. One that leads to a handle is a row of its
// own, the network's picture beside its name and the handle, as in
// `- **Bluesky** [@somebody](https://bsky.app/profile/somebody)`.
const Item = ({ node, children }) => {
  const link = node.children.find((each) => {
    return each.tagName === 'a';
  });
  const Icon = networkIcon(link && link.properties.href);

  if (!Icon) {
    return <li>{children}</li>;
  }
  return (
    <Box
      component="li"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        '& + li': { mt: 2 },
      }}
    >
      <Icon sx={{ color: 'text.secondary', flexShrink: 0 }} />
      <Box sx={{ minWidth: 0 }}>{children}</Box>
    </Box>
  );
};

Item.propTypes = {
  node: PropTypes.object.isRequired,
  children: PropTypes.node,
};

// One part of a theme's words: a small icon, a title and a few lines, as
// the columns under it are. Beside the rest, a list has no bullets: it is
// rows of its own.
const Part = ({
  Icon,
  markdown,
  size,
  rows = false,
}) => {
  return (
    <Grid size={size}>
      <Box sx={{ color: 'primary.main', display: 'flex', mb: 2 }}>
        <Icon />
      </Box>
      <Box
        sx={{
          '& > :first-of-type': { mt: 0 },
          '& > :last-child': { mb: 0 },
          '& h1, & h2, & h3': {
            typography: 'subtitle1', fontWeight: 500, mt: 3, mb: 1,
          },
          '& p, & li': { typography: 'body2', color: 'text.secondary' },
          '& p': { mt: 0, mb: 2 },
          '& a': { color: 'primary.main', overflowWrap: 'anywhere' },
          '& img': { maxWidth: '100%', borderRadius: 2 },
          ...(rows && {
            '& ul': { listStyle: 'none', p: 0, m: 0 },
            '& li strong': {
              display: 'block',
              typography: 'caption',
              color: 'text.secondary',
            },
            '& li a': { textDecoration: 'none' },
            '& li a:hover': { textDecoration: 'underline' },
          }),
        }}
      >
        <ReactMarkdown remarkPlugins={[gfm]} components={{ li: Item }}>
          {markdown}
        </ReactMarkdown>
      </Box>
    </Grid>
  );
};

Part.propTypes = {
  Icon: PropTypes.elementType.isRequired,
  markdown: PropTypes.string.isRequired,
  size: PropTypes.object.isRequired,
  rows: PropTypes.bool,
};

// A theme's own words on the home page (`pages/home.md`), under the same
// hairline as the parts below them and on their grid: three columns of the
// four, no wider than they are read. What follows a `---` is the fourth, a
// few lines beside them, under the fourth column below.
const Welcome = ({ markdown }) => {
  const [words, aside] = markdown.split(/^---+\s*$/m);

  return (
    <Grid
      container
      component="section"
      columnSpacing={4}
      rowSpacing={5}
      sx={{
        mt: { xs: 8, md: 12 },
        pt: { xs: 5, md: 6 },
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <Part Icon={WelcomeIcon} markdown={words} size={{ xs: 12, md: 9 }} />
      {aside && <Part Icon={AsideIcon} markdown={aside} size={{ xs: 12, md: 3 }} rows />}
    </Grid>
  );
};

Welcome.propTypes = {
  markdown: PropTypes.string.isRequired,
};

export default Welcome;
