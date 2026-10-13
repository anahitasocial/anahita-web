import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import DownloadIcon from '@mui/icons-material/FileDownloadOutlined';
import NotAllowedIcon from '@mui/icons-material/FileDownloadOff';

import MenuItemLabel from '../../../components/MenuItemLabel';
import actions from '../../../actions';
import api from '../../../api/downloads';
import NodeType from '../../../proptypes/Node';
import i18n from '../../../languages';
import downloads from '../../../utils/downloads';
import utils from '../../../utils';

// Download, in the row of buttons under a photo or a video, drawn as the
// others there are. Shown only where the server said this viewer may: the
// post's author allowed it, or the viewer is the author.
//
// A post with several images opens a short list, one for each; anything
// else downloads at the press. The file comes from the API, which sends
// the browser on to it as something to save.
const DownloadAction = ({ node }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  if (!downloads.canDownload(node)) {
    return null;
  }

  const parts = downloads.partsOf(node);
  const label = i18n.t('actions:download');

  return (
    <>
      <Button
        onClick={(event) => {
          if (parts.length > 1) {
            setAnchorEl(event.currentTarget);
          } else {
            downloads.start(downloads.urlOf(node, parts[0]));
          }
        }}
        startIcon={<DownloadIcon />}
        color="inherit"
        aria-label={label}
        title={label}
        aria-haspopup={parts.length > 1 ? 'menu' : undefined}
        aria-expanded={anchorEl ? 'true' : undefined}
        fullWidth
      />
      {parts.length > 1 &&
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => {
            setAnchorEl(null);
          }}
          // Opens upward, as the repost menu beside it does.
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          {parts.map((part) => {
            return (
              <MenuItem
                key={`download-${node.id}-${part.key}`}
                onClick={() => {
                  setAnchorEl(null);
                  downloads.start(downloads.urlOf(node, part));
                }}
              >
                <MenuItemLabel icon={<DownloadIcon fontSize="small" />}>
                  {i18n.t('media:download.photo', { number: part.number, count: parts.length })}
                </MenuItemLabel>
              </MenuItem>
            );
          })}
        </Menu>}
    </>
  );
};

DownloadAction.propTypes = {
  node: NodeType.isRequired,
};

// "Allow download" and "Do not allow download", in the menu of a photo or
// a video, for whoever may edit it.
const DownloadSwitchMenuItemBase = React.forwardRef(({
  medium,
  changed,
  alertError,
  onDone = null,
}, ref) => {
  const [isWaiting, setIsWaiting] = useState(false);

  if (!downloads.hasSwitch(medium)) {
    return null;
  }

  const allowed = Boolean(medium.allowDownload);
  const label = i18n.t(allowed ? 'media:download.stop' : 'media:download.allow');

  const handleClick = () => {
    setIsWaiting(true);

    api.setAllowed(medium, !allowed).then((result) => {
      changed(utils.node.getNamespace(medium), result.data);
    }).catch(() => {
      alertError(i18n.t('media:download.failed'));
    })
      .finally(() => {
        setIsWaiting(false);
        if (onDone) {
          onDone();
        }
      });
  };

  return (
    <MenuItem onClick={handleClick} disabled={isWaiting} ref={ref}>
      <MenuItemLabel
        icon={allowed ? <NotAllowedIcon fontSize="small" /> : <DownloadIcon fontSize="small" />}
      >
        {label}
      </MenuItemLabel>
    </MenuItem>
  );
});

DownloadSwitchMenuItemBase.propTypes = {
  medium: NodeType.isRequired,
  changed: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
  // Called when it is over, either way: to close the menu.
  onDone: PropTypes.func,
};

const mapDispatchToProps = (dispatch) => {
  return {
    // Told to the store as any change to the post is, so that the page
    // and its lists show the post as the server now has it.
    changed: (namespace, node) => {
      return dispatch({ type: `${namespace.toUpperCase()}_EDIT_ACCESS_SUCCESS`, node });
    },
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
};

const DownloadSwitchMenuItem = connect(
  null,
  mapDispatchToProps,
  null,
  { forwardRef: true },
)(DownloadSwitchMenuItemBase);

export { DownloadAction, DownloadSwitchMenuItem };
