import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet-async';

import Grid from '@mui/material/Grid';

import CompleteProfileCard from './CompleteProfileCard';
import Composers from '../media/Composer';
import FeedBrowse from '../feed/Leaders';
import actions from '../../actions';
import i18n from '../../languages';

import PersonType from '../../proptypes/Person';

// Home, for somebody signed in: a place to post, and the feed of the people
// and groups they follow.
//
// This is the page that will hold more than one feed. Custom feeds (the
// roadmap's item 14) become tabs here beside the one there is now, which is
// why it lives under `feeds` and is not called a dashboard.
const FeedsPage = ({
  readPerson,
  viewer,
  person,
}) => {
  useEffect(() => {
    readPerson(viewer.alias);
  }, [readPerson, viewer.alias]);

  return (
    <>
      <Helmet>
        <title>{i18n.t('home:cTitle')}</title>
      </Helmet>
      <Grid
        container
        sx={{ justifyContent: 'center' }}
      >
        <Grid size={{ xs: 12, md: 8 }}>
          <CompleteProfileCard viewer={viewer} />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          {person.id &&
            <Composers actor={person} />}
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <FeedBrowse />
        </Grid>
      </Grid>
    </>
  );
};

FeedsPage.propTypes = {
  readPerson: PropTypes.func.isRequired,
  viewer: PersonType.isRequired,
  person: PersonType.isRequired,
};

const mapStateToProps = (state) => {
  const {
    viewer,
  } = state.session;

  const {
    people: {
      current: person,
    },
  } = state.people;

  return {
    viewer,
    person,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    readPerson: (alias) => {
      return dispatch(actions.people.read(alias, 'people'));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(FeedsPage);
