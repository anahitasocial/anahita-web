import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import FollowIcon from '@mui/icons-material/Diversity3Outlined';
import FeedsIcon from '@mui/icons-material/TuneOutlined';
import YoursIcon from '@mui/icons-material/LockPersonOutlined';
import PeopleIcon from '@mui/icons-material/PeopleOutlined';
import GroupsIcon from '@mui/icons-material/GroupsOutlined';
import HashtagsIcon from '@mui/icons-material/Tag';
import AboutIcon from '@mui/icons-material/InfoOutlined';

import HeaderMeta from '../../../components/HeaderMeta';
import i18n from '../../../languages';
import Hero from './Hero';

// What there is to do here, said in three cards. Each is true of any
// installation, whatever it is for.
const REASONS = [
  { key: 'follow', Icon: FollowIcon },
  { key: 'feeds', Icon: FeedsIcon },
  { key: 'yours', Icon: YoursIcon },
];

// What somebody who is not signed in may look at.
const PLACES = [
  { key: 'people', to: '/people', Icon: PeopleIcon },
  { key: 'groups', to: '/groups', Icon: GroupsIcon },
  { key: 'hashtags', to: '/hashtags', Icon: HashtagsIcon },
  { key: 'about', to: '/about', Icon: AboutIcon },
];

// The home page of somebody who is not signed in.
//
// It is about this installation and not about Anahita: its name, what its
// operator says it is, how many are on it, and the ways in. Then what can
// be done on it, and what may be looked at without a profile. That it runs
// on Anahita is one line at the foot.
//
// A members-only installation never draws this: routes/MembersOnlyGate
// answers for every page there.
const Home = ({
  nodeInfo = null,
}) => {
  const {
    usage = {},
    metadata = {},
    protocols = [],
    openRegistrations = false,
  } = nodeInfo || {};

  const name = metadata.nodeName || process.env.REACT_APP_NAME || '';
  const description = metadata.nodeDescription || process.env.REACT_APP_DESCRIPTION || '';

  return (
    <Box>
      <HeaderMeta />
      <Hero
        name={name}
        description={description}
        people={Number((usage.users || {}).total) || 0}
        posts={Number(usage.localPosts) || 0}
        federated={(protocols || []).includes('activitypub')}
        canJoin={Boolean(openRegistrations)}
      />

      <Grid container spacing={2} sx={{ mt: 2 }}>
        {REASONS.map(({ key, Icon }) => {
          return (
            <Grid key={key} size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Avatar sx={{ bgcolor: 'primary.main', mb: 2 }}>
                    <Icon />
                  </Avatar>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {i18n.t(`home:guest.reasons.${key}.title`)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {i18n.t(`home:guest.reasons.${key}.body`)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="h6" component="h3" gutterBottom>
          {i18n.t('home:guest.lookAround')}
        </Typography>
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{ justifyContent: 'center', flexWrap: 'wrap' }}
        >
          {PLACES.map(({ key, to, Icon }) => {
            return (
              <Button
                key={key}
                component={RouterLink}
                to={to}
                startIcon={<Icon />}
              >
                {i18n.t(`home:guest.places.${key}`)}
              </Button>
            );
          })}
        </Stack>
      </Box>

      <Typography
        variant="body2"
        color="textSecondary"
        align="center"
        sx={{ mt: 6, mb: 2 }}
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
};

const mapStateToProps = (state) => {
  return {
    nodeInfo: state.app.nodeInfo,
  };
};

export default connect(
  mapStateToProps,
)(Home);
