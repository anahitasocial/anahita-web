import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import FediverseAccounts from './FediverseAccounts';
import FediverseProfiles from './FediverseProfiles';
import FediverseServers from './FediverseServers';
import i18n from '../../languages';
import permissions from '../../permissions';

const SERVERS = 'servers';
const ACCOUNTS = 'accounts';
const PROFILES = 'profiles';

// Site settings' Fediverse tab: what this installation has to do with other
// networks, in three lists. Servers, refused for everybody on them, by super
// administrators; Accounts, refused one by one, by administrators too; and
// Profiles, who from other networks is kept here, for administrators to see
// (the user, 2026-11-01).
const SettingsFediverse = () => {
  const viewer = useSelector((state) => { return state.session.viewer; });
  const lists = permissions.settings.canRefuseServers(viewer) ?
    [SERVERS, ACCOUNTS, PROFILES] :
    [ACCOUNTS, PROFILES];
  const [chosen, setChosen] = useState(lists[0]);
  const list = lists.includes(chosen) ? chosen : lists[0];

  return (
    <Card>
      {lists.length > 1 &&
        <>
          <Tabs
            value={list}
            onChange={(event, value) => {
              setChosen(value);
            }}
            variant="fullWidth"
            aria-label={i18n.t('settings:fediverse.mTitle')}
          >
            {lists.map((value) => {
              return (
                <Tab
                  key={value}
                  value={value}
                  label={i18n.t(`settings:fediverse.tabs.${value}`)}
                />
              );
            })}
          </Tabs>
          <Divider />
        </>}
      {list === SERVERS && <FediverseServers />}
      {list === ACCOUNTS && <FediverseAccounts />}
      {list === PROFILES && <FediverseProfiles />}
    </Card>
  );
};

export default SettingsFediverse;
