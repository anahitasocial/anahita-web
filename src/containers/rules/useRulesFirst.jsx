import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';

import RulesChecklist from '../../components/RulesChecklist';
import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';

// A group's or an event's rules, ticked one at a time before joining it
// (roadmap row 102, part 5b): following, asking to follow, answering an
// event or accepting an invitation. The server refuses those until the
// rules are agreed to at the version they are at (409 `rules_not_agreed`).
//
//   const rules = useRulesFirst(actor);
//   onClick={() => { rules.run(follow); }}
//   …
//   {rules.dialog}
//
// `run` reads the rules; with none, or agreed to already, it does the thing
// at once; otherwise it asks, and does it once they are agreed to. An
// administrator, who writes them, is not asked: the server lets them by.
// `purpose` is 'join' (following, asking, answering, accepting) or 'post'.
const useRulesFirst = (actor, purpose = 'join') => {
  const dispatch = useDispatch();
  const phone = useMediaQuery((theme) => { return theme.breakpoints.down('sm'); });
  const [asking, setAsking] = useState(null);
  const [sending, setSending] = useState(false);

  const close = () => {
    setAsking(null);
  };

  const type = (actor && actor.type) || '';
  const hasRules = type.includes('.group.') || type.includes('.event.');

  const run = (action) => {
    // A person has no rules to agree to.
    if (!hasRules) {
      return Promise.resolve(action());
    }
    return api.rules.read(actor).then(({ data }) => {
      const items = data.items || [];
      if (items.length === 0 || data.agreedVersion >= data.version) {
        return action();
      }
      setAsking({ rules: data, action });
      return null;
    }).catch(() => {
      // Their rules could not be read: the server says if it minds.
      return action();
    });
  };

  const agree = () => {
    setSending(true);
    api.rules.agree(actor, asking.rules.version)
      .then(() => {
        const { action } = asking;
        close();
        return action();
      })
      .catch(() => {
        dispatch(actions.app.alert.error(i18n.t('rules:prompts.notAgreed')));
      })
      .finally(() => {
        setSending(false);
      });
  };

  return {
    run,
    dialog: asking &&
      <Dialog open onClose={sending ? undefined : close} fullWidth maxWidth="sm" fullScreen={phone}>
        <DialogTitle>
          {i18n.t('rules:join.title', { name: actor.name || actor.alias })}
        </DialogTitle>
        <DialogContent>
          <DialogContentText variant="body2" sx={{ mb: 2 }}>
            {/* Agreed before: they changed since. Otherwise, what for. */}
            {i18n.t(asking.rules.agreedVersion > 0 ?
              'rules:join.introChanged' :
              `rules:join.${purpose === 'post' ? 'introPost' : 'intro'}`)}
          </DialogContentText>
          <RulesChecklist
            items={asking.rules.items}
            agreeLabel={i18n.t('rules:join.agree')}
            onAgree={agree}
            sending={sending}
            cancel={
              <Button fullWidth disabled={sending} onClick={close}>
                {i18n.t('actions:cancel')}
              </Button>
            }
          />
        </DialogContent>
      </Dialog>,
  };
};

export default useRulesFirst;
