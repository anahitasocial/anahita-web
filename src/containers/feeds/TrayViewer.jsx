import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CardHeader from '@mui/material/CardHeader';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';

import ActorAvatar from '../../components/ActorAvatar';
import Progress from '../../components/Progress';
import QuoteEmbed from '../../components/QuoteEmbed';
import api from '../../api';
import i18n from '../../languages';
import utils from '../../utils';
import tray from '../../utils/tray';

const { getActorName, getPortraitURL, getURL } = utils.node;

// How much of a post's text a slide shows. The whole of it is one press
// away, on the post's own page.
const EXCERPT = 600;

const excerptOf = (text = '') => {
  const plain = String(text).trim();
  return plain.length > EXCERPT ? `${plain.slice(0, EXCERPT).trim()}…` : plain;
};

// The posts of the faces in the tray, one at a time.
//
// It opens on the face that was chosen and shows that actor's posts from
// the last day, oldest first. Next goes to the next post and, after the
// last, to the next face; the arrow keys do the same. An actor is marked as
// looked at once their posts have been opened, and that is remembered on
// the device only.
//
// The posts are a page of the actor's own profile feed, which the server
// gates for this viewer like any other read of it. Nothing here is a new
// kind of content, and nothing is recorded about who looked.
const TrayViewer = ({
  entries,
  startAt,
  onSeen,
  onClose,
}) => {
  const [at, setAt] = useState(startAt);
  const [posts, setPosts] = useState([]);
  const [postAt, setPostAt] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const entry = entries[at];
  const actor = entry ? entry.actor : null;

  useEffect(() => {
    if (!actor) {
      return undefined;
    }

    let current = true;
    setIsLoading(true);
    setPosts([]);
    setPostAt(0);

    api.feed_actor.browse({
      id: actor.id,
      filter: 'posts',
      start: 0,
      limit: 20,
    }).then((result) => {
      if (current) {
        setPosts(tray.postsInWindow(result.data.data || []));
        onSeen(entry);
      }
    }).catch(() => {
      if (current) {
        setPosts([]);
      }
    }).finally(() => {
      if (current) {
        setIsLoading(false);
      }
    });

    return () => {
      current = false;
    };
  }, [actor && actor.id]);

  const hasNextPost = postAt < posts.length - 1;
  const hasNextActor = at < entries.length - 1;
  const hasPrevious = postAt > 0 || at > 0;

  const next = () => {
    if (hasNextPost) {
      setPostAt(postAt + 1);
    } else if (hasNextActor) {
      setAt(at + 1);
    } else {
      onClose();
    }
  };

  const previous = () => {
    if (postAt > 0) {
      setPostAt(postAt - 1);
    } else if (at > 0) {
      setAt(at - 1);
    }
  };

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'ArrowRight') {
        next();
      }
      if (event.key === 'ArrowLeft') {
        previous();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  });

  if (!actor) {
    return null;
  }

  const post = posts[postAt];
  const image = post ? getPortraitURL(post, 'large') : '';
  const text = post ? excerptOf(post.body) : '';

  let nextLabel = i18n.t('feed:tray.done');
  if (hasNextPost) {
    nextLabel = i18n.t('feed:tray.next');
  } else if (hasNextActor) {
    nextLabel = i18n.t('feed:tray.nextActor', {
      name: getActorName(entries[at + 1].actor),
    });
  }

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-label={i18n.t('feed:tray.title')}
    >
      <CardHeader
        avatar={<ActorAvatar actor={actor} linked />}
        title={getActorName(actor)}
        subheader={post ?
          i18n.t('feed:tray.position', {
            index: postAt + 1,
            total: posts.length,
            when: moment.utc(post.createdAt).fromNow(),
          }) :
          null}
        action={
          <IconButton
            onClick={onClose}
            aria-label={i18n.t('commons:close')}
            size="large"
          >
            <CloseIcon />
          </IconButton>
        }
      />
      <DialogContent sx={{ pt: 0 }}>
        <Stack spacing={2}>
          {isLoading && <Progress />}
          {!isLoading && !post &&
            <Typography variant="body2" color="textSecondary">
              {i18n.t('feed:tray.nothing')}
            </Typography>}
          {post &&
            <Box>
              {post.name &&
                <Typography variant="h6" dir="auto" sx={{ mb: 1 }}>
                  {post.name}
                </Typography>}
              {text &&
                <Typography
                  variant="body1"
                  dir="auto"
                  sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
                >
                  {text}
                </Typography>}
              {image &&
                <Box
                  component="img"
                  src={image}
                  alt={post.name || ''}
                  sx={{
                    display: 'block',
                    width: '100%',
                    maxHeight: 480,
                    objectFit: 'contain',
                    mt: 2,
                    borderRadius: 1,
                  }}
                />}
              <QuoteEmbed quote={post.quote} />
            </Box>}
          {post &&
            <Button
              component="a"
              href={getURL(post)}
              fullWidth
            >
              {i18n.t('feed:tray.openPost')}
            </Button>}
          <Stack direction="row" spacing={1}>
            <Button
              fullWidth
              disabled={!hasPrevious}
              onClick={previous}
            >
              {i18n.t('feed:tray.previous')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={next}
            >
              {nextLabel}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

TrayViewer.propTypes = {
  // The faces in the tray, in the order shown: { actor, latestPostAt, count }.
  entries: PropTypes.arrayOf(PropTypes.shape({
    actor: PropTypes.object.isRequired,
    latestPostAt: PropTypes.string,
    count: PropTypes.number,
  })).isRequired,
  // Which face was chosen.
  startAt: PropTypes.number.isRequired,
  // Called with a face once its posts have been opened.
  onSeen: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default TrayViewer;
