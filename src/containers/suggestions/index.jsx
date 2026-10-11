import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import SuggestionsIcon from '@mui/icons-material/AutoAwesome';
import DismissIcon from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/TuneOutlined';

import useSuggestions from './useSuggestions';
import SuggestionWeightsDialog from './WeightsDialog';
import EventCard from '../events/Card';
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
        const why = recommendations.reasonText(item, related, i18n.t.bind(i18n), kind);
        // Not interested: an x at the top right of the card.
        const dismissButton = (
          <Tooltip title={i18n.t('recommendations:dismiss')}>
            <IconButton
              aria-label={i18n.t('recommendations:dismiss')}
              onClick={() => {
                handleDismiss(actor);
              }}
            >
              <DismissIcon />
            </IconButton>
          </Tooltip>
        );

        return (
          <Box key={`suggestion-${actor.id}`} sx={{ mb: 2 }}>
            {/* Why is said inside the card, under the name. An event has
                its own card, which leads to where it is answered, and is
                not followed from here. */}
            {kind === 'event' ?
              <EventCard
                actor={actor}
                note={why}
                headerAction={dismissButton}
              /> :
              <ActorCard
                actor={actor}
                note={why}
                headerAction={dismissButton}
                action={[
                  <ControlFollow
                    fullWidth
                    actor={actor}
                    key={`suggestion-follow-${actor.id}`}
                  />,
                ]}
              />}
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

// Suggestions: people, groups and events the viewer might follow, each with
// the reason it is suggested, to follow or to turn down. The open tab is in
// the address (`?kind=group`).
//
// The button beside the tabs opens what counts in the choosing, for the
// viewer to weigh for themselves. Saved, the list is read again.
const SuggestionsPage = ({ alertSuccess, alertError }) => {
  const [params, setParams] = useSearchParams();
  const asked = params.get('kind');
  const kind = recommendations.KINDS.includes(asked) ? asked : 'person';
  const [isTuning, setIsTuning] = useState(false);
  // Read again when the weights were changed.
  const [version, setVersion] = useState(0);

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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider',
          mb: 2,
        }}
      >
        <Tabs
          value={kind}
          variant="fullWidth"
          onChange={(event, chosen) => {
            setParams(chosen === 'person' ? {} : { kind: chosen });
          }}
          sx={{ flexGrow: 1, minWidth: 0 }}
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
        <Tooltip title={i18n.t('recommendations:weights.action')}>
          <IconButton
            aria-label={i18n.t('recommendations:weights.action')}
            onClick={() => {
              setIsTuning(true);
            }}
          >
            <TuneIcon />
          </IconButton>
        </Tooltip>
      </Box>
      {isTuning &&
        <SuggestionWeightsDialog
          onClose={() => {
            setIsTuning(false);
          }}
          onSaved={() => {
            setIsTuning(false);
            setVersion(version + 1);
          }}
        />}
      <SuggestionsList
        key={`${kind}-${version}`}
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
