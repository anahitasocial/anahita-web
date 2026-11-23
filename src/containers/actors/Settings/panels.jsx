import React from 'react';

import Stack from '@mui/material/Stack';

import InfoIcon from '@mui/icons-material/Info';
import AdminsIcon from '@mui/icons-material/SupervisorAccount';
import DisableIcon from '@mui/icons-material/Block';
import ArchiveIcon from '@mui/icons-material/Archive';
import CancelIcon from '@mui/icons-material/EventBusy';
import DeleteIcon from '@mui/icons-material/DeleteForever';
import PurgeIcon from '@mui/icons-material/DeleteSweep';
import DangerIcon from '@mui/icons-material/Warning';
import WebsiteIcon from '@mui/icons-material/Code';
import RulesIcon from '@mui/icons-material/Rule';
import ReportsIcon from '@mui/icons-material/OutlinedFlag';

import Admins from './admins/Browse';
import AuthLogs from '../../auth/AuthLogs';
import Password from '../../auth/Password';
import Username from '../../auth/Username';
import WebAuthn from '../../auth/WebAuthn';
import Email from '../../auth/Email';
import Totp from '../../auth/Totp';
import Delete from './Delete';
import Purge from './Purge';
import Archive from './Archive';
import Disable from './Disable';
import Info from './Info';
import PersonInfo from '../../people/Settings/Info';
import Access from './Access';
import Permissions from './Permissions';
import PostKinds from './ChannelPostKinds';
import ActorRules from './Rules';
import ActorReports from './Reports';
import RepostsOnProfile from './RepostsOnProfile';
import DownloadDefault from './DownloadDefault';
import QuotePolicy from './QuotePolicy';
import ContentChoices from './ContentChoices';
import GraphAccess from './GraphAccess';
import SearchEngines from './SearchEngines';
import BlockedServers from './BlockedServers';
import ActorBlocked from './Blocked';
import DataExport from './DataExport';
import DataImport from './DataImport';
import ActorSuggestions from './Suggestions';
import ActorNotificationChoices from './NotificationChoices';
import ActorFediverse from './Fediverse';
import ActorMoving from './Moving';
import ActorBluesky from './Bluesky';
import EventForm from '../../events/Form';
import EventCancelSetting from '../../events/CancelSetting';
import WebsiteFollowSnippet from '../../channels/FollowSnippet';
import ChannelFeedCard from '../../channels/FeedCard';
import PersonAgreements from '../../people/Settings/Agreements';
import PersonAccountType from '../../people/Settings/AccountType';
import PersonMetadata from '../../people/Settings/Metadata';
import PersonRevokePasskeys from '../../people/Settings/RevokePasskeys';
import PersonRevokeTotp from '../../people/Settings/RevokeTotp';

import SettingsItem from './SettingsItem';
import { ITEMS } from './sections';

import i18n from '../../../languages';

// What each settings item draws: its icon, and the component behind its
// key. sections.js and groupTabs.js say which items there are and who sees
// them; this module says what each one is. Kept apart from them on purpose:
// they stay JSX-free so they can be read and tested as plain data, and an
// icon or a card is JSX.

// The avatar for each item whose header SettingsItem supplies.
//
// Only the bare ones need an entry: a component that brings its own Card
// brings its own avatar with it, and a key missing here renders a header
// with no avatar rather than breaking.
export const ITEM_ICONS = {
  [ITEMS.INFO]: <InfoIcon />,
  [ITEMS.ADMINS]: <AdminsIcon />,
  [ITEMS.DISABLE]: <DisableIcon />,
  [ITEMS.CANCEL]: <CancelIcon />,
  [ITEMS.ARCHIVE]: <ArchiveIcon />,
  [ITEMS.DELETE]: <DeleteIcon />,
  [ITEMS.PURGE]: <PurgeIcon />,
  [ITEMS.DANGER]: <DangerIcon />,
  [ITEMS.WEBSITE]: <WebsiteIcon />,
  [ITEMS.RULES]: <RulesIcon />,
  [ITEMS.REPORTS]: <ReportsIcon />,
};

// The cards for one namespace, built once and kept.
//
// Each factory returns a new connected component, and these were called in
// the render body. A new component type on every render means React discards
// the old card and mounts a fresh one — so any store update, such as the
// delete request itself, reset every card's local state. The Delete card set
// "open the step-up dialog" on a card that was replaced a moment later, and
// deleting a profile failed with a generic error and no dialog.
const cardsByNamespace = {};

const cardsFor = (namespace) => {
  if (!cardsByNamespace[namespace]) {
    cardsByNamespace[namespace] = {
      ActorAdmins: Admins(namespace),
      ActorInfo: Info(namespace),
      ActorAccess: Access(namespace),
      ActorGraphAccess: GraphAccess(namespace),
      ActorSearchEngines: SearchEngines(namespace),
      ActorPermissions: Permissions(namespace),
      ActorPostKinds: PostKinds(namespace),
      ActorReposts: RepostsOnProfile(namespace),
      ActorDownloads: DownloadDefault(namespace),
      ActorQuotes: QuotePolicy(namespace),
      ActorDelete: Delete(namespace),
      ActorPurge: Purge(namespace),
      ActorArchive: Archive(namespace),
      ActorDisable: Disable(namespace),
    };
  }

  return cardsByNamespace[namespace];
};

// What each item key of a person's settings draws. The props these
// components need differ per item, so they live here, next to the
// components, rather than in sections.js.
export const panelsOfPerson = ({ actor, viewer }) => {
  const {
    ActorAccess,
    ActorGraphAccess,
    ActorSearchEngines,
    ActorPermissions,
    ActorReposts,
    ActorQuotes,
    ActorDownloads,
    ActorDisable,
    ActorArchive,
    ActorDelete,
    ActorPurge,
  } = cardsFor('people');

  const panels = {
    [ITEMS.INFO]: <PersonInfo />,
    [ITEMS.EMAIL]: <Email />,
    [ITEMS.USERNAME]: <Username />,
    [ITEMS.PASSWORD]: <Password />,
    [ITEMS.TOTP]: <Totp viewer={viewer} />,
    [ITEMS.WEBAUTHN]: <WebAuthn />,
    [ITEMS.AUTHLOGS]: <AuthLogs personId={actor.id} />,
    // Who can see the profile, then who can see its followers and whom
    // it follows (roadmap row 151), then whether search engines may index
    // it (row 174).
    [ITEMS.ACCESS]: (
      <Stack spacing={2}>
        <ActorAccess />
        <ActorGraphAccess />
        <ActorSearchEngines />
      </Stack>
    ),
    [ITEMS.REPOSTS]: <ActorReposts />,
    [ITEMS.QUOTES]: <ActorQuotes />,
    [ITEMS.DOWNLOADS]: <ActorDownloads />,
    [ITEMS.BLOCKED]: <ActorBlocked actor={actor} />,
    [ITEMS.MUTED]: <ActorBlocked actor={actor} kind="mutes" />,
    [ITEMS.BLOCKED_SERVERS]: <BlockedServers />,
    [ITEMS.DATA_EXPORT]: <DataExport />,
    [ITEMS.DATA_IMPORT]: <DataImport />,
    [ITEMS.SUGGESTIONS]: <ActorSuggestions />,
    [ITEMS.FEDIVERSE]: <ActorFediverse />,
    [ITEMS.MOVING]: <ActorMoving />,
    [ITEMS.NOTIFICATIONS]: <ActorNotificationChoices />,
    [ITEMS.CONTENT_CHOICES]: <ContentChoices />,
    [ITEMS.BLUESKY]: <ActorBluesky />,
    [ITEMS.PERMISSIONS]: <ActorPermissions />,
    // Administration. Every one of these takes the actor being looked
    // at rather than the viewer — the endpoints behind them are the
    // admin counterparts of the viewer-scoped ones in Security, and
    // sections.js keeps them off the viewer's own profile.
    [ITEMS.ACCOUNT_TYPE]: <PersonAccountType person={actor} />,
    [ITEMS.AGREEMENTS]: <PersonAgreements personId={actor.id} />,
    [ITEMS.METADATA]: <PersonMetadata person={actor} />,
    [ITEMS.REVOKE_PASSKEYS]: <PersonRevokePasskeys person={actor} />,
    [ITEMS.REVOKE_TOTP]: <PersonRevokeTotp person={actor} />,
    [ITEMS.DISABLE]: <ActorDisable />,
    [ITEMS.ARCHIVE]: <ActorArchive />,
    [ITEMS.DELETE]: <ActorDelete />,
    [ITEMS.PURGE]: <ActorPurge />,
  };

  return panels;
};

// What each tab of a group's, an event's or a website's settings draws.
//
// Every key getGroupTabs can return needs an entry here, or selecting that
// tab renders undefined — a tab that opens onto nothing, with no error
// (__tests__/sections.test.js checks it).
//
// The Danger tab is the one that is not a single panel: it stacks its
// actions the way the person page stacks a section's items, so the three can
// be compared rather than hunted for.
export const panelsOfGroup = ({
  actor,
  namespace,
  isEvent,
  isChannel,
  dangerItems,
}) => {
  const {
    ActorAdmins,
    ActorInfo,
    ActorAccess,
    ActorGraphAccess,
    ActorSearchEngines,
    ActorPermissions,
    ActorPostKinds,
    ActorDownloads,
    ActorDisable,
    ActorArchive,
    ActorDelete,
    ActorPurge,
  } = cardsFor(namespace);

  const groupPanels = {
    // An event's name is saved with when it is and how many may go, so
    // its Info is the event's own form and not the one a group has.
    [ITEMS.INFO]: isEvent ? <EventForm actor={actor} /> : <ActorInfo />,
    [ITEMS.ADMINS]: <ActorAdmins />,
    // Who can see it, and who it has blocked: one of its administrators
    // blocks somebody from the menu on what they wrote in it. A channel's
    // too (roadmap row 147, phase 2).
    [ITEMS.ACCESS]: (
      <Stack spacing={2}>
        <ActorAccess />
        <ActorGraphAccess />
        <ActorSearchEngines />
        <ActorBlocked actor={actor} />
      </Stack>
    ),
    // Its website's feed (phase 4), then the lines its site pastes in.
    [ITEMS.WEBSITE]: (
      <Stack spacing={2}>
        <ChannelFeedCard channel={actor} />
        <SettingsItem bare title={i18n.t('channels:settings.snippetTitle')} icon={<WebsiteIcon />}>
          <WebsiteFollowSnippet actor={actor} />
        </SettingsItem>
      </Stack>
    ),
    [ITEMS.RULES]: <ActorRules actor={actor} />,
    [ITEMS.REPORTS]: <ActorReports actor={actor} />,
    // Whether it is on the fediverse, and its own Bluesky account, as a
    // person's tab holds both.
    [ITEMS.FEDIVERSE]: (
      <Stack spacing={2}>
        <ActorFediverse profile={actor} />
        <ActorBluesky profile={actor} />
      </Stack>
    ),
    // Who can do what in the group, and with what is posted in it: whether
    // its new photos and videos start out downloadable. Not an event's.
    // A channel's says what it posts: its admins alone write on it.
    [ITEMS.PERMISSIONS]: isEvent ? <ActorPermissions /> : (
      <Stack spacing={2}>
        {isChannel ? <ActorPostKinds /> : <ActorPermissions />}
        <ActorDownloads />
      </Stack>
    ),
    [ITEMS.DANGER]: (
      <>
        {dangerItems.map((item) => {
          return (
            <SettingsItem
              key={item.key}
              bare={item.bare}
              icon={ITEM_ICONS[item.key]}
              title={i18n.t(`${namespace}:settings.${item.key}`)}
            >
              {{
                [ITEMS.CANCEL]: <EventCancelSetting />,
                [ITEMS.DISABLE]: <ActorDisable />,
                [ITEMS.ARCHIVE]: <ActorArchive />,
                [ITEMS.DELETE]: <ActorDelete />,
                [ITEMS.PURGE]: <ActorPurge />,
              }[item.key]}
            </SettingsItem>
          );
        })}
      </>
    ),
  };

  return groupPanels;
};
