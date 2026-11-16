import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import BlockServerIcon from '@mui/icons-material/DnsOutlined';

import DialogConfirm from '../../components/DialogConfirm';
import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';
import federation from '../../utils/federation';

// Blocking, for oneself, the server somebody on the fediverse is on
// (roadmap row 152), from their profile's menu, as Mute is:
//
//   {server.canBlock && <MenuItem onClick={() => { close(); server.ask(); }}>
//     <MenuItemLabel icon={server.icon}>{server.label}</MenuItemLabel></MenuItem>}
//   {server.dialog}
//
// Not for somebody on Bluesky, whose servers cannot be told apart, nor for
// anybody here. A confirmation says what it does; the other server is told
// nothing but the follows that end. Lifted in Settings, Blocked servers.
const useBlockServer = (viewer, actor, onChanged) => {
  const dispatch = useDispatch();
  const [isAsking, setIsAsking] = useState(false);
  const domain = federation.domainOf(actor);
  const canBlock = Boolean(viewer && viewer.id && actor && actor.id !== viewer.id) &&
    federation.fromFediverse(actor) && Boolean(domain);

  const block = () => {
    api.serverBlocks.add(viewer, domain).then(() => {
      dispatch(actions.app.alert.success(i18n.t('socialgraph:servers.done', { domain })));
      if (onChanged) {
        onChanged();
      }
    }).catch(() => {
      dispatch(actions.app.alert.error(i18n.t('socialgraph:servers.failed')));
    });
  };

  return {
    canBlock,
    icon: <BlockServerIcon fontSize="small" />,
    label: i18n.t('socialgraph:servers.menu'),
    ask: () => {
      setIsAsking(true);
    },
    dialog: canBlock ? (
      <DialogConfirm
        open={isAsking}
        onClose={() => {
          setIsAsking(false);
        }}
        onConfirm={block}
        title={i18n.t('socialgraph:servers.confirmTitle', { domain })}
        message={i18n.t('socialgraph:servers.confirmText', { domain })}
        confirm={i18n.t('socialgraph:servers.block')}
      >
        <span />
      </DialogConfirm>
    ) : null,
  };
};

export default useBlockServer;
