import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TagPeopleIcon from '@mui/icons-material/PersonAddOutlined';

import DetailRow from '../../../components/DetailRow';
import i18n from '../../../languages';
import utils from '../../../utils';

// The short box's second step (roadmap row 114): what goes with the post,
// each a row, who can see it, its language, who may reply, its location
// and who is in it, each with the room it needs. Laid out rather than
// hidden behind a link, so that they are used (the user, 2026-10-28). Who
// can see it and whether it goes to other servers is said under them.
//
// `composer` is what useShortComposer gives.
const ShortDetails = ({ composer }) => {
  const {
    choices, postLocations, busy, files, goesOut, staysHere,
  } = composer;
  const { hasPhotos, video, people } = files;

  return (
    <>
      <List disablePadding>
        {choices.rows({ busy, withDownload: hasPhotos || Boolean(video) })}
        {/* What is chosen in chips under each row, where each can be
            taken off: said once, not in the row as well. Locations not
            with a video, whose post is made only once the upload is
            ready. */}
        {!video && postLocations.button({
          disabled: busy,
          photoPoint: hasPhotos ? files.photoPoint : null,
          row: true,
        })}
        {!video &&
          <Box sx={{ pl: 7, pr: 2 }}>
            {postLocations.chips({ disabled: busy, goesOut })}
          </Box>}
        {hasPhotos &&
          <DetailRow
            icon={<TagPeopleIcon />}
            label={i18n.t('peopleTags:menu')}
            aria-haspopup="dialog"
            disabled={busy}
            onClick={() => { files.setIsTagging(true); }}
          />}
        {hasPhotos && people.length > 0 &&
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{
              alignItems: 'center', flexWrap: 'wrap', pl: 7, pr: 2,
            }}
          >
            {people.map((person) => {
              return (
                <Chip
                  key={`tagged-${person.id}`}
                  size="small"
                  label={utils.node.getActorName(person)}
                  onDelete={busy ? undefined : () => {
                    files.setPeople(people.filter((each) => { return each.id !== person.id; }));
                  }}
                />
              );
            })}
          </Stack>}
      </List>
      <Box sx={{ px: 2 }}>
        {staysHere &&
          <Typography variant="caption" color="textSecondary" component="p" sx={{ mt: 1 }}>
            {i18n.t('federation:composer.staysHere')}
          </Typography>}
      </Box>
    </>
  );
};

ShortDetails.propTypes = {
  composer: PropTypes.object.isRequired,
};

export default ShortDetails;
