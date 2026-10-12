import React from 'react';
import PropTypes from 'prop-types';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import PeopleIcon from '@mui/icons-material/PeopleOutlined';
import PostsIcon from '@mui/icons-material/ForumOutlined';
import FediverseIcon from '@mui/icons-material/Hub';

import api from '../../../api';
import i18n from '../../../languages';
import appLogo from '../media/logo';

// The top of the page somebody sees before they sign in: what this site is
// called, what it says of itself, and the two ways in.
//
// All of it is the installation's own, from NodeInfo: its name and
// description as its operator set them, how many people are on it, and
// whether a profile can be made at all. The build's name and description
// stand in until that answer has arrived, or where it never does.
const HomeHero = ({
  name,
  description,
  people = 0,
  posts = 0,
  federated = false,
  canJoin = false,
}) => {
  const { color: logo } = appLogo;

  return (
    <Box
      sx={(theme) => {
        return {
          borderRadius: 4,
          px: 2,
          py: { xs: 6, md: 10 },
          textAlign: 'center',
          background: `linear-gradient(160deg, ${alpha(theme.palette.primary.main, 0.16)} 0%, ${alpha(theme.palette.secondary.main, 0.10)} 100%)`,
        };
      }}
    >
      <Avatar
        src={logo}
        alt=""
        sx={{
          width: 120,
          height: 120,
          mx: 'auto',
          mb: 3,
          border: '2px solid',
          borderColor: 'background.paper',
          boxShadow: 3,
        }}
      />
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: 40, md: 56 },
          fontWeight: 600,
          overflowWrap: 'anywhere',
        }}
      >
        {name}
      </Typography>
      {description &&
        <Typography
          variant="h2"
          color="textSecondary"
          sx={{
            fontSize: { xs: 18, md: 22 },
            fontWeight: 400,
            maxWidth: 640,
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
        sx={{ maxWidth: 440, mx: 'auto', mt: 4 }}
      >
        <Button
          variant="contained"
          size="large"
          fullWidth
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
            onClick={() => {
              return api.session.signup();
            }}
          >
            {i18n.t('home:guest.join')}
          </Button>}
      </Stack>

      {(people > 0 || posts > 0 || federated) &&
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{ justifyContent: 'center', flexWrap: 'wrap', mt: 4 }}
        >
          {people > 0 &&
            <Chip
              icon={<PeopleIcon />}
              label={i18n.t('home:guest.people', { count: people, formatted: people.toLocaleString() })}
              variant="outlined"
            />}
          {posts > 0 &&
            <Chip
              icon={<PostsIcon />}
              label={i18n.t('home:guest.posts', { count: posts, formatted: posts.toLocaleString() })}
              variant="outlined"
            />}
          {federated &&
            <Chip
              icon={<FediverseIcon />}
              label={i18n.t('home:guest.federated')}
              variant="outlined"
            />}
        </Stack>}
    </Box>
  );
};

HomeHero.propTypes = {
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  people: PropTypes.number,
  posts: PropTypes.number,
  // Whether people here can be followed from other servers.
  federated: PropTypes.bool,
  // Whether somebody may make a profile without being invited.
  canJoin: PropTypes.bool,
};

export default HomeHero;
