import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Truncate from 'react-truncate';
import ActorHandle from './ActorHandle';
import ActorType from '../proptypes/Actor';
import utils from '../utils';

const { getActorName, getURL } = utils.node;

const ActorTitle = (props) => {
  const {
    actor,
    linked = false,
    typographyProps = {},
    withHandle = false,
  } = props;

  const url = getURL(actor);

  const name = (
    <>
      {linked &&
        <Typography
          {...typographyProps}
        >
          <Link href={url}>
            <Truncate width={300}>
              {getActorName(actor)}
            </Truncate>
          </Link>
        </Typography>}
      {!linked &&
        <Typography
          {...typographyProps}
        >
          <Truncate>
            {getActorName(actor)}
          </Truncate>
        </Typography>}
    </>
  );

  if (!withHandle) {
    return name;
  }

  // The handle after the name, in grey, or under it where the line is too
  // narrow for both (ActorHandle).
  return (
    <Box
      component="span"
      sx={{
        display: 'flex', alignItems: 'baseline', columnGap: 1, flexWrap: 'wrap', minWidth: 0,
      }}
    >
      {name}
      <ActorHandle actor={actor} />
    </Box>
  );
};

ActorTitle.propTypes = {
  actor: ActorType.isRequired,
  linked: PropTypes.bool,
  typographyProps: PropTypes.object,
  // The handle after the name: on a post, a reply.
  withHandle: PropTypes.bool,
};

export default ActorTitle;
