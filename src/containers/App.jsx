import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import CssBaseline from '@mui/material/CssBaseline';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';

import IconButton from '@mui/material/IconButton';
import SearchBox from '../components/SearchBox';

import Viewer from '../components/AuthViewer';
import ViewerType from '../proptypes/Viewer';
import NodeInfoType from '../proptypes/NodeInfo';
import assets from '../assets';
import Alerts from './Alerts';
import MenuLogo from '../components/Logo';
import actions from '../actions';
import NotificationButton from './notifications/Button';
import adminTabs from './admin/tabs';
import visitor from '../utils/visitor';
import { Admin as ADMIN } from '../constants';

const drawerWidth = 240;
const { LeftMenu } = assets.navs;

// Apply some reset
const useStyles = makeStyles()((theme) => {
  return {
    root: {
      display: 'flex',
    },
    appBar: {
      [theme.breakpoints.up('lg')]: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
      },
    },
    grow: {
      flex: '1 1 auto',
    },
    menuButton: {
      marginRight: theme.spacing(2),
      [theme.breakpoints.up('lg')]: {
        display: 'none',
      },
    },
    drawer: {
      [theme.breakpoints.up('lg')]: {
        width: drawerWidth,
        flexShrink: 0,
      },
    },
    drawerPaper: {
      width: drawerWidth,
    },
    drawerHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: `0 ${theme.spacing(2)}`,
      ...theme.mixins.toolbar,
    },
    viewer: {
      display: 'flex',
    },
    appBarSpacer: theme.mixins.toolbar,
    content: {
      flexGrow: 1,
      overflow: 'auto',
      paddingBottom: theme.spacing(2),
    },
    // Below lg the page runs edge to edge; from lg up the Container's own
    // maxWidth and gutters take over.
    container: {
      [theme.breakpoints.down('lg')]: {
        paddingLeft: 0,
        paddingRight: 0,
      },
    },
  };
});

const App = ({
  children,
  isAuthenticated,
  viewer,
  nodeInfo,
  adminCounts,
  isShutOut = false,
  whoami,
  readNodeInfo,
  readAdminCounts,
  logout,
}) => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    whoami();
    readNodeInfo();
  }, []);

  // The number on the Administration menu entry. Read once it is known
  // that the viewer has an administration area, then every few minutes
  // and whenever the window comes back into focus, which is when
  // somebody returning to the tab wants it to be right.
  const hasAdminArea = isAuthenticated && adminTabs.canBrowse(viewer);

  useEffect(() => {
    if (!hasAdminArea) {
      return undefined;
    }

    readAdminCounts();

    const timer = window.setInterval(readAdminCounts, ADMIN.COUNTS_REFRESH_MS);
    window.addEventListener('focus', readAdminCounts);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', readAdminCounts);
    };
  }, [hasAdminArea]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleLogout = () => {
    logout()
      .then(() => {
        navigate('/');
      });
  };

  const drawer = () => {
    return (
      <>
        <div className={classes.drawerHeader}>
          <MenuLogo />
        </div>
        <Divider />
        <LeftMenu
          onLogoutClick={handleLogout}
          viewer={viewer}
          isAuthenticated={isAuthenticated}
          nodeInfo={nodeInfo}
          isShutOut={isShutOut}
          adminWaiting={adminTabs.waitingCount(viewer, adminCounts)}
          classNames={classes}
        />
        <Divider />
      </>
    );
  };

  const container = window !== undefined ? () => {
    return window.document.body;
  } : undefined;

  return (
    <div className={classes.root}>
      <CssBaseline />
      <Alerts />
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className={classes.menuButton}
            size="large"
          >
            <MenuIcon />
          </IconButton>
          {/* Nothing to search on a members-only site until signed in:
              the search would only be refused. */}
          {!isShutOut && <SearchBox />}
          <div className={classes.grow} />
          {isAuthenticated && <NotificationButton viewer={viewer} />}
          <Viewer
            viewer={viewer}
            isAuthenticated={isAuthenticated}
          />
        </Toolbar>
      </AppBar>
      <nav className={classes.drawer}>
        <Drawer
          container={container}
          variant="temporary"
          anchor={theme.direction === 'rtl' ? 'right' : 'left'}
          open={open}
          onClose={handleDrawerToggle}
          classes={{
            paper: classes.drawerPaper,
          }}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{ display: { xs: 'block', lg: 'none' } }}
        >
          {drawer()}
        </Drawer>
        <Drawer
          classes={{
            paper: classes.drawerPaper,
          }}
          variant="permanent"
          open
          sx={{ display: { xs: 'none', lg: 'block' } }}
        >
          {drawer()}
        </Drawer>
      </nav>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        {/*
          `children` must be rendered exactly once. Selecting the layout with
          two `Hidden implementation="css"` branches mounted the entire routed
          page twice — only hiding one copy with CSS — so every page fetched
          its data twice, each copy kept its own tab state, and every
          window-bound InfiniteScroll in the hidden copy went on paginating.
        */}
        <Container maxWidth="lg" className={classes.container}>
          {children}
        </Container>
      </main>
    </div>
  );
};

App.propTypes = {
  // A visitor on a members-only site: nothing to search or browse.
  isShutOut: PropTypes.bool,
  viewer: ViewerType.isRequired,
  children: PropTypes.node.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  logout: PropTypes.func.isRequired,
  whoami: PropTypes.func.isRequired,
  readNodeInfo: PropTypes.func.isRequired,
  readAdminCounts: PropTypes.func.isRequired,
  nodeInfo: NodeInfoType.isRequired,
  adminCounts: PropTypes.objectOf(PropTypes.number).isRequired,
};

const mapStateToProps = (state) => {
  const {
    nodeInfo,
  } = state.app;

  const {
    isAuthenticated,
    viewer,
  } = state.session;

  return {
    nodeInfo,
    isAuthenticated,
    viewer,
    adminCounts: state.admin.counts,
    // A visitor on a members-only site, who can be shown nothing.
    isShutOut: visitor.isShutOut(state),
  };
};

function mapDispatchToProps(dispatch) {
  return {
    whoami: () => {
      return dispatch(actions.session.read());
    },
    readNodeInfo: () => {
      return dispatch(actions.app.readNodeInfo());
    },
    readAdminCounts: () => {
      return dispatch(actions.admin.readCounts());
    },
    logout: () => {
      return dispatch(actions.session.deleteItem());
    },
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(App);
