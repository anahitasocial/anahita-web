import React, { useState } from 'react';
import { makeStyles } from 'tss-react/mui';

import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import EditIcon from '@mui/icons-material/EditNoteOutlined';

import ShortComposer from './Short';
import LongComposer from './Long';
import i18n from '../../../languages';
import ActorType from '../../../proptypes/Actor';
import utils from '../../../utils';

const { node } = utils;

// What the short box posts, and what the extended composer writes.
const SHORT = ['note', 'photo', 'video'];
const LONG = ['article', 'topic'];

const useStyles = makeStyles()({
  root: {
    marginBottom: 8 * 2,
    position: 'sticky',
    top: 8 * 7,
    zIndex: 8,
    // Raised as a whole, like the cards under it, so the composer's own
    // card inside lies flat on it.
    '& .MuiCard-root': {
      boxShadow: 'none',
    },
  },
});

// The composer at the top of a profile and of the home page: one box for
// short posts, and from it the extended composer for writing at length
// (docs/plans/unified-composer.md). What either offers is what this profile
// takes and the viewer may post (`authorized.composers`).
const Composers = ({
  actor,
}) => {
  const { classes } = useStyles();
  const [isLongOpen, setIsLongOpen] = useState(false);
  const [carried, setCarried] = useState('');

  const composers = node.getComposers(actor);
  const short = SHORT.filter((kind) => { return composers.includes(kind); });
  const long = LONG.filter((kind) => { return composers.includes(kind); });

  if (short.length === 0 && long.length === 0) {
    return null;
  }

  const expand = (body = '') => {
    setCarried(body);
    setIsLongOpen(true);
  };

  return (
    <AppBar
      position="sticky"
      color="inherit"
      className={classes.root}
      elevation={1}
    >
      {short.length > 0 &&
        <ShortComposer
          actor={actor}
          kinds={short}
          onExpand={long.length > 0 ? expand : null}
        />}
      {/* A profile that takes only long writing has no short box: one
          button opens the extended composer. */}
      {short.length === 0 &&
        <Card>
          <CardActions sx={{ p: 2 }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              fullWidth
              onClick={() => {
                expand();
              }}
            >
              {i18n.t('composer:writeLong')}
            </Button>
          </CardActions>
        </Card>}
      {long.length > 0 &&
        <LongComposer
          actor={actor}
          kinds={long}
          open={isLongOpen}
          body={carried}
          onClose={() => {
            setIsLongOpen(false);
          }}
        />}
    </AppBar>
  );
};

Composers.propTypes = {
  actor: ActorType.isRequired,
};

export default Composers;
