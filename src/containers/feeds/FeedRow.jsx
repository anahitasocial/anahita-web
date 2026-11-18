import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';

import Avatar from '@mui/material/Avatar';
import ButtonBase from '@mui/material/ButtonBase';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import DownIcon from '@mui/icons-material/ArrowDownward';
import EditIcon from '@mui/icons-material/EditOutlined';
import MoreIcon from '@mui/icons-material/MoreVert';
import PinIcon from '@mui/icons-material/AddHomeOutlined';
import UnpinIcon from '@mui/icons-material/Home';
import UpIcon from '@mui/icons-material/ArrowUpward';

import { ShareMenuItem } from '../controls/Share';
import MenuItemLabel from '../../components/MenuItemLabel';
import CustomFeedIcon from '../../components/CustomFeedIcon';
import DialogConfirm from '../../components/DialogConfirm';
import i18n from '../../languages';
import customFeeds from '../../utils/customFeeds';
import utils from '../../utils';

const { getActorName } = utils.node;

// What else can be done with a feed, in a menu, so that its row keeps room
// for its name on a mobile: Edit, Delete, then Share, last as everywhere.
// Kept mounted, so that Delete's question stays when the menu is closed.
const FeedMenu = ({ feed, waiting, onDelete }) => {
  const [anchor, setAnchor] = useState(null);
  const close = () => {
    setAnchor(null);
  };
  const canEdit = Boolean(feed.authorized && feed.authorized.edit);
  const canDelete = Boolean(feed.authorized && feed.authorized.delete);
  const canShare = customFeeds.isShared(feed);

  if (!canEdit && !canDelete && !canShare) {
    return null;
  }

  return (
    <>
      <IconButton
        aria-label={i18n.t('customFeeds:actions.more')}
        onClick={(event) => {
          setAnchor(event.currentTarget);
        }}
      >
        <MoreIcon />
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={close} keepMounted>
        {canEdit &&
          <MenuItem component={RouterLink} to={`${customFeeds.urlOf(feed)}/edit`} onClick={close}>
            <MenuItemLabel icon={<EditIcon fontSize="small" />}>
              {i18n.t('customFeeds:actions.edit')}
            </MenuItemLabel>
          </MenuItem>}
        {canDelete &&
          <DialogConfirm
            title={i18n.t('customFeeds:delete.title')}
            message={i18n.t('customFeeds:delete.message')}
            confirm={i18n.t('customFeeds:delete.confirm')}
            dismiss={i18n.t('customFeeds:delete.dismiss')}
          >
            <MenuItem
              disabled={waiting}
              onClick={() => {
                close();
                onDelete(feed);
              }}
            >
              <MenuItemLabel icon={<DeleteIcon fontSize="small" color="error" />}>
                {i18n.t('customFeeds:actions.delete')}
              </MenuItemLabel>
            </MenuItem>
          </DialogConfirm>}
        {canShare &&
          <ShareMenuItem what={customFeeds.toShare(feed)} onDone={close} />}
      </Menu>
    </>
  );
};

FeedMenu.propTypes = {
  feed: PropTypes.object.isRequired,
  waiting: PropTypes.bool.isRequired,
  onDelete: PropTypes.func.isRequired,
};

// An icon button with its name in a tooltip. The span lets the tooltip
// show while the button is disabled.
const TipButton = ({ label, children, ...props }) => {
  return (
    <Tooltip title={label}>
      <span>
        <IconButton aria-label={label} {...props}>
          {children}
        </IconButton>
      </span>
    </Tooltip>
  );
};

TipButton.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

// One feed in the list: its picture and name, which opens what it shows in a
// dialog; whose it is or who may see it, and when it was made; one line of
// what it is for. Then the house that puts it on the home page or takes it
// off, the arrows that move it there, and the menu.
//
// A feed on the home page has a filled house; pressing it takes it off.
const FeedRow = ({
  feed,
  viewer,
  place,
  pinnedCount,
  canMove,
  waiting,
  onDetails,
  onPin,
  onMove,
  onDelete,
}) => {
  const isPinned = place >= 0;
  const isOwn = Boolean(feed.owner) && feed.owner.id === viewer.id;
  const pinLabel = i18n.t(isPinned ? 'customFeeds:actions.unpin' : 'customFeeds:actions.pin');

  return (
    <Card sx={{ mb: 2 }}>
      <CardHeader
        avatar={
          <Avatar>
            <CustomFeedIcon name={feed.icon} />
          </Avatar>
        }
        title={
          <ButtonBase
            onClick={() => {
              onDetails(feed.id);
            }}
            sx={{
              display: 'block',
              maxWidth: '100%',
              font: 'inherit',
              textAlign: 'left',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {feed.name}
          </ButtonBase>
        }
        subheader={
          <>
            <Typography
              variant="body2"
              color="textSecondary"
              component="span"
              noWrap
              sx={{ display: 'block' }}
            >
              {isOwn ?
                i18n.t(`customFeeds:access.${feed.access}`) :
                i18n.t('customFeeds:list.by', { name: getActorName(feed.owner || {}) })}
              {/* When it was made, to tell one from another like it. */}
              {customFeeds.madeOn(feed, i18n.language) &&
                ` · ${i18n.t('customFeeds:made', { date: customFeeds.madeOn(feed, i18n.language) })}`}
            </Typography>
            {/* One line, cut short: what it is for, or what it shows when
                it does not say. The whole of it is in the dialog its
                name opens, so every row here is the same height. */}
            <Typography
              variant="body2"
              color="textSecondary"
              component="span"
              noWrap
              sx={{ display: 'block' }}
            >
              {feed.body || customFeeds.summary(feed.definition, i18n.t.bind(i18n), { isOwn })}
            </Typography>
          </>
        }
        action={
          <Stack direction="row">
            {isPinned && canMove &&
              <>
                <TipButton
                  label={i18n.t('customFeeds:actions.moveUp')}
                  disabled={waiting || place === 0}
                  onClick={() => {
                    onMove(feed, -1);
                  }}
                >
                  <UpIcon />
                </TipButton>
                <TipButton
                  label={i18n.t('customFeeds:actions.moveDown')}
                  disabled={waiting || place === pinnedCount - 1}
                  onClick={() => {
                    onMove(feed, 1);
                  }}
                >
                  <DownIcon />
                </TipButton>
              </>}
            <TipButton
              label={pinLabel}
              color={isPinned ? 'primary' : 'default'}
              aria-pressed={isPinned}
              disabled={waiting}
              onClick={() => {
                onPin(feed, !isPinned);
              }}
            >
              {isPinned ? <UnpinIcon /> : <PinIcon />}
            </TipButton>
            <FeedMenu feed={feed} waiting={waiting} onDelete={onDelete} />
          </Stack>
        }
        slotProps={{
          title: {
            variant: 'subtitle1', component: 'h3', noWrap: true, sx: { fontWeight: 500 },
          },
          // Lets the lines be cut short instead of pushing the buttons
          // off the card.
          content: { sx: { minWidth: 0 } },
        }}
      />
    </Card>
  );
};

FeedRow.propTypes = {
  feed: PropTypes.object.isRequired,
  viewer: PropTypes.object.isRequired,
  // Its place on the home page, or -1.
  place: PropTypes.number.isRequired,
  pinnedCount: PropTypes.number.isRequired,
  // Whether the arrows that move it are shown: on "On your home" only.
  canMove: PropTypes.bool.isRequired,
  waiting: PropTypes.bool.isRequired,
  onDetails: PropTypes.func.isRequired,
  onPin: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default FeedRow;
