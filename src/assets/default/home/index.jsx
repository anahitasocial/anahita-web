import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';

import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import FollowIcon from '@mui/icons-material/Diversity3Outlined';
import FeedsIcon from '@mui/icons-material/TuneOutlined';
import YoursIcon from '@mui/icons-material/LockPersonOutlined';
import NetworksIcon from '@mui/icons-material/Hub';
import PeopleIcon from '@mui/icons-material/PeopleOutlined';
import GroupsIcon from '@mui/icons-material/GroupsOutlined';
import HashtagsIcon from '@mui/icons-material/Tag';
import AboutIcon from '@mui/icons-material/InfoOutlined';

import BlueskyIcon from '../../../components/BlueskyIcon';
import HeaderMeta from '../../../components/HeaderMeta';
import i18n from '../../../languages';
import siteLogo from '../../../utils/siteLogo';
import Hero from './Hero';

// What there is to do here, said in three cards. Each is true of any
// installation, whatever it is for.
const REASONS = [
  { key: 'follow', Icon: FollowIcon },
  { key: 'feeds', Icon: FeedsIcon },
  { key: 'yours', Icon: YoursIcon },
];

// The other networks an installation can take part in, as it names them
// in NodeInfo, and which words say so: one, the other, or both.
const networksKey = (networks) => {
  const mastodon = networks.includes('activitypub');
  const bluesky = networks.includes('atproto');

  if (mastodon && bluesky) {
    return 'both';
  }
  if (mastodon) {
    return 'activitypub';
  }
  return bluesky ? 'atproto' : '';
};

// What somebody who is not signed in may look at.
const PLACES = [
  { key: 'people', to: '/people', Icon: PeopleIcon },
  { key: 'groups', to: '/groups', Icon: GroupsIcon },
  { key: 'hashtags', to: '/hashtags', Icon: HashtagsIcon },
  { key: 'about', to: '/about', Icon: AboutIcon },
];

// Anahita's own parts of the home page, for a theme with none of its own:
// what can be done here, and what may be looked at without a profile.
const AnahitasOwn = ({ reasons }) => {
  return (
    <>
      {/* What can be done here: side by side under a hairline, each a small
      icon, a title and a line, with no card around it. */}
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
        {reasons.map(({ key, Icon, icons = [Icon] }) => {
          return (
            <Grid
              key={key}
              size={{ xs: 12, sm: 6, md: 12 / reasons.length }}
            >
              <Stack direction="row" spacing={1} sx={{ color: 'primary.main', mb: 2 }}>
                {icons.map((Each, index) => {
                  // eslint-disable-next-line react/no-array-index-key
                  return <Each key={index} />;
                })}
              </Stack>
              <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 500 }}>
                {i18n.t(`home:guest.reasons.${key}.title`)}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {i18n.t(`home:guest.reasons.${key}.body`)}
              </Typography>
            </Grid>
          );
        })}
      </Grid>

      {/* What may be looked at without a profile: quiet tiles, each where
      it leads and a chevron. */}
      <Box component="section" sx={{ mt: { xs: 8, md: 12 } }}>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          {i18n.t('home:guest.lookAround')}
        </Typography>
        <Grid container spacing={2}>
          {PLACES.map(({ key, to, Icon }) => {
            return (
              <Grid key={key} size={{ xs: 12, sm: 6 }}>
                <ButtonBase
                  component={RouterLink}
                  to={to}
                  sx={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    gap: 2,
                    px: 2,
                    py: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 3,
                    color: 'text.primary',
                    transition: 'border-color 150ms',
                    '&:hover': { borderColor: 'text.secondary' },
                    '&:focus-visible': { outline: 2, outlineColor: 'primary.main', outlineOffset: 2 },
                  }}
                >
                  <Icon sx={{ color: 'text.secondary' }} />
                  <Typography variant="body1" component="span" noWrap sx={{ flexGrow: 1, textAlign: 'left' }}>
                    {i18n.t(`home:guest.places.${key}`)}
                  </Typography>
                  <ChevronRightIcon sx={{ color: 'text.secondary' }} />
                </ButtonBase>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </>
  );
};

AnahitasOwn.propTypes = {
  reasons: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
  })).isRequired,
};

// The home page of somebody who is not signed in: calm, with room around
// each part, in one column that is never wider than it is read.
//
// It is about this installation and not about Anahita: its name, what its
// operator says it is, how many are on it, and the ways in. Then what can
// be done on it, and what may be looked at without a profile. That it runs
// on Anahita is one line at the foot.
//
// A theme with a home page of its own in Markdown (`pages/home.md`) has it
// here in place of those parts, under the same name, description and ways
// in: a site says what it is for in its own words, and keeps the rest.
//
// A members-only installation never draws this: routes/MembersOnlyGate
// answers for every page there.
const Home = ({
  nodeInfo = null,
  themeLogo = null,
  homeMarkdown = null,
}) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [ownPage, setOwnPage] = useState('');

  useEffect(() => {
    if (!homeMarkdown) {
      return undefined;
    }
    let current = true;
    fetch(homeMarkdown).then((response) => {
      return response.text();
    }).then((text) => {
      if (current) {
        setOwnPage(text);
      }
    }).catch(() => {
      // Anahita's own parts stay in its place.
    });
    return () => {
      current = false;
    };
  }, [homeMarkdown]);

  const {
    usage = {},
    metadata = {},
    protocols = [],
    openRegistrations = false,
  } = nodeInfo || {};

  const name = metadata.nodeName || process.env.REACT_APP_NAME || '';
  const description = metadata.nodeDescription || process.env.REACT_APP_DESCRIPTION || '';

  // What the installation says it is part of. An older server says only
  // `protocols`.
  const networks = Array.isArray(metadata.networks) ? metadata.networks : (protocols || []);
  const partOf = networksKey(networks);

  // A fourth card, on an installation that is part of other networks:
  // which, by the names people know them by, and by what they speak.
  // The hub stands for the fediverse, and the butterfly for Bluesky: one,
  // the other, or both side by side.
  const networkIcons = [
    networks.includes('activitypub') && NetworksIcon,
    networks.includes('atproto') && BlueskyIcon,
  ].filter(Boolean);
  const reasons = partOf ?
    [...REASONS, { key: `networks.${partOf}`, icons: networkIcons }] :
    REASONS;

  return (
    <Box
      sx={{
        maxWidth: 960,
        mx: 'auto',
        px: { xs: 2, md: 3 },
        pt: { xs: 6, md: 12 },
        pb: 4,
      }}
    >
      <HeaderMeta />
      <Hero
        logo={siteLogo(nodeInfo, themeLogo, prefersDarkMode)}
        name={name}
        description={description}
        people={Number((usage.users || {}).total) || 0}
        posts={Number(usage.localPosts) || 0}
        federated={networks.includes('activitypub')}
        onBluesky={networks.includes('atproto')}
        canJoin={Boolean(openRegistrations)}
      />

      {ownPage ?
        <Box
          component="section"
          sx={{
            mt: { xs: 8, md: 12 },
            pt: { xs: 5, md: 6 },
            borderTop: 1,
            borderColor: 'divider',
            maxWidth: 680,
            mx: 'auto',
            '& h1, & h2': { typography: 'h6', mt: 4, mb: 1 },
            '& h3': {
              typography: 'subtitle1', fontWeight: 500, mt: 3, mb: 1,
            },
            '& p, & li': { typography: 'body1', color: 'text.secondary' },
            '& a': { color: 'primary.main' },
            '& img': { maxWidth: '100%', borderRadius: 2 },
          }}
        >
          <ReactMarkdown remarkPlugins={[gfm]}>
            {ownPage}
          </ReactMarkdown>
        </Box> :
        <AnahitasOwn reasons={reasons} />}

      <Typography
        variant="body2"
        color="textSecondary"
        align="center"
        sx={{ mt: { xs: 8, md: 12 } }}
      >
        {i18n.t('home:guest.runsOn')}
        {' '}
        <Link href="https://www.anahita.io" target="_blank" rel="noopener" underline="hover">
          Anahita
        </Link>
        {i18n.t('home:guest.runsOnAfter')}
      </Typography>
    </Box>
  );
};

Home.propTypes = {
  // The installation's own account of itself. Empty until it has answered.
  nodeInfo: PropTypes.object,
  // The active theme's logo, { color, white }, and its own home page in
  // Markdown, if it has one (containers/home).
  themeLogo: PropTypes.shape({
    color: PropTypes.string,
    white: PropTypes.string,
  }),
  homeMarkdown: PropTypes.string,
};

const mapStateToProps = (state) => {
  return {
    nodeInfo: state.app.nodeInfo,
  };
};

export default connect(
  mapStateToProps,
)(Home);
