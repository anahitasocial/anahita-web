import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import PeopleIcon from '@mui/icons-material/PeopleOutlined';
import PostsIcon from '@mui/icons-material/ForumOutlined';
import FediverseIcon from '@mui/icons-material/Hub';

import BlueskyIcon from '../../../components/BlueskyIcon';
import api from '../../../api';
import i18n from '../../../languages';

// One fact about the site in the line under the buttons: a small icon and
// a few words, in the colour of what explains.
const Fact = ({ Icon, children }) => {
  return (
    <Box
      component="li"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        color: 'text.secondary',
        whiteSpace: 'nowrap',
      }}
    >
      <Icon sx={{ fontSize: 18 }} />
      <Typography variant="body2" component="span">
        {children}
      </Typography>
    </Box>
  );
};

Fact.propTypes = {
  Icon: PropTypes.elementType.isRequired,
  children: PropTypes.node.isRequired,
};

// The top of the page somebody sees before they sign in: what this site is
// called, what it says of itself, and the two ways in. Nothing behind it:
// the page's own background, and room.
//
// All of it is the installation's own, from NodeInfo: its logo, name and
// description as its operator set them, how many people are on it, and
// whether a profile can be made at all. The build's name and description
// stand in until that answer has arrived, or where it never does.
const HomeHero = ({
  logo = '',
  name,
  description,
  people = 0,
  posts = 0,
  federated = false,
  onBluesky = false,
  canJoin = false,
}) => {
  const format = (n) => {
    return n.toLocaleString(i18n.language);
  };

  return (
    <Box component="section" sx={{ textAlign: 'center' }}>
      {logo &&
        <Box
          component="img"
          src={logo}
          alt=""
          sx={{
            display: 'block', width: 72, height: 72, mx: 'auto',
          }}
        />}
      <Typography
        variant="h1"
        sx={{
          mt: 3,
          fontSize: { xs: 40, md: 56 },
          fontWeight: 500,
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          overflowWrap: 'anywhere',
        }}
      >
        {name}
      </Typography>
      {description &&
        <Typography
          variant="body1"
          color="textSecondary"
          component="p"
          sx={{
            fontSize: { xs: 18, md: 20 },
            lineHeight: 1.5,
            maxWidth: 560,
            mx: 'auto',
            mt: 2,
          }}
        >
          {description}
        </Typography>}

      {/* Side by side, and as wide as each other. */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ maxWidth: 400, mx: 'auto', mt: 5 }}
      >
        <Button
          variant="contained"
          size="large"
          fullWidth
          disableElevation
          sx={{ whiteSpace: 'nowrap' }}
          onClick={() => {
            return api.session.login();
          }}
        >
          {i18n.t('home:guest.signIn')}
        </Button>
        {canJoin &&
          <Button
            variant="outlined"
            size="large"
            fullWidth
            sx={{ whiteSpace: 'nowrap' }}
            onClick={() => {
              return api.session.signup();
            }}
          >
            {i18n.t('home:guest.join')}
          </Button>}
      </Stack>

      {(people > 0 || posts > 0 || federated || onBluesky) &&
        <Box
          component="ul"
          sx={{
            listStyle: 'none',
            p: 0,
            m: 0,
            mt: 4,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            columnGap: 3,
            rowGap: 1,
          }}
        >
          {people > 0 &&
            <Fact Icon={PeopleIcon}>
              {i18n.t('home:guest.people', { count: people, formatted: format(people) })}
            </Fact>}
          {posts > 0 &&
            <Fact Icon={PostsIcon}>
              {i18n.t('home:guest.posts', { count: posts, formatted: format(posts) })}
            </Fact>}
          {federated &&
            <Fact Icon={FediverseIcon}>
              {i18n.t('home:guest.federated')}
            </Fact>}
          {onBluesky &&
            <Fact Icon={BlueskyIcon}>
              {i18n.t('home:guest.bluesky')}
            </Fact>}
        </Box>}
    </Box>
  );
};

HomeHero.propTypes = {
  // The site's logo, from the server or the active theme (utils/siteLogo).
  logo: PropTypes.string,
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  people: PropTypes.number,
  posts: PropTypes.number,
  // Whether people here can be followed from other servers.
  federated: PropTypes.bool,
  onBluesky: PropTypes.bool,
  // Whether somebody may make a profile without being invited.
  canJoin: PropTypes.bool,
};

export default HomeHero;
