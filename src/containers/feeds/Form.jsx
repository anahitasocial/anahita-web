import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import NodesField from '../../components/NodesField';
import WordsField from '../../components/WordsField';
import MenuItemLabel from '../../components/MenuItemLabel';
import CustomFeedIcon, { FEED_ICONS } from '../../components/CustomFeedIcon';
import actions from '../../actions';
import i18n from '../../languages';
import customFeeds from '../../utils/customFeeds';
import FormFilters from './FormFilters';
import useFeedForm, { FROM_CHOSEN, FROM_EVERYONE, FROM_FOLLOWING } from './useFeedForm';

const { LIMITS } = customFeeds;

// The form's id, for the button outside it that sends it.
const FORM = 'custom-feed-editor-form';

// Making a custom feed, or changing one, in the page.
//
// A feed is where its posts come from, narrowed by what they are about, less
// what is left out. Under the fields is the same thing in a sentence, which
// follows every change. There is no preview: saving opens the feed itself,
// and it can be changed again from there. Posts are always newest first.
//
// What the fields hold, and the rules between them, are useFeedForm.js's;
// what the posts are about is drawn by FormFilters.jsx. This file draws the
// rest: the feed's picture, name and words, where its posts come from, what
// is left out, who may see it, and the buttons.
const CustomFeedForm = ({
  feed = null,
  onClose,
  onSaved,
  alertSuccess,
  alertError,
}) => {
  const form = useFeedForm({
    feed, onSaved, alertSuccess, alertError,
  });
  const {
    isNew,
    values,
    definition,
    error,
    isSaving,
    from,
  } = form;

  return (
    <Card>
      <CardHeader
        title={i18n.t(isNew ? 'customFeeds:form.titleAdd' : 'customFeeds:form.titleEdit')}
        slotProps={{ title: { variant: 'h5', component: 'h1' } }}
      />
      <CardContent>
        <form id={FORM} onSubmit={form.save} noValidate>
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
                  form.setIcon(event.target.value);
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
                  form.setName(event.target.value);
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
                form.setBody(event.target.value);
              }}
              slotProps={{ htmlInput: { maxLength: 500 } }}
            />

            <Typography variant="subtitle1" component="h2">
              {i18n.t('customFeeds:form.sources')}
            </Typography>
            <RadioGroup
              value={from}
              onChange={(event) => {
                form.chooseFrom(event.target.value);
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
                  helperText={i18n.t('customFeeds:form.actorsHelp', { max: LIMITS.actors })}
                  namespaces={['people', 'groups', 'remote']}
                  value={form.actors}
                  max={LIMITS.actors}
                  disabled={isSaving}
                  onChange={form.pickActors}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={definition.sources.following}
                      disabled={isSaving}
                      onChange={(event) => {
                        form.setFollowing(event.target.checked);
                      }}
                    />
                  }
                  label={i18n.t('customFeeds:form.from.alsoFollowing')}
                />
              </>}

            <FormFilters form={form} />

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
                form.setExclude({ hashtags: words });
              }}
            />
            <WordsField
              label={i18n.t('customFeeds:form.excludeKeywords')}
              value={definition.exclude.keywords}
              clean={customFeeds.cleanKeyword}
              max={LIMITS.keywords}
              disabled={isSaving}
              onChange={(words) => {
                form.setExclude({ keywords: words });
              }}
            />
            <NodesField
              label={i18n.t('customFeeds:form.excludeActors')}
              namespaces={['people', 'groups', 'remote']}
              value={form.excluded}
              max={LIMITS.actors}
              disabled={isSaving}
              onChange={form.pickExcluded}
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
                  form.setAccess(event.target.value);
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
              {customFeeds.summary(form.sent, i18n.t.bind(i18n), { names: form.names })}
            </Typography>
          </Stack>
        </form>
        {error &&
          <Typography variant="body2" color="error" role="alert" sx={{ pt: 2 }}>
            {i18n.t(`customFeeds:form.errors.${error}`)}
          </Typography>}
      </CardContent>
      {/* Outside the form; Save names it (`form`). Side by side, each half
          the width: Cancel, then the one that saves. */}
      <CardActions sx={{ justifyContent: 'flex-end' }}>
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
      </CardActions>
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
