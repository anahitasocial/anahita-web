import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import FeedIcon from '@mui/icons-material/RssFeed';

import ConnectFeedDialog, { refusalOf } from './ConnectFeedDialog';
import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';
import permissions from '../../permissions';
import timeAgo from '../../utils/timeAgo';

// A channel's website feed, in its settings (anahita-services roadmap row
// 147, phase 4): what it reads, with Disconnect; or, with none, Connect,
// for whoever CHANNELS_FROM allows. One feed a channel. Disconnecting keeps
// the posts it brought.
const FeedCard = ({ channel }) => {
  const dispatch = useDispatch();
  const viewer = useSelector((state) => { return state.session.viewer; });
  const nodeInfo = useSelector((state) => { return state.app.nodeInfo; });
  const settings = (nodeInfo && nodeInfo.metadata) || {};

  // undefined while it is read; null when it has none.
  const [feed, setFeed] = useState(undefined);
  const [connecting, setConnecting] = useState(false);
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let current = true;
    api.channelConnect.feed.read(channel).then(({ data }) => {
      if (current) {
        setFeed(data);
      }
    }).catch(() => {
      if (current) {
        setFeed(null);
      }
    });
    return () => {
      current = false;
    };
  }, [channel.id]);

  const mayConnect = permissions.actor.canConnect(viewer, settings);
  if (feed === undefined || (feed === null && !mayConnect)) {
    return null;
  }

  const disconnect = () => {
    setBusy(true);
    api.channelConnect.feed.disconnect(channel).then(() => {
      setFeed(null);
      setAsking(false);
      dispatch(actions.app.alert.success(i18n.t('channels:feed.disconnected')));
    }).catch((failure) => {
      dispatch(actions.app.alert.error(refusalOf(failure)));
    }).finally(() => {
      setBusy(false);
    });
  };

  let state = '';
  if (feed) {
    if (feed.state === 'paused') {
      state = i18n.t('channels:feed.paused');
    } else {
      state = feed.readAt ?
        i18n.t('channels:feed.read', { when: timeAgo(feed.readAt) }) :
        i18n.t('channels:feed.notYet');
    }
  }

  return (
    <Card>
      {/* As the card under it is drawn: an icon, its title, a line. */}
      <CardHeader
        avatar={<Avatar><FeedIcon /></Avatar>}
        title={i18n.t('channels:feed.title')}
        slotProps={{
          title: { variant: 'subtitle1', sx: { fontWeight: 500 } },
        }}
      />
      <Divider />
      <CardContent>
        {!feed &&
          <Typography variant="body2" color="textSecondary">
            {i18n.t('channels:feed.none')}
          </Typography>}
        {feed &&
          <>
            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
              <Link href={feed.feedUrl} target="_blank" rel="noopener noreferrer">
                {feed.feedUrl}
              </Link>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {state}
            </Typography>
          </>}
      </CardContent>
      <CardActions>
        {!feed &&
          <Button fullWidth variant="contained" onClick={() => { setConnecting(true); }}>
            {i18n.t('channels:feed.connect')}
          </Button>}
        {feed &&
          <Button fullWidth onClick={() => { setAsking(true); }}>
            {i18n.t('channels:feed.disconnect')}
          </Button>}
      </CardActions>

      <ConnectFeedDialog
        channel={channel}
        open={connecting}
        onClose={() => { setConnecting(false); }}
        onConnected={(connected) => {
          setFeed(connected);
          dispatch(actions.app.alert.success(i18n.t('channels:feed.connected')));
        }}
      />

      <Dialog open={asking} onClose={() => { return !busy && setAsking(false); }} maxWidth="xs" fullWidth>
        <DialogTitle>{i18n.t('channels:feed.disconnectTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{i18n.t('channels:feed.disconnectText')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button fullWidth onClick={() => { setAsking(false); }} disabled={busy}>
            {i18n.t('actions:cancel')}
          </Button>
          <Button fullWidth variant="contained" onClick={disconnect} disabled={busy}>
            {i18n.t('channels:feed.disconnect')}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

FeedCard.propTypes = {
  channel: PropTypes.shape({ id: PropTypes.number.isRequired }).isRequired,
};

export default FeedCard;
