import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import ActorAvatar from '../../components/ActorAvatar';
import Progress from '../../components/Progress';
import ControlFollow from '../controls/Follow';
import api from '../../api';
import i18n from '../../languages';
import NodeType from '../../proptypes/Node';
import PersonType from '../../proptypes/Person';
import utils from '../../utils';
import activity from '../../utils/activity';

const { getActorName, getURL } = utils.node;

// What reads each list. Likers and reposters come as people; quotes and
// replies come as notes, each with who wrote it.
const READERS = {
  [activity.LIKES]: (post) => {
    return api.likes.browse({ node: post, limit: 100 }).then((result) => {
      return activity.peopleRows(result.data.data);
    });
  },
  [activity.REPOSTS]: (post) => {
    return api.repost.browse({ node: post }).then((result) => {
      return activity.peopleRows(result.data.data);
    });
  },
  [activity.QUOTES]: (post) => {
    return api.quotes.list(post).then((result) => {
      return activity.noteRows(result.data.data);
    });
  },
  [activity.REPLIES]: (post) => {
    return api.replies.thread(post).then((result) => {
      return activity.noteRows(result.data.data);
    });
  },
};

// A post's activity: how many times it was liked, reposted, quoted and
// replied to, and who did each.
//
// Four lists, one at a time, each read when its tab is first opened. The
// numbers on the tabs are the post's own counts. A list can be shorter than
// its number: everybody is shown only the people and the notes they may
// see.
//
// There is nothing here about who has looked at the post. That is not
// counted anywhere.
const PostActivity = ({
  post,
  open,
  onClose,
  startOn = activity.LIKES,
  viewer,
  isAuthenticated,
}) => {
  const [kind, setKind] = useState(activity.startOn(post, startOn));
  // By kind: undefined while not read, an array once it is.
  const [rows, setRows] = useState({});
  const [failed, setFailed] = useState({});

  // Each time it is opened it starts over: what was liked a minute ago may
  // not be now.
  useEffect(() => {
    if (open) {
      setKind(activity.startOn(post, startOn));
      setRows({});
      setFailed({});
    }
  }, [open, post.id]);

  useEffect(() => {
    if (!open || rows[kind] || failed[kind]) {
      return undefined;
    }

    let current = true;
    READERS[kind](post).then((read) => {
      if (current) {
        setRows((before) => {
          return { ...before, [kind]: read };
        });
      }
    }).catch(() => {
      if (current) {
        setFailed((before) => {
          return { ...before, [kind]: true };
        });
      }
    });

    return () => {
      current = false;
    };
  }, [open, kind, rows[kind], failed[kind]]);

  const counts = activity.counts(post);
  const list = rows[kind];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby={`post-activity-title-${post.id}`}
    >
      <DialogTitle id={`post-activity-title-${post.id}`}>
        {i18n.t('media:activity.title')}
      </DialogTitle>
      <Tabs
        value={kind}
        onChange={(event, value) => {
          setKind(value);
        }}
        variant="fullWidth"
        aria-label={i18n.t('media:activity.title')}
      >
        {activity.KINDS.map((each) => {
          return (
            <Tab
              key={each}
              value={each}
              label={i18n.t(`media:activity.${each}`, { count: counts[each] })}
            />
          );
        })}
      </Tabs>
      <DialogContent dividers sx={{ p: 0, minHeight: 240 }}>
        {!list && !failed[kind] && <Progress />}
        {failed[kind] &&
          <Typography variant="body2" color="error" role="alert" sx={{ p: 2 }}>
            {i18n.t('media:activity.failed')}
          </Typography>}
        {list && list.length === 0 &&
          <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
            {i18n.t('media:activity.none')}
          </Typography>}
        {list && list.length > 0 &&
          <List disablePadding>
            {list.map((row) => {
              const { actor, note } = row;
              return (
                <ListItem
                  key={row.key}
                  divider
                  secondaryAction={
                    isAuthenticated && viewer.id !== actor.id && !note ?
                      <ControlFollow actor={actor} /> :
                      null
                  }
                >
                  <ListItemAvatar>
                    <ActorAvatar actor={actor} linked />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Link href={getURL(actor)} color="inherit">
                        {getActorName(actor)}
                      </Link>
                    }
                    secondary={note ?
                      <Link
                        href={getURL(note)}
                        color="inherit"
                        dir="auto"
                        sx={{ overflowWrap: 'anywhere' }}
                      >
                        {row.excerpt || i18n.t('media:activity.open')}
                      </Link> :
                      null}
                  />
                </ListItem>
              );
            })}
          </List>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} fullWidth>
          {i18n.t('commons:close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

PostActivity.propTypes = {
  post: NodeType.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  // Which list to open on: likes, reposts, quotes or replies.
  startOn: PropTypes.string,
  viewer: PersonType.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => {
  const { viewer, isAuthenticated } = state.session;
  return { viewer, isAuthenticated };
};

export default connect(mapStateToProps)(PostActivity);
