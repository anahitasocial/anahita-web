import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Container from '@mui/material/Container';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';

import AvatarStep from './Steps/Avatar';
import FeaturedStep from './Steps/Featured';
import ProfileStep from './Steps/Profile';
import featured from './featured';
import Progress from '../../components/Progress';
import ViewerType from '../../proptypes/Viewer';
import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';
import { Onboarding as ONBOARDING } from '../../constants';

const { STEPS } = ONBOARDING;

// Where somebody with an incomplete profile is sent after the agreements:
// avatar, then name, bio and pronouns, then the accounts the installation
// features, then the dashboard.
//
// AN EMPTY LIST SKIPS ITS STEP. Whatever the steps need is fetched once, up
// front, and a step whose list comes back empty — or fails to come back — is
// left out, so the stepper shows only steps that will happen. Avatar and
// profile depend on nothing, so there is always at least one step: a fresh
// installation with nothing to offer goes avatar, profile, dashboard.
//
// Every step can be skipped. Skipping moves to the next; skipping the last one
// finishes, and finishing — however it is reached — is what stops the gate
// sending this person back here.

// loadSteps decides which steps this person gets, and fetches what the list
// steps show. It never rejects: each list fails on its own, as empty.
const loadSteps = (viewer) => {
  return featured.loadFeatured(viewer).then((featuredList) => {
    const steps = [STEPS.AVATAR, STEPS.PROFILE];

    if (featuredList.actors.length > 0) {
      steps.push(STEPS.FEATURED);
    }

    return { steps, featured: featuredList };
  });
};

const Onboarding = ({
  viewer,
  refreshSession,
  followActor,
  alertError,
}) => {
  const navigate = useNavigate();
  const [steps, setSteps] = useState(null);
  const [featuredList, setFeaturedList] = useState({ actors: [], inviterId: null });
  const [active, setActive] = useState(0);
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadSteps(viewer).then((result) => {
      if (!cancelled) {
        setFeaturedList(result.featured);
        setSteps(result.steps);
      }
    });

    return () => { cancelled = true; };
    // On the id, not the viewer. Refreshing the session after an upload
    // replaces the viewer object, and must not rebuild the steps under
    // somebody mid-flow.
  }, [viewer.id]);

  // Record, refresh, then leave — in that order. Navigating before the
  // session carries onboardedAt would have the gate send this person straight
  // back here.
  const finish = () => {
    setFinishing(true);

    api.onboarding.complete()
      .then(() => { return refreshSession(); })
      .then(() => { navigate('/', { replace: true }); })
      .catch(() => {
        setFinishing(false);
        alertError(i18n.t('onboarding:prompts.error'));
      });
  };

  const next = () => {
    if (active >= steps.length - 1) {
      finish();
      return;
    }

    setActive(active + 1);
  };

  if (!steps || finishing) {
    return <Progress />;
  }

  const isLast = active === steps.length - 1;

  const stepProps = {
    viewer,
    primaryLabel: isLast
      ? i18n.t('onboarding:actions.finish')
      : i18n.t('onboarding:actions.continue'),
    onNext: next,
    onSkip: next,
    refreshSession,
    alertError,
  };

  return (
    <Container maxWidth="sm">
      <Card variant="outlined">
        <CardHeader
          title={i18n.t('onboarding:cTitle', { name: viewer.name || viewer.alias })}
          subheader={i18n.t('onboarding:intro')}
        />
        {steps.length > 1 &&
          <Box sx={{ px: 1 }}>
            <Stepper activeStep={active} alternativeLabel>
              {steps.map((key) => {
                return (
                  <Step key={key}>
                    <StepLabel>{i18n.t(`onboarding:steps.${key}`)}</StepLabel>
                  </Step>
                );
              })}
            </Stepper>
          </Box>}
        {steps[active] === STEPS.AVATAR && <AvatarStep {...stepProps} />}
        {steps[active] === STEPS.PROFILE && <ProfileStep {...stepProps} />}
        {steps[active] === STEPS.FEATURED &&
          <FeaturedStep
            {...stepProps}
            actors={featuredList.actors}
            inviterId={featuredList.inviterId}
            followActor={followActor}
          />}
      </Card>
    </Container>
  );
};

Onboarding.propTypes = {
  viewer: ViewerType.isRequired,
  refreshSession: PropTypes.func.isRequired,
  followActor: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return { viewer: state.session.viewer };
};

const mapDispatchToProps = (dispatch) => {
  return {
    refreshSession: () => { return dispatch(actions.session.read()); },
    followActor: (params) => { return dispatch(actions.socialgraph.follow(params)); },
    alertError: (message) => { return dispatch(actions.app.alert.error(message)); },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Onboarding);
