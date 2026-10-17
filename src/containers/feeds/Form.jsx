import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
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
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import MyLocationIcon from '@mui/icons-material/MyLocation';

import NodesField from '../../components/NodesField';
import WordsField from '../../components/WordsField';
import MenuItemLabel from '../../components/MenuItemLabel';
import CustomFeedIcon, { FEED_ICONS } from '../../components/CustomFeedIcon';
import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';
import customFeeds from '../../utils/customFeeds';
import postLanguage from '../../utils/postLanguage';

const { LIMITS } = customFeeds;

// The form's id, for the button outside it that sends it.
const FORM = 'custom-feed-editor-form';

// Where a feed's posts come from.
const FROM_EVERYONE = 'everyone';
const FROM_FOLLOWING = 'following';
const FROM_CHOSEN = 'chosen';

// The radii an area may have, in kilometres, a step of the slider each.
const RADII = [1, 2, 5, 10, 25, 50, 100, 250, 500];

// What the form starts from: a feed being changed, or a new one of the
// profiles the viewer follows.
const startingValues = (feed) => {
  return {
    name: (feed && feed.name) || '',
    body: (feed && feed.body) || '',
    access: (feed && feed.access) || 'myself',
    icon: (feed && feed.icon) || 'feed',
    definition: feed ? customFeeds.complete(feed.definition) : customFeeds.starting(),
  };
};

// The profiles and places a feed's definition lists, as the nodes the
// pickers hold. One the viewer may no longer see is kept by its id, so
// saving the feed does not quietly take it out.
const chosenFrom = (ids, references) => {
  const byId = {};
  (references || []).forEach((node) => {
    byId[node.id] = node;
  });

  return ids.map((id) => {
    return byId[id] || { id, name: `#${id}` };
  });
};

const idsOf = (nodes) => {
  return nodes.map((node) => {
    return node.id;
  });
};

const toggled = (list, item, isOn) => {
  const without = list.filter((each) => {
    return each !== item;
  });

  return isOn ? [...without, item] : without;
};

// Making a custom feed, or changing one, in the page.
//
// A feed is where its posts come from, narrowed by what they are about, less
// what is left out. Under the fields is the same thing in a sentence, which
// follows every change. There is no preview: saving opens the feed itself,
// and it can be changed again from there. Posts are always newest first.
const CustomFeedForm = ({
  feed = null,
  onClose,
  onSaved,
  alertSuccess,
  alertError,
}) => {
  const isNew = !feed;

  const [values, setValues] = useState(() => {
    return startingValues(feed);
  });
  const references = (feed && feed.references) || [];
  const [actors, setActors] = useState(() => {
    return chosenFrom(values.definition.sources.actors, references);
  });
  const [locations, setLocations] = useState(() => {
    return chosenFrom(values.definition.filters.locationsAny, references);
  });
  const [excluded, setExcluded] = useState(() => {
    return chosenFrom(values.definition.exclude.actors, references);
  });
  const [error, setError] = useState('');
  // Where the posts come from, as one choice of three (the user,
  // 2026-10-17: a hashtag feed showed only the posts of profiles followed,
  // as the tick a new feed started with said, and nobody saw it).
  const [from, setFrom] = useState(() => {
    if ((values.definition.sources.actors || []).length > 0) {
      return FROM_CHOSEN;
    }
    return values.definition.sources.following ? FROM_FOLLOWING : FROM_EVERYONE;
  });
  // Whether that choice is as the form set it, or as the person did. A new
  // feed starts from the profiles they follow so that it shows something;
  // given a hashtag, a keyword, a place or an area before they chose, it
  // looks at everyone, which is what that almost always means.
  const [choseFrom, setChoseFrom] = useState(!isNew);
  // Finding where the person is, for an area around them.
  const [whereIAm, setWhereIAm] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { definition } = values;
  const problem = customFeeds.problem(definition);

  // Profiles named by hand, and nothing else to draw from: whose posts
  // these are is already said, and "Posted on" could only hide some of
  // them. It is not offered then, and not sent.
  const onlyPicked = !definition.sources.following &&
    (definition.sources.actors || []).length > 0;
  const sent = onlyPicked ?
    { ...definition, filters: { ...definition.filters, actorTypes: [] } } :
    definition;

  const setDefinition = (part, changes) => {
    setError('');
    const next = {
      ...definition,
      [part]: { ...definition[part], ...changes },
    };
    // Narrowed for the first time, in a new feed whose source nobody has
    // chosen: everyone, as said above.
    if (part === 'filters' && !choseFrom && from === FROM_FOLLOWING &&
      !customFeeds.narrows(definition) && customFeeds.narrows(next)) {
      next.sources = { ...next.sources, following: false };
      setFrom(FROM_EVERYONE);
    }
    setValues({ ...values, definition: next });
  };

  const chooseFrom = (choice) => {
    setChoseFrom(true);
    setFrom(choice);
    if (choice === FROM_EVERYONE) {
      setActors([]);
      setDefinition('sources', { following: false, actors: [] });
    } else if (choice === FROM_FOLLOWING) {
      setActors([]);
      setDefinition('sources', { following: true, actors: [] });
    } else {
      setDefinition('sources', { following: false });
    }
  };

  // The area around where the browser says the person is.
  const nearMe = () => {
    if (!navigator.geolocation) {
      setWhereIAm('denied');
      return;
    }
    setWhereIAm('finding');
    navigator.geolocation.getCurrentPosition((position) => {
      setWhereIAm('');
      setDefinition('filters', {
        near: {
          // A street's worth of precision, and no more: the point is kept
          // with the feed.
          latitude: Math.round(position.coords.latitude * 1000) / 1000,
          longitude: Math.round(position.coords.longitude * 1000) / 1000,
          radiusKm: (definition.filters.near && definition.filters.near.radiusKm) || 10,
        },
      });
    }, () => {
      setWhereIAm('denied');
    }, { maximumAge: 10 * 60 * 1000, timeout: 15000 });
  };

  const names = customFeeds.namesOf([...actors, ...locations, ...excluded]);
  // The languages offered, with the feed's own among them whatever it is.
  const languages = postLanguage.optionsWith(definition.filters.language || postLanguage.CODES[0]);

  const handleSave = (event) => {
    event.preventDefault();

    if (isSaving) {
      return;
    }
    if (!values.name.trim()) {
      setError('name_required');
      return;
    }
    if (problem) {
      setError(problem);
      return;
    }

    setIsSaving(true);

    const fields = {
      name: values.name.trim(),
      body: values.body.trim(),
      access: values.access,
      icon: values.icon,
      definition: sent,
    };
    const call = isNew ?
      api.customFeeds.add(fields) :
      api.customFeeds.edit({ id: feed.id, ...fields });

    call.then((result) => {
      alertSuccess(i18n.t('customFeeds:prompts.saved'));
      onSaved(result.data);
    }).catch((response) => {
      const data = (response.response && response.response.data) || {};
      const reason = data.error || 'generic';

      if (i18n.exists(`customFeeds:form.errors.${reason}`)) {
        setError(reason);
      } else {
        alertError(i18n.t('customFeeds:form.errors.generic'));
      }
      setIsSaving(false);
    });
  };

  const title = i18n.t(isNew ? 'customFeeds:form.titleAdd' : 'customFeeds:form.titleEdit');

  const fields = (
    <>
      <form id={FORM} onSubmit={handleSave} noValidate>
        <Stack spacing={2}>
          {/* Its picture, then its name, on one line: they are shown
              together in the menu and on the tabs. The list names each
              picture; closed, it shows the picture alone. */}
          <Stack direction="row" spacing={2}>
            <TextField
              select
              label={i18n.t('customFeeds:form.icon')}
              value={values.icon}
              disabled={isSaving}
              onChange={(event) => {
                setValues({ ...values, icon: event.target.value });
              }}
              slotProps={{
                select: {
                  renderValue: (name) => {
                    return (
                      <CustomFeedIcon
                        name={name}
                        titleAccess={i18n.t(`customFeeds:icons.${name}`)}
                        sx={{ display: 'block' }}
                      />
                    );
                  },
                },
              }}
              sx={{ width: 96, flexShrink: 0 }}
            >
              {FEED_ICONS.map((name) => {
                return (
                  <MenuItem key={name} value={name}>
                    <MenuItemLabel icon={<CustomFeedIcon name={name} fontSize="small" />}>
                      {i18n.t(`customFeeds:icons.${name}`)}
                    </MenuItemLabel>
                  </MenuItem>
                );
              })}
            </TextField>
            <TextField
              fullWidth
              required
              label={i18n.t('customFeeds:form.name')}
              value={values.name}
              error={error === 'name_required'}
              disabled={isSaving}
              onChange={(event) => {
                setError('');
                setValues({ ...values, name: event.target.value });
              }}
              slotProps={{ htmlInput: { maxLength: 100 } }}
            />
          </Stack>
          <TextField
            fullWidth
            multiline
            minRows={2}
            label={i18n.t('customFeeds:form.body')}
            value={values.body}
            disabled={isSaving}
            onChange={(event) => {
              setValues({ ...values, body: event.target.value });
            }}
            slotProps={{ htmlInput: { maxLength: 500 } }}
          />

          <Typography variant="subtitle1" component="h2">
            {i18n.t('customFeeds:form.sources')}
          </Typography>
          <RadioGroup
            value={from}
            onChange={(event) => {
              chooseFrom(event.target.value);
            }}
          >
            {[FROM_EVERYONE, FROM_FOLLOWING, FROM_CHOSEN].map((choice) => {
              return (
                <FormControlLabel
                  key={choice}
                  value={choice}
                  disabled={isSaving}
                  control={<Radio />}
                  label={
                    <>
                      <Typography variant="body1">
                        {i18n.t(`customFeeds:form.from.${choice}`)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {i18n.t(`customFeeds:form.from.${choice}Help`)}
                      </Typography>
                    </>
                  }
                  sx={{ alignItems: 'flex-start', mb: 1, '& .MuiRadio-root': { pt: 0.5 } }}
                />
              );
            })}
          </RadioGroup>
          {from === FROM_CHOSEN &&
            <>
              <NodesField
                label={i18n.t('customFeeds:form.actors')}
                helperText={i18n.t('customFeeds:form.actorsHelp')}
                namespaces={['people', 'groups', 'remote']}
                value={actors}
                max={LIMITS.actors}
                disabled={isSaving}
                onChange={(nodes) => {
                  setActors(nodes);
                  setDefinition('sources', { actors: idsOf(nodes) });
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={definition.sources.following}
                    disabled={isSaving}
                    onChange={(event) => {
                      setDefinition('sources', { following: event.target.checked });
                    }}
                  />
                }
                label={i18n.t('customFeeds:form.from.alsoFollowing')}
              />
            </>}

          <Typography variant="subtitle1" component="h2">
            {i18n.t('customFeeds:form.filters')}
          </Typography>
          <FormControl component="fieldset" disabled={isSaving}>
            <FormLabel component="legend">
              {i18n.t('customFeeds:form.mediaTypes')}
            </FormLabel>
            <FormGroup row>
              {customFeeds.MEDIA_TYPES.map((kind) => {
                return (
                  <FormControlLabel
                    key={kind}
                    control={
                      <Checkbox
                        checked={definition.filters.mediaTypes.includes(kind)}
                        onChange={(event) => {
                          const { mediaTypes: chosen } = definition.filters;
                          setDefinition('filters', {
                            mediaTypes: toggled(chosen, kind, event.target.checked),
                          });
                        }}
                      />
                    }
                    label={i18n.t(`customFeeds:kinds.${kind}`)}
                  />
                );
              })}
            </FormGroup>
            <FormHelperText sx={{ ml: 0 }}>
              {i18n.t('customFeeds:form.mediaTypesHelp')}
            </FormHelperText>
          </FormControl>
          {!onlyPicked &&
          <FormControl component="fieldset" disabled={isSaving}>
            <FormLabel component="legend">
              {i18n.t('customFeeds:form.actorTypes')}
            </FormLabel>
            <FormGroup row>
              {customFeeds.ACTOR_TYPES.map((kind) => {
                return (
                  <FormControlLabel
                    key={kind}
                    control={
                      <Checkbox
                        checked={definition.filters.actorTypes.includes(kind)}
                        onChange={(event) => {
                          const { actorTypes: chosen } = definition.filters;
                          setDefinition('filters', {
                            actorTypes: toggled(chosen, kind, event.target.checked),
                          });
                        }}
                      />
                    }
                    label={i18n.t(`customFeeds:kinds.${kind}`)}
                  />
                );
              })}
            </FormGroup>
            <FormHelperText sx={{ ml: 0 }}>
              {i18n.t('customFeeds:form.actorTypesHelp')}
            </FormHelperText>
          </FormControl>}
          <WordsField
            label={i18n.t('customFeeds:form.hashtags')}
            helperText={i18n.t('customFeeds:form.hashtagsHelp')}
            value={definition.filters.hashtagsAny}
            clean={customFeeds.cleanHashtag}
            max={LIMITS.hashtags}
            disabled={isSaving}
            onChange={(words) => {
              setDefinition('filters', { hashtagsAny: words });
            }}
          />
          <WordsField
            label={i18n.t('customFeeds:form.keywords')}
            helperText={i18n.t('customFeeds:form.keywordsHelp')}
            value={definition.filters.keywordsAny}
            clean={customFeeds.cleanKeyword}
            max={LIMITS.keywords}
            disabled={isSaving}
            onChange={(words) => {
              setDefinition('filters', { keywordsAny: words });
            }}
          />
          <NodesField
            label={i18n.t('customFeeds:form.locations')}
            helperText={i18n.t('customFeeds:form.locationsHelp')}
            namespaces={['locations']}
            value={locations}
            max={LIMITS.locations}
            disabled={isSaving}
            onChange={(nodes) => {
              setLocations(nodes);
              setDefinition('filters', { locationsAny: idsOf(nodes) });
            }}
          />
          {/* An area: around where the person is, as far as they choose
              (the user, 2026-10-17: "a near me feed, and set the radius"). */}
          <FormControl component="fieldset" disabled={isSaving}>
            <FormLabel component="legend">
              {i18n.t('customFeeds:form.near')}
            </FormLabel>
            {!definition.filters.near &&
              <Box sx={{ mt: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<MyLocationIcon />}
                  disabled={isSaving || whereIAm === 'finding'}
                  onClick={nearMe}
                >
                  {i18n.t(whereIAm === 'finding' ? 'customFeeds:form.nearFinding' : 'customFeeds:form.nearHere')}
                </Button>
              </Box>}
            {definition.filters.near &&
              <Box sx={{ mt: 1, px: 1 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2">
                    {i18n.t('customFeeds:form.nearAt', {
                      latitude: definition.filters.near.latitude,
                      longitude: definition.filters.near.longitude,
                    })}
                  </Typography>
                  <Button
                    size="small"
                    disabled={isSaving}
                    onClick={() => {
                      setDefinition('filters', { near: null });
                    }}
                  >
                    {i18n.t('customFeeds:form.nearOff')}
                  </Button>
                </Stack>
                <Typography id="feed-radius" variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  {i18n.t('customFeeds:form.radius')}
                  {' '}
                  {i18n.t('customFeeds:form.radius', { count: definition.filters.near.radiusKm })}
                </Typography>
                <Slider
                  aria-labelledby="feed-radius"
                  value={Math.max(RADII.indexOf(definition.filters.near.radiusKm), 0)}
                  min={0}
                  max={RADII.length - 1}
                  step={1}
                  marks
                  disabled={isSaving}
                  getAriaValueText={(index) => {
                    return i18n.t('customFeeds:form.radius', { count: RADII[index] });
                  }}
                  onChange={(event, index) => {
                    setDefinition('filters', {
                      near: { ...definition.filters.near, radiusKm: RADII[index] },
                    });
                  }}
                />
              </Box>}
            <FormHelperText sx={{ ml: 0 }}>
              {whereIAm === 'denied' ?
                i18n.t('customFeeds:form.nearDenied') :
                i18n.t('customFeeds:form.nearHelp')}
            </FormHelperText>
          </FormControl>
          <TextField
            select
            fullWidth
            label={i18n.t('customFeeds:form.origin')}
            value={definition.filters.origin || ''}
            disabled={isSaving}
            onChange={(event) => {
              setDefinition('filters', { origin: event.target.value });
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
              setDefinition('filters', { language: event.target.value });
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
                  setError('');
                  setValues({
                    ...values,
                    definition: { ...definition, includeReplies: event.target.checked },
                  });
                }}
              />
            }
            label={i18n.t('customFeeds:form.includeReplies')}
          />

          <Typography variant="subtitle1" component="h2">
            {i18n.t('customFeeds:form.exclude')}
          </Typography>
          <WordsField
            label={i18n.t('customFeeds:form.excludeHashtags')}
            value={definition.exclude.hashtags}
            clean={customFeeds.cleanHashtag}
            max={LIMITS.hashtags}
            disabled={isSaving}
            onChange={(words) => {
              setDefinition('exclude', { hashtags: words });
            }}
          />
          <WordsField
            label={i18n.t('customFeeds:form.excludeKeywords')}
            value={definition.exclude.keywords}
            clean={customFeeds.cleanKeyword}
            max={LIMITS.keywords}
            disabled={isSaving}
            onChange={(words) => {
              setDefinition('exclude', { keywords: words });
            }}
          />
          <NodesField
            label={i18n.t('customFeeds:form.excludeActors')}
            namespaces={['people', 'groups', 'remote']}
            value={excluded}
            max={LIMITS.actors}
            disabled={isSaving}
            onChange={(nodes) => {
              setExcluded(nodes);
              setDefinition('exclude', { actors: idsOf(nodes) });
            }}
          />

          <FormControl disabled={isSaving}>
            <FormLabel id="custom-feed-access">
              {i18n.t('customFeeds:form.access')}
            </FormLabel>
            <RadioGroup
              aria-labelledby="custom-feed-access"
              name="custom-feed-access"
              value={values.access}
              onChange={(event) => {
                setError('');
                setValues({ ...values, access: event.target.value });
              }}
            >
              {customFeeds.ACCESS.map((access) => {
                return (
                  <FormControlLabel
                    key={access}
                    value={access}
                    control={<Radio />}
                    label={i18n.t(`customFeeds:access.${access}`)}
                  />
                );
              })}
            </RadioGroup>
            <FormHelperText sx={{ ml: 0 }}>
              {i18n.t('customFeeds:form.accessHelp')}
            </FormHelperText>
          </FormControl>
          {/* What the feed shows, in a sentence. */}
          <Typography variant="body2" color="textSecondary">
            {customFeeds.summary(sent, i18n.t.bind(i18n), { names })}
          </Typography>
        </Stack>
      </form>
      {error &&
        <Typography variant="body2" color="error" role="alert" sx={{ pt: 2 }}>
          {i18n.t(`customFeeds:form.errors.${error}`)}
        </Typography>}
    </>
  );

  // Side by side, each half the width: Cancel, then the one that saves.
  const buttons = (
    <>
      <Button
        fullWidth
        disabled={isSaving}
        onClick={onClose}
      >
        {i18n.t('customFeeds:form.cancel')}
      </Button>
      <Button
        fullWidth
        type="submit"
        form={FORM}
        variant="contained"
        color="primary"
        disabled={isSaving}
      >
        {i18n.t(isNew ? 'customFeeds:form.create' : 'customFeeds:form.save')}
      </Button>
    </>
  );

  return (
    <Card>
      <CardHeader
        title={title}
        slotProps={{ title: { variant: 'h5', component: 'h1' } }}
      />
      <CardContent>
        <Stack spacing={2}>
          <div>
            {fields}
          </div>
          <Stack direction="row" spacing={1}>
            {buttons}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

CustomFeedForm.propTypes = {
  // The feed being changed, as the server sent it with what it names. None
  // for a new one.
  feed: PropTypes.object,
  // Closed without saving, and saved: each is told, and neither goes
  // anywhere by itself.
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
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

export default connect(null, mapDispatchToProps)(CustomFeedForm);
