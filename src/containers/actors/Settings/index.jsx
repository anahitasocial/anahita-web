import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import ActorSettingCard from '../../../components/ActorSetting';
import Progress from '../../../components/Progress';

import SettingsItem from './SettingsItem';
import { ITEMS } from './sections';
import { ITEM_ICONS, panelsOfPerson, panelsOfGroup } from './panels';
import useActorSettings from './useActorSettings';

import i18n from '../../../languages';
import ActorType from '../../../proptypes/Actor';
import PersonType from '../../../proptypes/Person';

// A profile's settings: a row of tabs, a header naming the open one, and
// what is in it. What there is and who sees it comes from
// useActorSettings.js, and what each item draws from panels.jsx; this file
// only lays them out.

// The Danger tab reads "Danger zone" while the cards inside it read "Disable",
// "Archive" and "Delete" — the section names the risk, each card names its
// action. Every other tab is labelled by its own key.
//
// It used to be the Delete tab wearing that label, back when deletion was the
// only thing in it. Now that three actions share the tab, the label belongs to
// the section rather than to one of them.
const tabLabelKey = (namespace, key) => {
  if (key === ITEMS.DANGER) {
    return `${namespace}:settings.sections.danger`;
  }

  return `${namespace}:settings.${key}`;
};

// The tabs and the header under them, the same for every kind of profile.
// Header only — the open tab's cards stack underneath rather than inside, or
// every card would sit within another card's border. Matching the gap
// SettingsItem puts below each card, so the header does not sit flush
// against the first one.
const SettingsTabs = ({
  actor,
  tabs,
  value,
  onChange,
  children,
}) => {
  const open = tabs.find((entry) => {
    return entry.key === value;
  });

  return (
    <>
      <Tabs
        variant="scrollable"
        scrollButtons
        value={value}
        onChange={(e, key) => {
          onChange(key);
        }}
        aria-label={i18n.t('commons:settings')}
      >
        {tabs.map((entry) => {
          return (
            <Tab
              key={entry.key}
              label={entry.label}
              value={entry.key}
            />
          );
        })}
      </Tabs>
      <Box sx={{ mb: 2 }}>
        <ActorSettingCard
          actor={actor}
          subheader={open.label}
        />
      </Box>
      {children}
    </>
  );
};

SettingsTabs.propTypes = {
  actor: ActorType.isRequired,
  // Each tab's key and what it reads.
  tabs: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

// A person's settings: their sections, and the items of the open one stacked
// one under another.
const PersonSettings = ({
  actor,
  viewer,
  sections,
  section,
  chooseSection,
}) => {
  const panels = panelsOfPerson({ actor, viewer });

  return (
    <SettingsTabs
      actor={actor}
      tabs={sections.map((entry) => {
        return { key: entry.key, label: i18n.t(`people:settings.sections.${entry.key}`) };
      })}
      value={section.key}
      onChange={chooseSection}
    >
      {section.items.map((item) => {
        return (
          <SettingsItem
            key={item.key}
            bare={item.bare}
            icon={ITEM_ICONS[item.key]}
            title={i18n.t(`people:settings.${item.key}`)}
          >
            {panels[item.key]}
          </SettingsItem>
        );
      })}
    </SettingsTabs>
  );
};

PersonSettings.propTypes = {
  actor: ActorType.isRequired,
  viewer: PersonType.isRequired,
  sections: PropTypes.arrayOf(PropTypes.object).isRequired,
  section: PropTypes.object.isRequired,
  chooseSection: PropTypes.func.isRequired,
};

// A group's, an event's or a website's settings: one panel per tab. The same
// layout the person page uses, so a group's Danger zone looks like a
// person's rather than like a different application.
const GroupSettings = ({
  namespace,
  actor,
  tabs,
  tab,
  dangerItems,
  chooseTab,
}) => {
  const panels = panelsOfGroup({
    actor,
    namespace,
    isEvent: namespace === 'events',
    isChannel: namespace === 'channels',
    dangerItems,
  });

  return (
    <SettingsTabs
      actor={actor}
      tabs={tabs.map((entry) => {
        return { key: entry.key, label: i18n.t(tabLabelKey(namespace, entry.key)) };
      })}
      value={tab.key}
      onChange={chooseTab}
    >
      {/* The Danger panel supplies its own SettingsItem per action, so
          wrapping it in another would put three cards inside a fourth. Every
          other tab is a single panel that needs the wrapper. */}
      {tab.key === ITEMS.DANGER ? panels[tab.key] : (
        <SettingsItem
          bare={tab.bare}
          icon={ITEM_ICONS[tab.key]}
          title={i18n.t(`${namespace}:settings.${tab.key}`)}
        >
          {panels[tab.key]}
        </SettingsItem>
      )}
    </SettingsTabs>
  );
};

GroupSettings.propTypes = {
  namespace: PropTypes.string.isRequired,
  actor: ActorType.isRequired,
  tabs: PropTypes.arrayOf(PropTypes.object).isRequired,
  tab: PropTypes.object.isRequired,
  dangerItems: PropTypes.arrayOf(PropTypes.object).isRequired,
  chooseTab: PropTypes.func.isRequired,
};

// The page for one namespace: people, groups, events or channels.
export default (namespace) => {
  const ActorsSettings = ({ selectedTab = ITEMS.INFO }) => {
    const settings = useActorSettings(namespace, selectedTab);

    if (settings.isLoading) {
      return (
        <Progress />
      );
    }

    if (!settings.actor.id) {
      return null;
    }

    if (namespace === 'people') {
      return <PersonSettings {...settings} />;
    }

    return <GroupSettings namespace={namespace} {...settings} />;
  };

  ActorsSettings.propTypes = {
    // Groups only. People no longer take a tab as a prop — their section
    // comes from the URL, so it survives a reload and the back button, which
    // a value read once into useState never did.
    // Drawn from ITEMS rather than a second list beside it. The local TABS
    // constant this replaced named `delete` as a tab, which stopped being
    // true when the three lifecycle actions moved inside one Danger tab — so
    // the prop still advertised a value the page could no longer render.
    selectedTab: PropTypes.oneOf([
      ITEMS.ADMINS,
      ITEMS.INFO,
      ITEMS.ACCESS,
      ITEMS.PERMISSIONS,
      ITEMS.WEBSITE,
      ITEMS.DANGER,
    ]),
  };

  return ActorsSettings;
};
