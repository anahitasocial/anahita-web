import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Slider from '@mui/material/Slider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import NodesField from '../../components/NodesField';
import WordsField from '../../components/WordsField';
import i18n from '../../languages';
import customFeeds from '../../utils/customFeeds';
import postLanguage from '../../utils/postLanguage';
import {
  NEAR_FIXED, NEAR_LIVE, NEAR_NONE, RADII,
} from './useFeedForm';

const { LIMITS } = customFeeds;

// A choice of a radio group with a line under it that says what it means.
const RADIO_WITH_HELP = { alignItems: 'flex-start', '& .MuiRadio-root': { pt: 0.5 } };

// A row of tick boxes for the kinds a feed may be narrowed to: the kinds of
// post, or the kinds of profile they were posted on.
const KindTicks = ({
  form,
  list,
  kinds,
}) => {
  const { definition, isSaving, tickFilter } = form;

  return (
    <FormControl component="fieldset" disabled={isSaving}>
      <FormLabel component="legend">
        {i18n.t(`customFeeds:form.${list}`)}
      </FormLabel>
      <FormGroup row>
        {kinds.map((kind) => {
          return (
            <FormControlLabel
              key={kind}
              control={
                <Checkbox
                  checked={definition.filters[list].includes(kind)}
                  onChange={(event) => {
                    tickFilter(list, kind, event.target.checked);
                  }}
                />
              }
              label={i18n.t(`customFeeds:kinds.${kind}`)}
            />
          );
        })}
      </FormGroup>
      <FormHelperText sx={{ ml: 0 }}>
        {i18n.t(`customFeeds:form.${list}Help`)}
      </FormHelperText>
    </FormControl>
  );
};

KindTicks.propTypes = {
  form: PropTypes.object.isRequired,
  // Which of the definition's filters: `mediaTypes` or `actorTypes`.
  list: PropTypes.string.isRequired,
  kinds: PropTypes.arrayOf(PropTypes.string).isRequired,
};

// An area: around where the person is, as far as they choose (the user,
// 2026-10-17: "a near me feed, and set the radius").
const NearField = ({ form }) => {
  const {
    definition,
    isSaving,
    nearKind,
    whereIAm,
    chooseNear,
    setRadius,
  } = form;
  const { near } = definition.filters;

  return (
    <FormControl component="fieldset" disabled={isSaving}>
      <FormLabel component="legend">
        {i18n.t('customFeeds:form.near')}
      </FormLabel>
      <RadioGroup
        value={nearKind}
        onChange={(event) => {
          chooseNear(event.target.value);
        }}
      >
        <FormControlLabel
          value={NEAR_NONE}
          control={<Radio />}
          label={i18n.t('customFeeds:form.nearOff')}
        />
        <FormControlLabel
          value={NEAR_LIVE}
          control={<Radio />}
          label={
            <>
              <Typography variant="body1">{i18n.t('customFeeds:form.nearLive')}</Typography>
              <Typography variant="body2" color="textSecondary">
                {i18n.t('customFeeds:form.nearLiveHelp')}
              </Typography>
            </>
          }
          sx={RADIO_WITH_HELP}
        />
        <FormControlLabel
          value={NEAR_FIXED}
          control={<Radio />}
          disabled={whereIAm === 'finding'}
          label={
            <>
              <Typography variant="body1">
                {i18n.t(whereIAm === 'finding' ?
                  'customFeeds:form.nearFinding' :
                  'customFeeds:form.nearFixed')}
              </Typography>
              {nearKind === NEAR_FIXED &&
                <Typography variant="body2" color="textSecondary">
                  {i18n.t('customFeeds:form.nearAt', {
                    latitude: near.latitude,
                    longitude: near.longitude,
                  })}
                </Typography>}
            </>
          }
          sx={RADIO_WITH_HELP}
        />
      </RadioGroup>
      {near &&
        <Box sx={{ mt: 1, px: 1 }}>
          <Typography id="feed-radius" variant="body2" color="textSecondary">
            {i18n.t('customFeeds:form.radius')}
            {' '}
            {i18n.t('customFeeds:form.radius', { count: near.radiusKm })}
          </Typography>
          <Slider
            aria-labelledby="feed-radius"
            value={Math.max(RADII.indexOf(near.radiusKm), 0)}
            min={0}
            max={RADII.length - 1}
            step={1}
            marks
            disabled={isSaving}
            getAriaValueText={(index) => {
              return i18n.t('customFeeds:form.radius', { count: RADII[index] });
            }}
            onChange={(event, index) => {
              setRadius(index);
            }}
          />
        </Box>}
      <FormHelperText sx={{ ml: 0 }}>
        {whereIAm === 'denied' ?
          i18n.t('customFeeds:form.nearDenied') :
          i18n.t('customFeeds:form.nearHelp')}
      </FormHelperText>
    </FormControl>
  );
};

NearField.propTypes = {
  form: PropTypes.object.isRequired,
};

// What a feed's posts are about: the middle of the form, between where they
// come from and what is left out. What each field holds, and what changing
// it does, is useFeedForm.js's.
const FormFilters = ({ form }) => {
  const {
    definition,
    isSaving,
    onlyPicked,
    setFilters,
    locations,
    pickLocations,
    setMatch,
    setIncludeReplies,
    languages,
  } = form;

  return (
    <>
      <Typography variant="subtitle1" component="h2">
        {i18n.t('customFeeds:form.filters')}
      </Typography>
      <KindTicks form={form} list="mediaTypes" kinds={customFeeds.MEDIA_TYPES} />
      {!onlyPicked &&
        <KindTicks form={form} list="actorTypes" kinds={customFeeds.ACTOR_TYPES} />}
      <WordsField
        label={i18n.t('customFeeds:form.hashtags')}
        helperText={i18n.t('customFeeds:form.hashtagsHelp', { max: LIMITS.hashtags })}
        value={definition.filters.hashtagsAny}
        clean={customFeeds.cleanHashtag}
        max={LIMITS.hashtags}
        disabled={isSaving}
        onChange={(words) => {
          setFilters({ hashtagsAny: words });
        }}
      />
      <WordsField
        label={i18n.t('customFeeds:form.keywords')}
        helperText={i18n.t('customFeeds:form.keywordsHelp', { max: LIMITS.keywords })}
        value={definition.filters.keywordsAny}
        clean={customFeeds.cleanKeyword}
        max={LIMITS.keywords}
        disabled={isSaving}
        onChange={(words) => {
          setFilters({ keywordsAny: words });
        }}
      />
      <NodesField
        label={i18n.t('customFeeds:form.locations')}
        helperText={i18n.t('customFeeds:form.locationsHelp', { max: LIMITS.locations })}
        namespaces={['locations']}
        value={locations}
        max={LIMITS.locations}
        disabled={isSaving}
        onChange={pickLocations}
      />
      <NearField form={form} />
      {/* Any or all (anahita-services roadmap row 149), once two kinds
          of thing are asked for: from these profiles, these hashtags,
          these words, these places, this area. One choice for the
          whole feed; a new feed starts at Any. */}
      {customFeeds.matchingKinds(definition) > 1 &&
      <FormControl component="fieldset" disabled={isSaving}>
        <FormLabel component="legend" id="feed-match">
          {i18n.t('customFeeds:form.match.label')}
        </FormLabel>
        <RadioGroup
          row
          aria-labelledby="feed-match"
          value={definition.match}
          onChange={(event) => {
            setMatch(event.target.value);
          }}
        >
          {[customFeeds.MATCH_ANY, customFeeds.MATCH_ALL].map((choice) => {
            return (
              <FormControlLabel
                key={choice}
                value={choice}
                control={<Radio />}
                label={i18n.t(`customFeeds:form.match.${choice}`)}
              />
            );
          })}
        </RadioGroup>
        <FormHelperText sx={{ ml: 0 }}>
          {i18n.t(`customFeeds:form.match.${definition.match}Help`)}
        </FormHelperText>
      </FormControl>}
      <TextField
        select
        fullWidth
        label={i18n.t('customFeeds:form.origin')}
        value={definition.filters.origin || ''}
        disabled={isSaving}
        onChange={(event) => {
          setFilters({ origin: event.target.value });
        }}
      >
        <MenuItem value="">{i18n.t('customFeeds:form.originAny')}</MenuItem>
        <MenuItem value="here">{i18n.t('customFeeds:form.originHere')}</MenuItem>
        <MenuItem value="elsewhere">{i18n.t('customFeeds:form.originElsewhere')}</MenuItem>
      </TextField>
      <TextField
        select
        fullWidth
        label={i18n.t('customFeeds:form.language')}
        value={definition.filters.language}
        disabled={isSaving}
        onChange={(event) => {
          setFilters({ language: event.target.value });
        }}
      >
        <MenuItem value="">
          {i18n.t('customFeeds:form.languageAny')}
        </MenuItem>
        {languages.map((code) => {
          return (
            <MenuItem key={code} value={code}>
              {postLanguage.nameOf(code, i18n.language)}
            </MenuItem>
          );
        })}
      </TextField>
      <FormControlLabel
        control={
          <Checkbox
            checked={definition.includeReplies}
            disabled={isSaving}
            onChange={(event) => {
              setIncludeReplies(event.target.checked);
            }}
          />
        }
        label={i18n.t('customFeeds:form.includeReplies')}
      />
    </>
  );
};

FormFilters.propTypes = {
  // What useFeedForm gives.
  form: PropTypes.object.isRequired,
};

export default FormFilters;
