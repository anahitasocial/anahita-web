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
import Hidden from '@mui/material/Hidden';
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
  whoami,
  readNodeInfo,
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
          <SearchBox />
          <div className={classes.grow} />
          {isAuthenticated && <NotificationButton viewer={viewer} />}
          <Viewer
            viewer={viewer}
            isAuthenticated={isAuthenticated}
          />
        </Toolbar>
      </AppBar>
      <nav className={classes.drawer}>
        <Hidden lgUp implementation="css">
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
          >
            {drawer()}
          </Drawer>
        </Hidden>
        <Hidden lgDown implementation="css">
          <Drawer
            classes={{
              paper: classes.drawerPaper,
            }}
            variant="permanent"
            open
          >
            {drawer()}
          </Drawer>
        </Hidden>
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
  viewer: ViewerType.isRequired,
  children: PropTypes.node.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  logout: PropTypes.func.isRequired,
  whoami: PropTypes.func.isRequired,
  readNodeInfo: PropTypes.func.isRequired,
  nodeInfo: NodeInfoType.isRequired,
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
    logout: () => {
      return dispatch(actions.session.deleteItem());
    },
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(App);
