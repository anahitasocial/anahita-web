import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import FediverseAccounts from './FediverseAccounts';
import FediverseServers from './FediverseServers';
import i18n from '../../languages';
import permissions from '../../permissions';

const SERVERS = 'servers';
const ACCOUNTS = 'accounts';

// Site settings' Fediverse tab: what this installation refuses of other
// networks, in two lists (the user, 2026-10-29). Servers, refused for
// everybody on them, by super administrators; and Accounts, refused one by
// one, by administrators too. An administrator sees the Accounts alone,
// with no tabs to choose between.
const SettingsFediverse = () => {
  const viewer = useSelector((state) => { return state.session.viewer; });
  const lists = permissions.settings.canRefuseServers(viewer) ? [SERVERS, ACCOUNTS] : [ACCOUNTS];
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
      {list === SERVERS ? <FediverseServers /> : <FediverseAccounts />}
    </Card>
  );
};

export default SettingsFediverse;
