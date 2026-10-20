import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Zoom from '@mui/material/Zoom';
import useMediaQuery from '@mui/material/useMediaQuery';

import { isNumbered } from '../utils/lists';

// How long after a tick the next rule comes forward.
const PAUSE = 600;

// Rules ticked one at a time (roadmap row 102; the user, 2026-10-19: "we
// really want them to abide by them out of personal responsibility"): only
// the first is there, and ticking one brings the next forward, a moment
// later, zooming in, the keyboard following. "I agree" once every one is
// ticked. Zoom keeps to the theme's reduced motion, and the pause is left
// out for whoever asked their system for less.
//
// The site's rules on /rules, and a group's or an event's before joining it.
// `items` is [{ title, body }], in the reader's language already.
const RulesChecklist = ({
  items,
  agreeLabel,
  onAgree,
  sending = false,
  cancel = null,
}) => {
  const still = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [ticked, setTicked] = useState({});
  const [shown, setShown] = useState(1);
  const boxes = useRef([]);
  const all = items.length > 0 && items.every((item, index) => { return ticked[index]; });

  // The last one shown ticked: the next comes forward.
  useEffect(() => {
    if (shown >= items.length || !ticked[shown - 1]) {
      return undefined;
    }
    const timer = setTimeout(() => {
      setShown(shown + 1);
    }, still ? 0 : PAUSE);
    return () => {
      clearTimeout(timer);
    };
  }, [ticked, shown, items.length]);

  const numbered = isNumbered(items);

  return (
    <Stack spacing={2}>
      {items.slice(0, shown).map((item, index) => {
        return (
          <Zoom
            // eslint-disable-next-line react/no-array-index-key
            key={`rule-${index}`}
            in
            appear={index > 0}
            onEntered={() => {
              if (boxes.current[index]) {
                boxes.current[index].focus();
              }
            }}
          >
            <Box sx={{
              p: 2, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper',
            }}
            >
              <FormControlLabel
                sx={{ alignItems: 'flex-start', m: 0 }}
                control={
                  <Checkbox
                    checked={Boolean(ticked[index])}
                    disabled={sending}
                    slotProps={{
                      input: { ref: (element) => { boxes.current[index] = element; } },
                    }}
                    onChange={(event) => {
                      setTicked({ ...ticked, [index]: event.target.checked });
                    }}
                    sx={{ mt: -1 }}
                  />
                }
                label={
                  <span>
                    <Typography component="span" variant="subtitle1" sx={{ display: 'block' }}>
                      {numbered && `${index + 1}. `}
                      {item.title}
                    </Typography>
                    {item.body &&
                      <Typography component="span" variant="body2" color="textSecondary">
                        {item.body}
                      </Typography>}
                  </span>
                }
              />
            </Box>
          </Zoom>
        );
      })}
      <Stack direction="row" spacing={1}>
        {cancel}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          disabled={sending || !all}
          onClick={onAgree}
        >
          {agreeLabel}
        </Button>
      </Stack>
    </Stack>
  );
};

RulesChecklist.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string,
    body: PropTypes.string,
  })).isRequired,
  agreeLabel: PropTypes.string.isRequired,
  onAgree: PropTypes.func.isRequired,
  sending: PropTypes.bool,
  // A Cancel button to sit beside it, on its left.
  cancel: PropTypes.node,
};

export default RulesChecklist;
