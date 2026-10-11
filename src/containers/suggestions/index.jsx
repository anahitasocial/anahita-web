import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import SuggestionsIcon from '@mui/icons-material/PersonAddAlt1';

import useSuggestions from './useSuggestions';
import ActorCard from '../../components/ActorCard';
import BrowseHeader from '../../components/BrowseHeader';
import Masonry from '../../components/BreakpointMasonry';
import Progress from '../../components/Progress';
import ControlFollow from '../controls/Follow';
import actions from '../../actions';
import i18n from '../../languages';
import recommendations from '../../utils/recommendations';

const LIMIT = 30;

// The cards of one kind of suggestion.
const SuggestionsList = ({ kind, alertSuccess, alertError }) => {
  const {
    items,
    related,
    isLoading,
    isAbsent,
    dismiss,
  } = useSuggestions(kind, LIMIT);

  if (isLoading) {
    return <Progress />;
  }

  if (items.length === 0) {
    return (
      <Typography variant="body1" color="textSecondary" sx={{ p: 2 }}>
        {i18n.t(isAbsent ? 'recommendations:empty.person' : `recommendations:empty.${kind}`)}
      </Typography>
    );
  }

  const handleDismiss = (actor) => {
    dismiss(actor).then(() => {
      alertSuccess(i18n.t('recommendations:dismissed'));
    }).catch(() => {
      alertError(i18n.t('recommendations:failed'));
    });
  };

  return (
    <Masonry>
      {items.map((item) => {
        const { actor } = item;

        return (
          <Box key={`suggestion-${actor.id}`} sx={{ mb: 2 }}>
            {/* Why, above the profile it is said of. */}
            <Typography variant="body2" color="textSecondary" sx={{ px: 2, pb: 1 }}>
              {recommendations.reasonText(item, related, i18n.t.bind(i18n))}
            </Typography>
            <ActorCard
              actor={actor}
              action={[
                <Button
                  fullWidth
                  key={`suggestion-dismiss-${actor.id}`}
                  onClick={() => {
                    handleDismiss(actor);
                  }}
                >
                  {i18n.t('recommendations:dismiss')}
                </Button>,
                <ControlFollow
                  actor={actor}
                  key={`suggestion-follow-${actor.id}`}
                />,
              ]}
            />
          </Box>
        );
      })}
    </Masonry>
  );
};

SuggestionsList.propTypes = {
  kind: PropTypes.oneOf(recommendations.KINDS).isRequired,
  alertSuccess: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

// Suggestions: people and groups the viewer might follow, each with the
// reason it is suggested, to follow or to turn down. The open tab is in the
// address (`?kind=group`).
const SuggestionsPage = ({ alertSuccess, alertError }) => {
  const [params, setParams] = useSearchParams();
  const kind = params.get('kind') === 'group' ? 'group' : 'person';

  return (
    <>
      <Helmet>
        <title>{i18n.t('recommendations:cTitle')}</title>
      </Helmet>
      <Box sx={{ mb: 2 }}>
        <BrowseHeader
          icon={<SuggestionsIcon />}
          title={i18n.t('recommendations:cTitle')}
          subheader={i18n.t('recommendations:subheader')}
        />
      </Box>
      <Tabs
        value={kind}
        variant="fullWidth"
        onChange={(event, chosen) => {
          setParams(chosen === 'group' ? { kind: 'group' } : {});
        }}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        {recommendations.KINDS.map((each) => {
          return (
            <Tab
              key={each}
              value={each}
              label={i18n.t(`recommendations:kinds.${each}`)}
            />
          );
        })}
      </Tabs>
      <SuggestionsList
        key={kind}
        kind={kind}
        alertSuccess={alertSuccess}
        alertError={alertError}
      />
    </>
  );
};

SuggestionsPage.propTypes = {
  alertSuccess: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => {
  return {
    alertSuccess: (message) => {
      return dispatch(actions.app.alert.success(message));
    },
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
};

export default connect(null, mapDispatchToProps)(SuggestionsPage);
