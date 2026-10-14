import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';

import SocialgraphDialog from './SocialgraphDialog';
import ActorType from '../../../proptypes/Actor';
import i18n from '../../../languages';
import socialgraph from '../../../utils/socialgraph';
import shortCount from '../../../utils/shortCount';
import utils from '../../../utils';

// One line of counts under a profile's name: "22 followers · 16 following".
// Each opens the dialog of who they are, on that list. Following is for
// people only, since only people follow; a group or an event has its
// followers alone, as somebody on another server has.
const SocialgraphMeta = ({ actor, openOn = '' }) => {
  const [startOn, setStartOn] = useState(openOn || '');

  // An address that named a list opens it: the old Social Graph tab's
  // links still lead somewhere.
  useEffect(() => {
    setStartOn(openOn || '');
  }, [openOn, actor.id]);

  const counts = [
    { list: socialgraph.FOLLOWERS, count: actor.followerCount || 0, label: 'socialgraph:counts.followers' },
  ];
  // Whom somebody on another server follows is not known here, so their
  // following is not counted. The API leaves a count of nought out.
  if (utils.node.isPerson(actor) && !utils.federation.isRemote(actor)) {
    counts.push({ list: socialgraph.LEADERS, count: actor.leaderCount || 0, label: 'socialgraph:counts.following' });
  }

  return (
    <>
      <Box sx={{
        mt: 1, display: 'flex', flexWrap: 'wrap', columnGap: 2, rowGap: 0.5,
      }}
      >
        {counts.map((each) => {
          return (
            // eslint-disable-next-line jsx-a11y/anchor-is-valid
            <Link
              key={each.list}
              component="button"
              type="button"
              variant="body2"
              color="textSecondary"
              underline="hover"
              onClick={() => {
                setStartOn(each.list);
              }}
            >
              <Box component="span" sx={{ color: 'text.primary', fontWeight: 600, mr: 0.5 }}>
                {shortCount(each.count, i18n.language)}
              </Box>
              {i18n.t(each.label, { count: each.count })}
            </Link>
          );
        })}
      </Box>
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
