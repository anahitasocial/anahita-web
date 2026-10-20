import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import NodesField from '../../components/NodesField';
import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';
import utils from '../../utils';

const { getActorName } = utils.node;

// The most people in one post, as the server keeps it.
export const TAG_MAX = 20;

// Said when who is in a post changed, so that what shows it reads it again.
export const PEOPLE_TAGS_CHANGED = 'anahita:people-tags-changed';

export const announceChanged = (postId) => {
  window.dispatchEvent(new CustomEvent(PEOPLE_TAGS_CHANGED, { detail: { postId } }));
};

// Tags people in a post, and takes them off: one chosen, one asked, as they
// each decided (roadmap row 103). Somebody who approves each tag first is
// asked, and shows to nobody else until they say yes; somebody who lets
// nobody tag them cannot be, and is named so.
export const tagPeople = (post, chosen, before = []) => {
  const was = before.map((person) => { return person.id; });
  const is = chosen.map((person) => { return person.id; });
  const added = chosen.filter((person) => { return !was.includes(person.id); });
  const removed = before.filter((person) => { return !is.includes(person.id); });

  return Promise.all([
    ...added.map((person) => {
      return api.peopleTags.add(person, post)
        .then((response) => { return { person, outcome: response.status === 202 ? 'asked' : 'tagged' }; })
        .catch(() => { return { person, outcome: 'refused' }; });
    }),
    ...removed.map((person) => {
      return api.peopleTags.remove(person, post)
        .then(() => { return { person, outcome: 'removed' }; })
        .catch(() => { return { person, outcome: 'failed' }; });
    }),
  ]).then((outcomes) => {
    announceChanged(post.id);
    return outcomes;
  });
};

// What came of it, in words: who could not be tagged, then who is asked.
export const tagOutcomeMessage = (outcomes) => {
  const names = (kind) => {
    return outcomes
      .filter((each) => { return each.outcome === kind; })
      .map((each) => { return getActorName(each.person); });
  };
  const list = (people) => {
    return new Intl.ListFormat(i18n.language, { type: 'conjunction' }).format(people);
  };
  const refused = names('refused');
  if (refused.length > 0) {
    return { error: true, text: i18n.t('peopleTags:alerts.refused', { names: list(refused), count: refused.length }) };
  }
  const asked = names('asked');
  if (asked.length > 0) {
    return { error: false, text: i18n.t('peopleTags:alerts.asked', { names: list(asked), count: asked.length }) };
  }
  return { error: false, text: i18n.t('peopleTags:alerts.saved') };
};

// Choosing who is in a post not made yet, in the composer: they are tagged
// once it is (tagPeople).
export const TagPeoplePicker = ({
  open,
  value,
  onChange,
  onClose,
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" aria-labelledby="tag-people-picker-title">
      <DialogTitle id="tag-people-picker-title">
        {i18n.t('peopleTags:dialog.title')}
      </DialogTitle>
      <DialogContent>
        <DialogContentText variant="body2" sx={{ mb: 2 }}>
          {i18n.t('peopleTags:dialog.description')}
        </DialogContentText>
        <NodesField
          label={i18n.t('peopleTags:dialog.who')}
          helperText={i18n.t('peopleTags:dialog.hint', { max: TAG_MAX })}
          namespaces={['people']}
          value={value}
          onChange={onChange}
          max={TAG_MAX}
        />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose}>
          {i18n.t('actions:done')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

TagPeoplePicker.propTypes = {
  open: PropTypes.bool.isRequired,
  value: PropTypes.arrayOf(PropTypes.object).isRequired,
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

// "Tag people", from a photo's or a video's menu, for its author.
const TagPeopleDialog = ({
  medium,
  open,
  onClose,
  alertSuccess,
  alertError,
}) => {
  const [before, setBefore] = useState([]);
  const [chosen, setChosen] = useState([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    let current = true;
    api.peopleTags.browse(medium).then(({ data }) => {
      if (current) {
        const people = (data.data || []).map((each) => { return each.person; });
        setBefore(people);
        setChosen(people);
      }
    }).catch(() => {});
    return () => {
      current = false;
    };
  }, [open, medium.id]);

  const save = () => {
    setSending(true);
    tagPeople(medium, chosen, before)
      .then((outcomes) => {
        const said = tagOutcomeMessage(outcomes);
        if (said.error) {
          alertError(said.text);
        } else {
          alertSuccess(said.text);
        }
        onClose();
      })
      .then(() => { setSending(false); });
  };

  return (
    <Dialog open={open} onClose={sending ? undefined : onClose} fullWidth maxWidth="xs" aria-labelledby="tag-people-title">
      <DialogTitle id="tag-people-title">
        {i18n.t('peopleTags:dialog.title')}
      </DialogTitle>
      <DialogContent>
        <DialogContentText variant="body2" sx={{ mb: 2 }}>
          {i18n.t('peopleTags:dialog.description')}
        </DialogContentText>
        <NodesField
          label={i18n.t('peopleTags:dialog.who')}
          helperText={i18n.t('peopleTags:dialog.hint', { max: TAG_MAX })}
          namespaces={['people']}
          value={chosen}
          onChange={setChosen}
          max={TAG_MAX}
          disabled={sending}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={sending}>
          {i18n.t('actions:cancel')}
        </Button>
        <Button variant="contained" onClick={save} disabled={sending}>
          {i18n.t('actions:save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

TagPeopleDialog.propTypes = {
  medium: PropTypes.shape({
    id: PropTypes.number.isRequired,
  }).isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  alertSuccess: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => {
  return {
    alertSuccess: (message) => { return dispatch(actions.app.alert.success(message)); },
    alertError: (message) => { return dispatch(actions.app.alert.error(message)); },
  };
};

export default connect(null, mapDispatchToProps)(TagPeopleDialog);
