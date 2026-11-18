import React from 'react';
import PropTypes from 'prop-types';

import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import BlockIcon from '@mui/icons-material/BlockOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import HideIcon from '@mui/icons-material/VisibilityOffOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ReportIcon from '@mui/icons-material/FlagOutlined';
import ShowIcon from '@mui/icons-material/VisibilityOutlined';

import ContentWarningDialog from '../../components/ContentWarningDialog';
import MenuItemLabel from '../../components/MenuItemLabel';
import i18n from '../../languages';
import utils from '../../utils';
import warnings from '../../utils/warnings';

// A reply's menu, behind the three dots beside it, and the dialogs its items
// open. `item` is what useReplyItem gives: which items are there, and the
// menu's own state. Only the items that will work are in it, in this order:
// the original elsewhere, Edit, the content warning, Hide or Show, Delete,
// blocking from the group, Mute, Report.
const ReplyMenu = ({
  reply,
  item,
  onDelete,
  onHide,
  onBlockFromOwner = null,
  blockFromOwnerLabel = '',
}) => {
  const {
    authorized, mute, report, warning,
  } = item;

  // Each item closes the menu, then does what it says.
  const entries = [
    authorized.edit && {
      key: 'edit',
      icon: <EditIcon fontSize="small" />,
      label: i18n.t('replies:actions.edit'),
      run: item.startEditing,
    },
    item.canWarn && {
      key: 'warning',
      icon: warnings.iconOf(warning.kind, { fontSize: 'small' }),
      label: i18n.t('warnings:label'),
      run: item.startWarning,
    },
    authorized.hide && {
      key: 'hide',
      icon: reply.hidden ? <ShowIcon fontSize="small" /> : <HideIcon fontSize="small" />,
      label: i18n.t(reply.hidden ? 'replies:actions.show' : 'replies:actions.hide'),
      run: () => { onHide(reply, !reply.hidden); },
    },
    authorized.delete && {
      key: 'delete',
      icon: <DeleteIcon fontSize="small" />,
      label: i18n.t('replies:actions.delete'),
      run: () => { onDelete(reply); },
    },
    item.canBlockFromOwner && {
      key: 'block',
      icon: <BlockIcon fontSize="small" />,
      label: blockFromOwnerLabel,
      run: () => { onBlockFromOwner(reply); },
    },
    mute.canMute && {
      key: 'mute',
      icon: mute.icon,
      label: mute.label,
      run: mute.toggle,
    },
    report.canReport && {
      key: 'report',
      icon: <ReportIcon fontSize="small" />,
      label: i18n.t('abuseReports:report'),
      run: report.open,
    },
  ].filter(Boolean);

  return (
    <>
      <IconButton
        aria-label={i18n.t('replies:actions.menu')}
        aria-haspopup="true"
        onClick={item.openMenu}
        size="small"
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={item.menuAnchor}
        open={Boolean(item.menuAnchor)}
        onClose={item.closeMenu}
      >
        {item.original &&
          <MenuItem
            component="a"
            href={item.original}
            target="_blank"
            rel="noopener noreferrer"
            onClick={item.closeMenu}
          >
            <MenuItemLabel icon={<OpenInNewIcon fontSize="small" />}>
              {i18n.t('federation:remote.viewOriginal', { domain: utils.federation.domainOf(reply) })}
            </MenuItemLabel>
          </MenuItem>}
        {entries.map((entry) => {
          return (
            <MenuItem
              key={entry.key}
              onClick={() => {
                item.closeMenu();
                entry.run();
              }}
            >
              <MenuItemLabel icon={entry.icon}>
                {entry.label}
              </MenuItemLabel>
            </MenuItem>
          );
        })}
      </Menu>
      {report.dialog}
      {mute.dialog}
      {item.canWarn &&
        <ContentWarningDialog
          open={item.isWarning}
          value={warning}
          saving={item.isSavingWarning}
          moderator={item.moderating}
          onClose={item.stopWarning}
          onSave={item.saveWarning}
        />}
    </>
  );
};

ReplyMenu.propTypes = {
  reply: PropTypes.object.isRequired,
  // What useReplyItem gives for the reply.
  item: PropTypes.object.isRequired,
  onDelete: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired,
  onBlockFromOwner: PropTypes.func,
  blockFromOwnerLabel: PropTypes.string,
};

export default ReplyMenu;
