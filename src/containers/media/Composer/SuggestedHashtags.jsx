import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';

import api from '../../../api';
import i18n from '../../../languages';
import { hashtagsIn } from '../../../utils/contentfilter/hashtag';
import { Medium as MEDIUM } from '../../../constants';

// How much is written before hashtags are asked for, and how long after
// the last change.
const ENOUGH = 80;
const WAIT = 1200;
// The row's own height: one line of chips, so that nothing under it moves
// as they come and go.
const ROW_HEIGHT = 40;

// Hashtags in use that are words of long writing, under its editor (roadmap
// row 78): one tap adds one at the end. Asked for a moment after writing
// stops, of the title and the content; those it has already are not
// offered, and none once it has as many as count.
const SuggestedHashtags = ({
  title,
  body,
  disabled = false,
  onAdd,
}) => {
  const [items, setItems] = useState(null);
  const enough = body.trim().length >= ENOUGH;
  const full = hashtagsIn(body).length >= MEDIUM.MAX_HASHTAGS;

  useEffect(() => {
    if (!enough || full) {
      setItems(null);
      return undefined;
    }
    let current = true;
    const timer = setTimeout(() => {
      api.hashtags.suggestFor({ title, content: body }).then((result) => {
        if (current) {
          setItems((result.data && result.data.data) || []);
        }
      }).catch(() => {
        if (current) {
          setItems([]);
        }
      });
    }, WAIT);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [title, body, enough, full]);

  let note = '';
  if (full) {
    note = i18n.t('composer:hashtags.full', { count: MEDIUM.MAX_HASHTAGS });
  } else if (!enough || items === null) {
    note = i18n.t('composer:hashtags.writeMore');
  } else if (items.length === 0) {
    note = i18n.t('composer:hashtags.none');
  }

  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="caption" color="textSecondary" component="div">
        {i18n.t('composer:hashtags.suggested')}
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: 'center', height: ROW_HEIGHT, overflowX: 'auto', overflowY: 'hidden',
        }}
      >
        {note &&
          <Typography variant="body2" color="textSecondary" noWrap>
            {note}
          </Typography>}
        {!note && items.map((item) => {
          return (
            <Chip
              key={item.id}
              icon={<AddIcon />}
              label={`#${item.name}`}
              color={item.followed ? 'primary' : 'default'}
              variant="outlined"
              disabled={disabled}
              onClick={() => {
                setItems(items.filter((each) => { return each.id !== item.id; }));
                onAdd(item.name);
              }}
            />
          );
        })}
      </Stack>
    </Box>
  );
};

SuggestedHashtags.propTypes = {
  title: PropTypes.string.isRequired,
  // The content, as Markdown.
  body: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  // Called with the hashtag to add, as it is shown.
  onAdd: PropTypes.func.isRequired,
};

export default SuggestedHashtags;
