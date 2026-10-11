import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';

import FeedCustomBrowse from '../feed/Custom';
import NodesField from '../../components/NodesField';
import WordsField from '../../components/WordsField';
import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';
import customFeeds from '../../utils/customFeeds';
import postLanguage from '../../utils/postLanguage';

const { LIMITS } = customFeeds;

// The two steps: building the feed, then seeing what it would show.
const BUILD = 0;
const PREVIEW = 1;

// The part of the dialog that scrolls, for the preview's list to watch.
const SCROLLER = 'custom-feed-editor-content';

// What the form starts from: a feed being changed, or a new one of the
// profiles the viewer follows.
const startingValues = (feed) => {
  return {
    name: (feed && feed.name) || '',
    body: (feed && feed.body) || '',
    access: (feed && feed.access) || 'myself',
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

// Making a custom feed, or changing one, in a dialog of two steps. On a
// phone the dialog is the whole screen.
//
// The first step is the feed itself: where its posts come from, narrowed by
// what they are about, less what is left out. The second is what that feed
// would show right now, in a sentence and then as posts, and is where it is
// saved. Nothing is saved before it has been seen. Posts are always newest
// first.
const CustomFeedForm = ({
  feed = null,
  onClose,
  onSaved,
  alertSuccess,
  alertError,
}) => {
  const isNew = !feed;
  const isSmall = useMediaQuery((theme) => {
    return theme.breakpoints.down('sm');
  });
  const [step, setStep] = useState(BUILD);

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
  const [isSaving, setIsSaving] = useState(false);

  const { definition } = values;
  const problem = customFeeds.problem(definition);

  const setDefinition = (part, changes) => {
    setError('');
    setValues({
      ...values,
      definition: {
        ...definition,
        [part]: { ...definition[part], ...changes },
      },
    });
  };

  const names = customFeeds.namesOf([...actors, ...locations, ...excluded]);
  // The languages offered, with the feed's own among them whatever it is.
  const languages = postLanguage.optionsWith(definition.filters.language || postLanguage.CODES[0]);

  // On to the preview, once the feed is one the server would take.
  const handlePreview = () => {
    if (!values.name.trim()) {
      setError('name_required');
      return;
    }
    if (problem) {
      setError(problem);
      return;
    }

    setError('');
    setStep(PREVIEW);
  };

  const handleSave = () => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);

    const fields = {
      name: values.name.trim(),
      body: values.body.trim(),
      access: values.access,
      definition,
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

  const stepTitle = i18n.t(isNew ? 'customFeeds:form.titleAdd' : 'customFeeds:form.titleEdit');

  return (
    <Dialog
      open
      fullWidth
      maxWidth="sm"
      fullScreen={isSmall}
      onClose={() => {
        if (!isSaving) {
          onClose();
        }
      }}
      aria-labelledby="custom-feed-editor-title"
    >
      <DialogTitle id="custom-feed-editor-title">
        {stepTitle}
      </DialogTitle>
      <Stepper activeStep={step} sx={{ px: 3, pb: 2 }}>
        <Step>
          <StepLabel>{i18n.t('customFeeds:form.stepBuild')}</StepLabel>
        </Step>
        <Step>
          <StepLabel>{i18n.t('customFeeds:form.preview')}</StepLabel>
        </Step>
      </Stepper>
      <DialogContent dividers id={SCROLLER}>
        {step === BUILD &&
          <Stack spacing={2}>
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
            <div>
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
                label={i18n.t('customFeeds:form.following')}
              />
              <Typography variant="body2" color="textSecondary" sx={{ pl: 4 }}>
                {i18n.t('customFeeds:form.followingHelp')}
              </Typography>
            </div>
            <NodesField
              label={i18n.t('customFeeds:form.actors')}
              helperText={i18n.t('customFeeds:form.actorsHelp')}
              namespaces={['people', 'groups']}
              value={actors}
              max={LIMITS.actors}
              disabled={isSaving}
              onChange={(nodes) => {
                setActors(nodes);
                setDefinition('sources', { actors: idsOf(nodes) });
              }}
            />
            {!customFeeds.hasSources(definition) &&
              <Typography variant="body2" color="textSecondary">
                {i18n.t('customFeeds:form.noSources')}
              </Typography>}

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
            </FormControl>
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
              namespaces={['people', 'groups']}
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
          </Stack>}
        {step === PREVIEW &&
          <Stack spacing={2}>
            <Typography variant="body1">
              {customFeeds.summary(definition, i18n.t.bind(i18n), { names })}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {i18n.t('customFeeds:form.previewHelp')}
            </Typography>
            <FeedCustomBrowse
              definition={definition}
              emptyText={i18n.t('customFeeds:form.previewEmpty')}
              scrollableTarget={SCROLLER}
            />
          </Stack>}
        {error &&
          <Typography variant="body2" color="error" role="alert" sx={{ pt: 2 }}>
            {i18n.t(`customFeeds:form.errors.${error}`)}
          </Typography>}
      </DialogContent>
      {/* Side by side, each half the width: the way back, then the way on. */}
      <DialogActions sx={{ p: 2 }}>
        <Button
          fullWidth
          disabled={isSaving}
          onClick={() => {
            if (step === PREVIEW) {
              setError('');
              setStep(BUILD);
            } else {
              onClose();
            }
          }}
        >
          {i18n.t(step === PREVIEW ? 'customFeeds:form.back' : 'customFeeds:form.cancel')}
        </Button>
        {step === BUILD &&
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handlePreview}
          >
            {i18n.t('customFeeds:form.preview')}
          </Button>}
        {step === PREVIEW &&
          <Button
            fullWidth
            variant="contained"
            color="primary"
            disabled={isSaving}
            onClick={handleSave}
          >
            {i18n.t(isNew ? 'customFeeds:form.create' : 'customFeeds:form.save')}
          </Button>}
      </DialogActions>
    </Dialog>
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
