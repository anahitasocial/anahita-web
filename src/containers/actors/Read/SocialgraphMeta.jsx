import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import SocialgraphDialog from './SocialgraphDialog';
import ActorType from '../../../proptypes/Actor';
import i18n from '../../../languages';
import socialgraph from '../../../utils/socialgraph';

// The number of followers under a profile's name. Pressing it opens who
// they are, who the profile follows, and who the viewer has in common with
// it.
//
// It used to show the number of leaders beside it too, each a link to a tab
// of the profile. One number is enough to say how followed a profile is, and
// the rest is one press away.
const SocialgraphMeta = ({ actor, openOn = '' }) => {
  const [startOn, setStartOn] = useState(openOn || '');

  // An address that named a list opens it: the old Social Graph tab's
  // links still lead somewhere.
  useEffect(() => {
    setStartOn(openOn || '');
  }, [openOn, actor.id]);

  return (
    <>
      <Typography
        variant="h4"
        align="center"
        sx={{ m: 2, fontSize: 16 }}
      >
        <b>{`${i18n.t('socialgraph:followers')}: `}</b>
        <Button
          onClick={() => {
            setStartOn(socialgraph.FOLLOWERS);
          }}
          aria-label={i18n.t('socialgraph:open', { count: actor.followerCount || 0 })}
          sx={{
            minWidth: 0,
            px: 1,
            py: 0,
            fontSize: 'inherit',
            verticalAlign: 'baseline',
          }}
        >
          {actor.followerCount || 0}
        </Button>
      </Typography>
      <SocialgraphDialog
        actor={actor}
        open={Boolean(startOn)}
        startOn={startOn || socialgraph.FOLLOWERS}
        onClose={() => {
          setStartOn('');
        }}
      />
    </>
  );
};

SocialgraphMeta.propTypes = {
  actor: ActorType.isRequired,
  // A list to open on arriving: followers, leaders or mutuals.
  openOn: PropTypes.string,
};

export default SocialgraphMeta;
