import React from 'react';
import { connect } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Particles from 'react-tsparticles';

import IconButton from '@mui/material/IconButton';

import GithubIcon from '@mui/icons-material/GitHub';
import FacebookIcon from '@mui/icons-material/Facebook';
import WebsiteIcon from '@mui/icons-material/Web';

import HeaderMeta from '../../../components/HeaderMeta';
import Hero from './Hero';

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

const Home = () => {
  const theme = useTheme();
  const { width: winWidth } = getWindowDimensions();

  return (
    <>
      <HeaderMeta />
      <Particles
        params={{
          particles: {
            number: {
              value: Math.ceil(winWidth / 8),
            },
            size: {
              value: 2,
            },
            move: {
              speed: 0.1,
            },
            lineLinked: {
              color: theme.palette.primary.main,
              opacity: 0.3,
            },
            shape: {
              stroke: {
                color: theme.palette.primary.main,
                opacity: 0.3,
              },
            },
          },
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          backgroundColor: 'transparent',
          zIndex: -10,
        }}
      />
      <Hero />
      <Typography align="center" variant="h6">
        Follow #Anahita
      </Typography>
      <Box align="center">
        <IconButton
          href="https://www.anahita.io"
          target="_blank"
          aria-label="website"
          title="Anahita Knowlege Networking Platform & Framework"
          size="large"
        >
          <WebsiteIcon />
        </IconButton>
        <IconButton
          href="https://github.com/anahitasocial/anahita"
          target="_blank"
          aria-label="github-server"
          title="Anahita Server"
          size="large"
        >
          <GithubIcon />
        </IconButton>
        <IconButton
          href="https://github.com/anahitasocial/anahita-react"
          target="_blank"
          aria-label="github-client"
          title="Anahita Client"
          size="large"
        >
          <GithubIcon />
        </IconButton>
        <IconButton
          href="https://www.facebook.com/anahita_io"
          target="_blank"
          aria-label="facebook"
          size="large"
        >
          <FacebookIcon />
        </IconButton>
      </Box>
    </>
  );
};

const mapStateToProps = () => {
  return {};
};

export default connect(
  mapStateToProps,
)(Home);
