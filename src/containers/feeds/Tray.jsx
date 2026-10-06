import React, { useEffect, useState } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import TrayViewer from './TrayViewer';
import api from '../../api';
import i18n from '../../languages';
import PersonType from '../../proptypes/Person';
import utils from '../../utils';
import tray from '../../utils/tray';

const { getAvatarURL, getActorInitials, getActorName } = utils.node;

// New from people you follow: a row of faces at the top of home, one for
// each person or group the viewer follows that has posted in the last day.
//
// A face with something the viewer has not looked at has a ring; the rest
// are dimmed and come after. Choosing one opens its posts to step through.
//
// Whether somebody has looked is kept in this browser and nowhere else (see
// utils/tray). The server is asked who posted, and is told nothing back.
//
// Nothing is drawn when nobody has posted, or while it is not known.
const FeedsTray = ({ viewer }) => {
  const [entries, setEntries] = useState([]);
  const [seen, setSeen] = useState({});
  const [openAt, setOpenAt] = useState(-1);

  useEffect(() => {
    let current = true;

    setSeen(tray.readSeen(viewer));
    api.feed_leaders.active(tray.HOURS).then((result) => {
      if (current) {
        setEntries(result.data.data || []);
      }
    }).catch(() => {
      // The row is an extra. Without it the page is as it was.
    });

    return () => {
      current = false;
    };
  }, [viewer.id]);

  if (entries.length === 0) {
    return null;
  }

  // Ordered once per look at the list, not as faces are opened: a face
  // that has just been seen stays where it is until the page is next read.
  const ordered = tray.order(entries, tray.readSeen(viewer));

  const handleSeen = (entry) => {
    setSeen(tray.markSeen(viewer, entry.actor.id, entry.latestPostAt));
  };

  return (
    <Card sx={{ mb: 2 }}>
      <Typography
        variant="subtitle2"
        component="h2"
        sx={{ px: 2, pt: 2 }}
      >
        {i18n.t('feed:tray.title')}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          p: 2,
          overflowX: 'auto',
          scrollSnapType: 'x proximity',
        }}
      >
        {ordered.map((entry, index) => {
          const { actor } = entry;
          const name = getActorName(actor);
          const fresh = tray.isNew(entry, seen);

          return (
            <ButtonBase
              key={`tray-${actor.id}`}
              onClick={() => {
                setOpenAt(index);
              }}
              aria-label={i18n.t(fresh ? 'feed:tray.openNew' : 'feed:tray.open', {
                name,
                count: entry.count,
              })}
              sx={{
                flexShrink: 0,
                width: 72,
                flexDirection: 'column',
                gap: 1,
                borderRadius: 1,
                scrollSnapAlign: 'start',
                opacity: fresh ? 1 : 0.6,
              }}
            >
              <Avatar
                alt=""
                src={getAvatarURL(actor) || undefined}
                sx={{
                  width: 56,
                  height: 56,
                  border: 2,
                  borderColor: 'background.paper',
                  outline: '2px solid',
                  outlineColor: fresh ? 'primary.main' : 'divider',
                }}
              >
                {getActorInitials(actor)}
              </Avatar>
              <Typography
                variant="caption"
                noWrap
                sx={{ width: '100%', textAlign: 'center' }}
              >
                {name}
              </Typography>
            </ButtonBase>
          );
        })}
      </Box>
      {openAt >= 0 &&
        <TrayViewer
          entries={ordered}
          startAt={openAt}
          onSeen={handleSeen}
          onClose={() => {
            setOpenAt(-1);
          }}
        />}
    </Card>
  );
};

FeedsTray.propTypes = {
  viewer: PersonType.isRequired,
};

export default FeedsTray;
