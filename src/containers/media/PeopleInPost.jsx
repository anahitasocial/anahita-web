import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PersonIcon from '@mui/icons-material/PersonOutlined';

import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';
import utils from '../../utils';

const { getURL } = utils.node;

const TAGGABLE = /\.(photo|video)\.v1$/;

// The people in a list of words, joined as the reader's language joins
// them ("Worf, Dax and Data"), each part a link.
const joined = (people, render) => {
  const parts = new Intl.ListFormat(i18n.language, { type: 'conjunction' })
    .formatToParts(people.map((each, index) => { return String(index); }));
  return parts.map((part, index) => {
    if (part.type === 'element') {
      return (
        // eslint-disable-next-line react/no-array-index-key
        <React.Fragment key={`person-${index}`}>
          {render(people[Number(part.value)])}
        </React.Fragment>
      );
    }
    // eslint-disable-next-line react/no-array-index-key
    return <React.Fragment key={`sep-${index}`}>{part.value}</React.Fragment>;
  });
};

// Who is in a photo or a video (roadmap row 103), under it: "With Worf and
// Dax". A tag waiting for somebody is shown only to them and the post's
// author, marked as waiting; the person tagged accepts or declines it here,
// or takes themselves out later. Nothing when nobody is in it.
const PeopleInPost = ({
  medium,
  alertSuccess,
  alertError,
  onChange = null,
}) => {
  const viewer = useSelector((state) => { return state.session.viewer; });
  const [people, setPeople] = useState([]);
  const [revision, setRevision] = useState(0);
  const [sending, setSending] = useState(false);
  const taggable = TAGGABLE.test(medium.type || '');

  useEffect(() => {
    let current = true;
    if (!taggable || !medium.id) {
      return undefined;
    }
    api.peopleTags.browse(medium).then(({ data }) => {
      if (current) {
        setPeople(data.data || []);
      }
    }).catch(() => {
      // Nobody shown rather than an error under somebody's picture.
    });
    return () => {
      current = false;
    };
  }, [medium.id, taggable, revision]);

  if (people.length === 0) {
    return null;
  }

  const mine = people.find((each) => {
    return viewer && each.person && each.person.id === viewer.id;
  });

  const answer = (request, done) => {
    setSending(true);
    request
      .then(() => {
        alertSuccess(i18n.t(`peopleTags:alerts.${done}`));
        setRevision((before) => { return before + 1; });
        if (onChange) {
          onChange();
        }
      })
      .catch(() => { alertError(i18n.t('peopleTags:alerts.error')); })
      .then(() => { setSending(false); });
  };

  const name = (each) => {
    const shown = each.person.name || `@${each.person.alias}`;
    return (
      <>
        <Link component={RouterLink} to={getURL(each.person)} color="inherit" underline="hover">
          {shown}
        </Link>
        {each.pending &&
          <Typography component="span" variant="body2" color="textSecondary">
            {` (${i18n.t('peopleTags:waiting')})`}
          </Typography>}
      </>
    );
  };

  const [before, after] = i18n.t('peopleTags:with', { people: '\u0000' }).split('\u0000');

  return (
    <Box sx={{ px: 2, pt: 1 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <PersonIcon fontSize="small" color="action" />
        <Typography variant="body2" sx={{ flexGrow: 1, minWidth: 0, overflowWrap: 'anywhere' }}>
          {before}
          {joined(people, name)}
          {after}
        </Typography>
        {/* What the viewer can do about being in it, at the end of the
            line it is about. */}
        {mine && mine.pending &&
          <>
            <Button
              size="small"
              disabled={sending}
              onClick={() => { answer(api.peopleTags.remove(viewer, medium), 'declined'); }}
            >
              {i18n.t('peopleTags:decline')}
            </Button>
            <Button
              size="small"
              variant="contained"
              disabled={sending}
              onClick={() => { answer(api.peopleTags.approve(viewer, medium), 'accepted'); }}
            >
              {i18n.t('peopleTags:accept')}
            </Button>
          </>}
        {mine && !mine.pending &&
          <Button
            size="small"
            disabled={sending}
            onClick={() => { answer(api.peopleTags.remove(viewer, medium), 'declined'); }}
            sx={{ flexShrink: 0 }}
          >
            {i18n.t('peopleTags:removeMe')}
          </Button>}
      </Stack>
    </Box>
  );
};

PeopleInPost.propTypes = {
  // A post: only a photo or a video has people in it.
  medium: PropTypes.shape({
    id: PropTypes.number,
    type: PropTypes.string,
  }).isRequired,
  alertSuccess: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
  // Told when somebody is taken out or accepts.
  onChange: PropTypes.func,
};

const mapDispatchToProps = (dispatch) => {
  return {
    alertSuccess: (message) => { return dispatch(actions.app.alert.success(message)); },
    alertError: (message) => { return dispatch(actions.app.alert.error(message)); },
  };
};

export default connect(null, mapDispatchToProps)(PeopleInPost);
