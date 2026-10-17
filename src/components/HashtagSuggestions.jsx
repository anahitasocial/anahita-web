import React from 'react';
import PropTypes from 'prop-types';

import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Portal from '@mui/material/Portal';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FollowedIcon from '@mui/icons-material/BookmarkAddedOutlined';

import i18n from '../languages';
import shortCount from '../utils/shortCount';

// Room kept between the line being written and what is offered.
const GAP = 4;
// What is offered takes about this much height on a phone, and as much as
// eight rows on a desktop: below the line when it fits above the bottom
// of what can be seen (a phone's keyboard takes from it), above otherwise.
const PHONE_HEIGHT = 48;
const ROW_HEIGHT = 56;
const DESKTOP_WIDTH = 320;

const bottomOfView = () => {
  const view = window.visualViewport;
  return view ? view.offsetTop + view.height : window.innerHeight;
};

// Hashtags in use, offered under the line somebody is writing as they type
// one (roadmap row 78). Over the page, by where the caret is, so that
// nothing under it moves: on a phone a row of chips the width of the
// screen, one tap to take one; on a desktop a short list, the arrow keys
// moving through it and Enter or Tab taking one. Pressing on it does not
// take the focus from the text, so a phone's keyboard stays up.
//
// `notice`, in place of hashtags, says why there are none: the post has as
// many as count.
const HashtagSuggestions = ({
  rect = null,
  items = [],
  active = 0,
  notice = '',
  phone = false,
  onPick,
}) => {
  if (!rect || (items.length === 0 && !notice)) {
    return null;
  }

  const rows = notice ? 1 : items.length;
  const height = phone ? PHONE_HEIGHT : (rows * ROW_HEIGHT) + 16;
  const below = rect.bottom + GAP + height <= bottomOfView();
  const place = below ?
    { top: rect.bottom + GAP } :
    { top: rect.top - GAP, transform: 'translateY(-100%)' };
  const left = Math.max(8, Math.min(rect.left, window.innerWidth - DESKTOP_WIDTH - 8));
  const across = phone ? { left: 8, right: 8 } : { left, width: DESKTOP_WIDTH };

  const keep = (event) => {
    event.preventDefault();
  };

  return (
    <Portal>
      <Paper
        elevation={8}
        onMouseDown={keep}
        onPointerDown={keep}
        role={notice ? 'status' : 'listbox'}
        aria-label={i18n.t('composer:hashtags.label')}
        sx={{
          position: 'fixed',
          zIndex: (theme) => { return theme.zIndex.modal + 2; },
          maxWidth: 'calc(100vw - 16px)',
          ...place,
          ...across,
        }}
      >
        {notice &&
          <Typography variant="body2" color="textSecondary" sx={{ px: 2, py: 1.5 }}>
            {notice}
          </Typography>}
        {!notice && phone &&
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: 'center', px: 1, height: PHONE_HEIGHT, overflowX: 'auto',
            }}
          >
            {items.map((item) => {
              return (
                <Chip
                  key={item.id}
                  label={`#${item.name}`}
                  color={item.followed ? 'primary' : 'default'}
                  variant={item.followed ? 'filled' : 'outlined'}
                  onClick={() => {
                    onPick(item);
                  }}
                />
              );
            })}
          </Stack>}
        {!notice && !phone &&
          <List dense sx={{ py: 1 }}>
            {items.map((item, index) => {
              return (
                <ListItemButton
                  key={item.id}
                  role="option"
                  selected={index === active}
                  aria-selected={index === active}
                  onClick={() => {
                    onPick(item);
                  }}
                  sx={{ minHeight: ROW_HEIGHT - 8 }}
                >
                  <ListItemText
                    primary={`#${item.name}`}
                    secondary={i18n.t('composer:hashtags.uses', {
                      count: item.uses,
                      short: shortCount(item.uses, i18n.language),
                    })}
                    slotProps={{ primary: { noWrap: true } }}
                  />
                  {item.followed &&
                    <FollowedIcon
                      fontSize="small"
                      color="primary"
                      titleAccess={i18n.t('composer:hashtags.followed')}
                    />}
                </ListItemButton>
              );
            })}
          </List>}
      </Paper>
    </Portal>
  );
};

HashtagSuggestions.propTypes = {
  // Where the caret is on the screen: { top, bottom, left }. Nothing is
  // shown without it.
  rect: PropTypes.shape({
    top: PropTypes.number,
    bottom: PropTypes.number,
    left: PropTypes.number,
  }),
  // The hashtags offered, the best first, as hashtag-service sends them.
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    alias: PropTypes.string,
    name: PropTypes.string,
    uses: PropTypes.number,
    followed: PropTypes.bool,
  })),
  // Which the arrow keys are on, on a desktop.
  active: PropTypes.number,
  notice: PropTypes.string,
  phone: PropTypes.bool,
  onPick: PropTypes.func.isRequired,
};

export default HashtagSuggestions;
