import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import actions from '../../../actions';
import i18n from '../../../languages';
import utils from '../../../utils';

// One setting of the profile whose settings are open, saved as soon as it is
// chosen: a switch or a choice with nothing else to send along with it, as
// whether reposts show on the profile, or who may quote its posts.
//
// Every such card did the same four things: send the choice, read the
// profile again so the page shows what the server now holds, say whether it
// was saved, and keep the control still while it is on its way. They are
// here once.
//
//   save(request, { saved, notSaved })
//     request    sends the choice, and gives the server's promise
//     saved      what the alert says when it was saved, as an i18n key
//     notSaved   what it says when it was not
//
// It gives the profile, the viewer, `isSaving` and `save`.
const useSaveSetting = (namespace) => {
  const dispatch = useDispatch();
  const actor = useSelector((state) => { return state[namespace][namespace].current; });
  const viewer = useSelector((state) => { return state.session.viewer; });
  const [isSaving, setIsSaving] = useState(false);

  const save = (request, { saved, notSaved }) => {
    setIsSaving(true);
    return request().then(() => {
      return dispatch(actions[namespace].read(utils.node.readKeyOf(actor), namespace));
    }).then(() => {
      dispatch(actions.app.alert.success(i18n.t(saved)));
    }).catch(() => {
      dispatch(actions.app.alert.error(i18n.t(notSaved)));
    })
      .finally(() => {
        setIsSaving(false);
      });
  };

  return {
    actor,
    viewer,
    isSaving,
    save,
  };
};

// A card of the settings page made for one namespace, as the page asks for
// them (panels.jsx): `forNamespace(Card)('groups')` is the card, told it is
// a group's.
export const forNamespace = (Card) => {
  return (namespace) => {
    const ForNamespace = () => {
      return React.createElement(Card, { namespace });
    };
    return ForNamespace;
  };
};

export default useSaveSetting;
