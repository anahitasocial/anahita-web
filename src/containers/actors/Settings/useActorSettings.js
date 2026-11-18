import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import actions from '../../../actions';
import permissions from '../../../permissions/actor';
import utils from '../../../utils';
import i18n from '../../../languages';
import {
  getPersonSections,
  getGroupTabs,
  getGroupDangerItems,
  resolveSection,
  ITEMS,
} from './sections';

// A profile's settings page, apart from how it is drawn: the profile read
// once if the store does not hold it, an alert when an edit is saved or
// fails, what the viewer may do here, and which tabs that gives and which
// one is open.
//
// A person's tabs are sections (sections.js), and the open one is in the
// address, which makes it shareable and back-buttonable. A group's, an
// event's or a website's are flat tabs (groupTabs.js), and the open one is
// kept here; a link may say which to open on, as the About card's "Add
// rules" does, and one the page does not have falls back to the first.
//
// It gives the profile and the viewer, `isLoading` while the profile is on
// its way, and either `sections`, `section` and `chooseSection(key)`, for a
// person, or `tabs`, `tab`, `dangerItems` and `chooseTab(key)`.
const useActorSettings = (namespace, selectedTab = ITEMS.INFO) => {
  const dispatch = useDispatch();
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    [namespace]: { current: actor },
    isFetching,
    error,
    success,
  } = useSelector((state) => { return state[namespace]; });
  const viewer = useSelector((state) => { return state.session.viewer; });

  const isPerson = namespace === 'people';
  const isEvent = namespace === 'events';
  const isChannel = namespace === 'channels';

  // People are addressed by their username, everything else by `<id>-<slug>`
  // — see utils/node.getURL, which builds the two differently.
  //
  // Splitting on the first hyphen is right for a group (`42-my-group` -> 42)
  // and wrong for a person: the username validator allows hyphens, so
  // `john-doe` resolved as `john` and anyone with a hyphen in their handle
  // could not open their own settings.
  const id = isPerson ? params.id : params.id.split('-')[0];

  const [tab, setTab] = useState((location.state && location.state.tab) || selectedTab);

  useEffect(() => {
    if (id && !actor.id) {
      dispatch(actions[namespace].read(id, namespace));
    }
  }, []);

  useEffect(() => {
    if (error) {
      dispatch(actions.app.alert.error(i18n.t('prompts:updated.error')));
    }

    if (success) {
      dispatch(actions.app.alert.success(i18n.t('prompts:updated.success')));
    }
  }, [error, success]);

  const canDelete = permissions.canDelete(actor);

  // Site administrator, from the VIEWER rather than from the actor's
  // authorized block. Disabling is a moderation action taken against somebody,
  // so it is the viewer's standing that decides it — actor.authorized answers
  // "may this viewer act on this actor", which a group's own administrators
  // satisfy and who should not be able to suspend it.
  const isAdmin = utils.node.isAdmin(viewer);

  // Removing an account for good is a super administrator's alone.
  const isSuperAdmin = utils.node.isSuperAdmin(viewer);

  const settings = {
    actor,
    viewer,
    isLoading: !actor.id && isFetching,
  };

  if (isPerson) {
    // WebAuthn credentials belong to the current session's own account —
    // the endpoints are viewer-scoped and take no actor id — so the tab
    // only makes sense on the viewer's own profile.
    const isViewer = actor.id === viewer.id;
    const sections = getPersonSections({
      isViewer, canDelete, isAdmin, isSuperAdmin,
    });

    return {
      ...settings,
      sections,
      section: resolveSection(params.section, sections),
      chooseSection: (key) => {
        // push, not replace: the back button should walk the sections the
        // person visited rather than leaving the page entirely.
        navigate(`/people/${params.id}/settings/${key}`);
      },
    };
  }

  // Whoever can open an event's settings looks after it, and may call it
  // off. The server decides.
  const canCancel = isEvent;
  const tabs = getGroupTabs({
    canDelete,
    isAdmin,
    infoHasCard: isEvent,
    canCancel,
    isChannel,
  });

  return {
    ...settings,
    tabs,
    // Falls back rather than trusting the stored value. The default used to
    // be a tab groups never render, which handed MUI a Tabs value it could
    // not match — a console warning and an empty body on every
    // /groups/:id/settings load.
    tab: tabs.find((entry) => {
      return entry.key === tab;
    }) || tabs[0],
    dangerItems: getGroupDangerItems({
      canDelete,
      isAdmin,
      isSuperAdmin,
      canCancel,
      canArchive: true,
      isDeleted: Boolean(actor.deletedAt),
    }),
    chooseTab: setTab,
  };
};

export default useActorSettings;
