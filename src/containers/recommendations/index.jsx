import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';

import RecommendationsIcon from '@mui/icons-material/Explore';
import TuneIcon from '@mui/icons-material/TuneOutlined';
import PreferencesIcon from '@mui/icons-material/SettingsOutlined';

import useSuggestions from './useSuggestions';
import SharedFeeds from './SharedFeeds';
import SuggestionWeightsDialog from './WeightsDialog';
import SuggestionPreferencesDialog from './PreferencesDialog';
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

// The tab of shared feeds, after the kinds the recommendation service
// chooses.
const FEED = 'feed';

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
        // Side by side with Follow, each half the width; by itself on an
        // event, the whole of it.
        const removeButton = (
          <Button
            fullWidth
            key={`suggestion-remove-${actor.id}`}
            onClick={() => {
              handleDismiss(actor);
            }}
          >
            {i18n.t('recommendations:dismiss')}
          </Button>
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
                action={removeButton}
              /> :
              <ActorCard
                actor={actor}
                note={why}
                action={[
                  removeButton,
                  <ControlFollow
                    fullWidth
                    variant="outlined"
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
// the reason it is suggested, to follow or to turn down; and, last, feeds
// people have shared, to add to the home page. The open tab is in the
// address (`?kind=group`, `?kind=feed`).
//
// Feeds are not chosen by the recommendation service: they are the shared
// feeds the viewer may open, newest first, and the weights and the
// preferences beside the tabs do not change them.
//
// The button beside the tabs opens what counts in the choosing, for the
// viewer to weigh for themselves. Saved, the list is read again.
const SuggestionsPage = ({ alertSuccess, alertError }) => {
  const [params, setParams] = useSearchParams();
  const asked = params.get('kind');
  const kinds = [...recommendations.KINDS, FEED];
  const kind = kinds.includes(asked) ? asked : 'person';
  // Five tabs and two buttons are more than a phone's width: there they
  // slide, and never wrap (the user, 2026-10-29).
  const phone = useMediaQuery((theme) => { return theme.breakpoints.down('sm'); });
  const [isTuning, setIsTuning] = useState(false);
  const [isChoosing, setIsChoosing] = useState(false);
  // Read again when the weights were changed.
  const [version, setVersion] = useState(0);

  return (
    <>
      <Helmet>
        <title>{i18n.t('recommendations:cTitle')}</title>
      </Helmet>
      <Box sx={{ mb: 2 }}>
        <BrowseHeader
          icon={<RecommendationsIcon />}
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
          // On a phone they slide under a finger, with no arrows to take
          // their room: the one cut at the edge says there is more.
          variant={phone ? 'scrollable' : 'fullWidth'}
          scrollButtons={false}
          onChange={(event, chosen) => {
            setParams(chosen === 'person' ? {} : { kind: chosen });
          }}
          sx={{ flexGrow: 1, minWidth: 0 }}
        >
          {kinds.map((each) => {
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
        <Tooltip title={i18n.t('recommendations:preferences.action')}>
          <IconButton
            aria-label={i18n.t('recommendations:preferences.action')}
            onClick={() => {
              setIsChoosing(true);
            }}
          >
            <PreferencesIcon />
          </IconButton>
        </Tooltip>
      </Box>
      {isChoosing &&
        <SuggestionPreferencesDialog
          onClose={() => {
            setIsChoosing(false);
          }}
          onChanged={() => {
            setVersion(version + 1);
          }}
        />}
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
      {kind === FEED ?
        <SharedFeeds /> :
        <SuggestionsList
          key={`${kind}-${version}`}
          kind={kind}
          alertSuccess={alertSuccess}
          alertError={alertError}
        />}
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
