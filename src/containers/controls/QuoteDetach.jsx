import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

import QuoteEmbed from '../../components/QuoteEmbed';
import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';
import MediumType from '../../proptypes/Medium';
import PersonType from '../../proptypes/Person';
import utils from '../../utils';
import quotes from '../../utils/quotes';

// The post a note quotes, on the note's own page, where the author of the
// quoted post can take it out.
//
// Taking it out cannot be undone, by them or by the note's author, so it is
// asked about first. The note stays, saying the post was removed.
const QuoteDetach = ({
  note,
  viewer,
  read,
  alertSuccess,
  alertError,
}) => {
  const [isAsking, setIsAsking] = useState(false);
  const [isDetaching, setIsDetaching] = useState(false);

  const mayDetach = quotes.isQuotedAuthor(note.quote, viewer);

  const handleDetach = () => {
    setIsAsking(false);
    setIsDetaching(true);

    api.quotes.detach(note).then(() => {
      return read(note);
    }).then(() => {
      alertSuccess(i18n.t('replies:quote.detached_done'));
    }).catch(() => {
      alertError(i18n.t('replies:quote.notDetached'));
    })
      .finally(() => {
        setIsDetaching(false);
      });
  };

  return (
    <>
      <QuoteEmbed
        quote={note.quote}
        detaching={isDetaching}
        onDetach={mayDetach ? () => {
          setIsAsking(true);
        } : null}
      />
      <Dialog
        open={isAsking}
        onClose={() => {
          setIsAsking(false);
        }}
        aria-describedby="quote-detach-message"
        fullWidth
        maxWidth="xs"
      >
        <DialogContent>
          <DialogContentText id="quote-detach-message">
            {i18n.t('replies:quote.confirmDetach')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsAsking(false);
            }}
          >
            {i18n.t('actions:cancel')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleDetach}
          >
            {i18n.t('replies:quote.detach')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

QuoteDetach.propTypes = {
  // The note that quotes.
  note: MediumType.isRequired,
  viewer: PersonType.isRequired,
  read: PropTypes.func.isRequired,
  alertSuccess: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => {
  return {
    read: (note) => {
      const namespace = utils.node.getNamespace(note);
      return dispatch(actions[namespace].read(note.id, namespace));
    },
    alertSuccess: (message) => {
      return dispatch(actions.app.alert.success(message));
    },
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
};

export default connect(null, mapDispatchToProps)(QuoteDetach);
