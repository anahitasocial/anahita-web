import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import DraftsIcon from '@mui/icons-material/DraftsOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import NewIcon from '@mui/icons-material/AddOutlined';

import api from '../../../api';
import i18n from '../../../languages';

const NAMESPACES = { article: 'articles', topic: 'topics' };

// One's drafts on this profile, articles and topics still being written,
// to take up again or to throw away (the user, 2026-10-16). Kept on the
// server, so they are there on any device; seen by nobody else.
const DraftsMenu = ({
  actor,
  kinds,
  phone,
  currentId = 0,
  disabled = false,
  onOpen,
  onNew,
}) => {
  const [anchor, setAnchor] = useState(null);
  const [drafts, setDrafts] = useState(null);

  const load = () => {
    setDrafts(null);
    Promise.all(kinds.map((kind) => {
      const listed = api[NAMESPACES[kind]].browse({ oid: actor.id, drafts: 1, limit: 50 });
      return listed.then((result) => {
        return ((result.data && result.data.data) || []).map((draft) => {
          return { ...draft, kind };
        });
      }).catch(() => {
        return [];
      });
    })).then((lists) => {
      setDrafts(lists.flat().sort((a, b) => {
        return moment(b.updatedAt).valueOf() - moment(a.updatedAt).valueOf();
      }));
    });
  };

  const label = i18n.t('composer:drafts.title');
  const open = (event) => {
    setAnchor(event.currentTarget);
    load();
  };

  return (
    <>
      {phone ?
        <Tooltip title={label}>
          <span>
            <IconButton aria-label={label} onClick={open} disabled={disabled}>
              <DraftsIcon />
            </IconButton>
          </span>
        </Tooltip> :
        <Button
          startIcon={<DraftsIcon />}
          onClick={open}
          disabled={disabled}
          sx={{ color: 'text.secondary' }}
        >
          {label}
        </Button>}
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => {
          setAnchor(null);
        }}
        slotProps={{ paper: { sx: { width: 360, maxWidth: 'calc(100vw - 32px)' } } }}
      >
        {currentId > 0 &&
          <MenuItem
            onClick={() => {
              setAnchor(null);
              onNew();
            }}
          >
            <NewIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
            {i18n.t('composer:drafts.new')}
          </MenuItem>}
        {currentId > 0 && <Divider />}
        {drafts === null &&
          <MenuItem disabled sx={{ justifyContent: 'center' }}>
            <CircularProgress size={20} />
          </MenuItem>}
        {drafts && drafts.length === 0 &&
          <MenuItem disabled>{i18n.t('composer:drafts.none')}</MenuItem>}
        {drafts && drafts.map((draft) => {
          return (
            <MenuItem
              key={`draft-${draft.id}`}
              selected={draft.id === currentId}
              onClick={() => {
                setAnchor(null);
                onOpen(draft);
              }}
            >
              <ListItemText
                primary={draft.name || i18n.t('composer:drafts.untitled')}
                secondary={`${i18n.t(`composer:kinds.${draft.kind}`)} · ${moment.utc(draft.updatedAt || draft.createdAt).fromNow()}`}
                slotProps={{ primary: { noWrap: true, dir: 'auto' } }}
              />
              <Tooltip title={i18n.t('composer:drafts.remove')}>
                <IconButton
                  edge="end"
                  size="small"
                  aria-label={i18n.t('composer:drafts.remove')}
                  onClick={(event) => {
                    event.stopPropagation();
                    api[NAMESPACES[draft.kind]].deleteItem(draft).then(() => {
                      setDrafts((before) => {
                        return before.filter((each) => { return each.id !== draft.id; });
                      });
                      if (draft.id === currentId) {
                        onNew();
                      }
                    }).catch(() => {});
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

DraftsMenu.propTypes = {
  actor: PropTypes.object.isRequired,
  kinds: PropTypes.arrayOf(PropTypes.string).isRequired,
  phone: PropTypes.bool.isRequired,
  // The draft being written now, if it is one.
  currentId: PropTypes.number,
  disabled: PropTypes.bool,
  // Called with the draft to take up again.
  onOpen: PropTypes.func.isRequired,
  // Called to begin a new one.
  onNew: PropTypes.func.isRequired,
};

export default DraftsMenu;
