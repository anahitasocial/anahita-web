import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, Navigate, useParams } from 'react-router-dom';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';

import AdminIcon from '@mui/icons-material/AdminPanelSettings';

import HeaderMeta from '../../components/HeaderMeta';
import i18n from '../../languages';
import PersonType from '../../proptypes/Person';

import SignupRequests from '../auth/SignupRequests';
import Invites from '../auth/Invites';
import Accounts from './Accounts';
import Reports from './Reports';

import tabs from './tabs';

const SITE_NAME = process.env.REACT_APP_NAME;

// The page behind each tab.
const PANELS = {
  reports: Reports,
  'signup-requests': SignupRequests,
  invites: Invites,
  accounts: Accounts,
};

// The administration area: one home for the pages only administrators
// use, where each used to have its own entry in the left menu.
//
// The tab is part of the address (/admin/<tab>), not local state, so a
// notification email can link straight to the tab it is about and the
// back button moves between tabs.
//
// Which tabs appear depends on who is looking: see ./tabs. The pages
// themselves still check their own permission, so this file decides what
// is offered, not what is allowed.
const Admin = ({
  viewer,
  counts = {},
}) => {
  const { tab } = useParams();
  const available = tabs.visibleTabs(viewer);

  if (available.length === 0) {
    return (
      <Container maxWidth="sm">
        <HeaderMeta title={`${i18n.t('admin:cTitle')} - ${SITE_NAME}`} />
        <Typography variant="h6" gutterBottom>
          {i18n.t('admin:restricted.cTitle')}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {i18n.t('admin:restricted.cDescription')}
        </Typography>
      </Container>
    );
  }

  const current = available.find((item) => {
    return item.key === tab;
  });

  // No tab named, one that does not exist, or one this viewer may not
  // see: the first one they may.
  if (!current) {
    return <Navigate to={`/admin/${available[0].key}`} replace />;
  }

  const Panel = PANELS[current.key];

  return (
    <>
      <HeaderMeta title={`${i18n.t('admin:cTitle')} - ${SITE_NAME}`} />
      <Box sx={{ mb: 2 }}>
        <Card>
          <CardHeader
            avatar={
              <Avatar>
                <AdminIcon />
              </Avatar>
            }
            title={i18n.t('admin:cTitle')}
            subheader={i18n.t('admin:cDescription')}
            slotProps={{
              title: { variant: 'h5' },
            }}
          />
          <Divider />
          <Tabs
            variant="scrollable"
            scrollButtons
            value={current.key}
            aria-label={i18n.t('admin:cTitle')}
            allowScrollButtonsMobile
          >
            {available.map((item) => {
              const waiting = item.count ? Number(counts[item.count]) || 0 : 0;
              const title = i18n.t(item.title);

              return (
                <Tab
                  key={item.key}
                  value={item.key}
                  component={Link}
                  to={`/admin/${item.key}`}
                  label={waiting > 0 ?
                    i18n.t('admin:tabWithCount', { title, count: waiting }) :
                    title}
                />
              );
            })}
          </Tabs>
        </Card>
      </Box>
      {/* embedded: the panel drops its own side padding, so it lines up
          with the card above it. */}
      <Panel embedded />
    </>
  );
};

Admin.propTypes = {
  viewer: PersonType.isRequired,
  counts: PropTypes.objectOf(PropTypes.number),
};

const mapStateToProps = (state) => {
  const { viewer } = state.session;
  const { counts } = state.admin;
  return { viewer, counts };
};

export default connect(
  mapStateToProps,
)(Admin);
