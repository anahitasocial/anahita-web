import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import CloseIcon from '@mui/icons-material/Close';

import ArticleForm from './Forms/Article';
import TopicForm from './Forms/Topic';
import ComposerDefault from './Default';
import ActorType from '../../../proptypes/Actor';
import utils from '../../../utils';
import i18n from '../../../languages';

const { form } = utils;

// The forms for writing at length, one for each kind. Made once: a composer
// made on every render would lose what is typed in it.
const LONG = {
  article: {
    Composer: ComposerDefault('articles'),
    formFields: form.createFormFields(['name', 'body', 'excerpt']),
    formComponent: ArticleForm,
  },
  topic: {
    Composer: ComposerDefault('topics'),
    formFields: form.createFormFields(['name', 'body']),
    formComponent: TopicForm,
  },
};

// The extended composer: writing at length, with a title, in a larger dialog
// that fills the screen on a phone. Article or Topic, where the profile
// takes both. `body` is what was written in the short box before it was
// expanded, carried over.
//
// Phase 1 of row 74 (docs/plans/unified-composer.md) puts the forms there
// were into it; phase 2 gives it its own editor, a cover and the fuller
// picture uploader.
const LongComposer = ({
  actor,
  kinds,
  open,
  onClose,
  body = '',
}) => {
  const phone = useMediaQuery((theme) => { return theme.breakpoints.down('sm'); });
  const [kind, setKind] = useState(kinds[0]);
  useEffect(() => {
    if (!kinds.includes(kind)) {
      setKind(kinds[0]);
    }
  }, [kinds]);

  const config = LONG[kind];
  if (!config) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={phone}
      fullWidth
      maxWidth="md"
    >
      <Toolbar sx={{ gap: 1, px: 1 }}>
        <IconButton edge="start" aria-label={i18n.t('composer:close')} onClick={onClose}>
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {i18n.t('composer:writeLong')}
        </Typography>
      </Toolbar>
      {kinds.length > 1 &&
        <Tabs
          value={kind}
          onChange={(event, value) => {
            setKind(value);
          }}
          variant="fullWidth"
        >
          {kinds.map((each) => {
            return (
              <Tab
                key={`long-${each}`}
                value={each}
                label={i18n.t(`composer:kinds.${each}`)}
              />
            );
          })}
        </Tabs>}
      <Divider />
      {/* The forms are cards of their own: flat in the dialog, and no
          margin above the first field, which the card's padding already
          gives. Emotion warns of :first-child because of server rendering,
          which this app does not do. */}
      <Box
        sx={{
          overflowY: 'auto',
          '& .MuiCard-root': { boxShadow: 'none' },
          '& .MuiCardContent-root > .MuiFormControl-marginNormal:first-child/* emotion-disable-server-rendering-unsafe-selector-warning-please-do-not-use-this-the-warning-exists-for-a-reason */': {
            marginTop: 0,
          },
        }}
      >
        {open &&
          <config.Composer
            key={`long-${kind}`}
            actor={actor}
            formFields={config.formFields}
            formComponent={config.formComponent}
            initialBody={body}
            onPosted={onClose}
          />}
      </Box>
    </Dialog>
  );
};

LongComposer.propTypes = {
  actor: ActorType.isRequired,
  // What this profile takes, of `article` and `topic`.
  kinds: PropTypes.arrayOf(PropTypes.string).isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  body: PropTypes.string,
};

export default LongComposer;
