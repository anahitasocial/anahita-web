import React, { useState } from 'react';
import PropTypes from 'prop-types';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import ReportIcon from '@mui/icons-material/FlagOutlined';
import SpamIcon from '@mui/icons-material/ReportGmailerrorredOutlined';
import MenuItemLabel from '../../../components/MenuItemLabel';
import ControlBlock from '../../controls/Block';
import ControlFeature from '../../controls/Feature';
import { ShareMenuItem, ofNode } from '../../controls/Share';
import useReport from '../../reports/useReport';
import useRemoveAsSpam from '../../moderation/useRemoveAsSpam';

import ActorType from '../../../proptypes/Actor';
import PersonType from '../../../proptypes/Person';
import utils from '../../../utils';
import i18n from '../../../languages';
import perms from '../../../permissions/actor';

const ITEM_HEIGHT = 48;

const { node } = utils;

const ActorsReadControls = ({
  actor,
  isAuthenticated = false,
  viewer,
  onChanged = null,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpen = (event) => {
    const { currentTarget } = event;
    setAnchorEl(currentTarget);
  };

  const showBlock = isAuthenticated && perms.canBlock(actor, viewer);
  const showEdit = perms.canEdit(actor);
  const showFeature = isAuthenticated && perms.canFeature(actor, viewer);
  const report = useReport(viewer, actor);
  // An administrator removing spam at once (roadmap row 102), then the
  // page read again, which finds it gone.
  const spam = useRemoveAsSpam(viewer, actor, onChanged);

  return (
    <>
      <IconButton
        aria-label={i18n.t('actions:more')}
        aria-owns={anchorEl ? 'long-menu' : null}
        aria-haspopup="true"
        onClick={handleOpen}
        size="large"
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        slotProps={{
          paper: {
            style: {
              maxHeight: ITEM_HEIGHT * 4.5,
              minWidth: 200,
            },
          },
        }}
      >
        <ShareMenuItem
          what={ofNode(actor)}
          onDone={handleClose}
          key="actor-share"
        />
        {showBlock &&
          <ControlBlock
            actor={actor}
            key="actor-socialgraph-block"
            component="menuitem"
            onChange={() => {
              handleClose();
              if (onChanged) {
                onChanged();
              }
            }}
          />}
        {showFeature &&
          <ControlFeature
            actor={actor}
            key="actor-featured"
          />}
        {showEdit &&
          <MenuItem
            key={`actor-edit-${actor.id}`}
            component="a"
            href={`${node.getKindURL(actor)}settings`}
          >
            <MenuItemLabel icon={<SettingsIcon fontSize="small" />}>
              {i18n.t('commons:settings')}
            </MenuItemLabel>
          </MenuItem>}
        {/* No delete here. It deleted a whole profile behind a generic
            "Are you sure?", routing around the Danger zone card that states
            what is destroyed, what is recoverable and by when — so the
            ceremony there was decorative while this existed. Deleting a
            profile is now a deliberate trip to settings. */}
        {report.canReport &&
          <MenuItem
            onClick={() => {
              handleClose();
              report.open();
            }}
          >
            <MenuItemLabel icon={<ReportIcon fontSize="small" />}>
              {i18n.t('abuseReports:report')}
            </MenuItemLabel>
          </MenuItem>}
        {spam.canRemove &&
          <MenuItem
            onClick={() => {
              handleClose();
              spam.open();
            }}
          >
            <MenuItemLabel icon={<SpamIcon fontSize="small" />}>
              {i18n.t('abuseReports:spam.action')}
            </MenuItemLabel>
          </MenuItem>}
      </Menu>
      {report.dialog}
      {spam.dialog}
    </>
  );
};

ActorsReadControls.propTypes = {
  // Told when the profile has changed, as by blocking, to read it again.
  onChanged: PropTypes.func,
  actor: ActorType,
  isAuthenticated: PropTypes.bool,
  viewer: PersonType.isRequired,
};

export default ActorsReadControls;
