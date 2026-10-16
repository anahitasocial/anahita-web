import React, { useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { pluralize } from 'inflection';
import _ from 'lodash';

import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import ArticleForm from './Forms/Article';
import NoteForm from './Forms/Note';
import PhotoForm from './Forms/Photo';
import TopicForm from './Forms/Topic';
import ComposerDefault from './Default';
import ComposerVideo from './Video';

import i18n from '../../../languages';
import appIcons from '../../../components/AppIcons';
import ActorType from '../../../proptypes/Actor';
import utils from '../../../utils';

const { form, node } = utils;

const useStyles = makeStyles()({
  root: {
    marginBottom: 8 * 2,
    position: 'sticky',
    top: 8 * 7,
    zIndex: 8,
    // Raised as a whole, like the cards under it, so the form's own card
    // inside lies flat on it.
    '& .MuiCard-root': {
      boxShadow: 'none',
    },
    // The card's padding is room enough above the first field; its margin
    // on top of that left twice as much. Emotion warns of :first-child
    // because of server rendering, which this app does not do.
    '& .MuiCardContent-root > .MuiFormControl-marginNormal:first-child/* emotion-disable-server-rendering-unsafe-selector-warning-please-do-not-use-this-the-warning-exists-for-a-reason */': {
      marginTop: 0,
    },
  },
  tab: {
    fontSize: 12,
    minHeight: 48,
  },
});

const COMPOSER_CONFIGS = {
  articles: {
    Composer: ComposerDefault('articles'),
    formFields: form.createFormFields(['name', 'body', 'excerpt']),
    formComponent: ArticleForm,
  },
  photos: {
    Composer: ComposerDefault('photos'),
    formFields: form.createFormFields(['name', 'body']),
    formComponent: PhotoForm,
    supportedMimetypes: [
      'image/jpeg',
      'image/png',
    ],
  },
  notes: {
    Composer: ComposerDefault('notes'),
    formFields: form.createFormFields(['name', 'body']),
    formComponent: NoteForm,
  },
  // Sent to storage in parts and posted when it has been prepared: a
  // composer of its own. See ./Video.
  videos: {
    Composer: ComposerVideo,
  },
  topics: {
    Composer: ComposerDefault('topics'),
    formFields: form.createFormFields(['name', 'body']),
    formComponent: TopicForm,
  },
};

const Composers = ({
  actor,
}) => {
  const { classes } = useStyles();
  const composers = node.getComposers(actor);
  const [chosen, setTab] = useState(composers[0]);

  if (composers.length === 0) {
    return null;
  }

  // The tab that was chosen, when this profile has it, and otherwise the
  // first it has. What was chosen is remembered from one profile to the
  // next, and the next may not have it: somebody on another server has no
  // composers at all, so coming from their profile to one that has them
  // left nothing chosen, and the page fell over naming it.
  const tab = composers.includes(chosen) ? chosen : composers[0];

  const namespace = pluralize(tab);
  const config = COMPOSER_CONFIGS[namespace];

  return (
    <AppBar
      position="sticky"
      color="inherit"
      className={classes.root}
      elevation={1}
    >
      {config && (
        <config.Composer
          actor={actor}
          namespace={namespace}
          formFields={config.formFields}
          formComponent={config.formComponent}
          supportedMimetypes={config.supportedMimetypes}
          key={`composer-${namespace}`}
        />
      )}
      <Tabs
        value={tab}
        onChange={(event, value) => {
          return setTab(value);
        }}
        variant="scrollable"
        indicatorColor="primary"
        textColor="primary"
      >
        {composers.map((composer) => {
          return (
            <Tab
              key={`composer-tab-${composer}`}
              label={i18n.t(`apps:${composer}`)}
              value={composer}
              // The icons are named for the kind of post in the plural
              // ("Notes"), and a composer is named in the singular
              // ("note"): looked up as it was, no tab had one.
              icon={appIcons[_.upperFirst(pluralize(composer))]}
              iconPosition="start"
              className={classes.tab}
            />
          );
        })}
      </Tabs>
    </AppBar>
  );
};

Composers.propTypes = {
  actor: ActorType.isRequired,
};

export default Composers;
