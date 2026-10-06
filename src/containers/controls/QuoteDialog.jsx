import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import QuoteEmbed from '../../components/QuoteEmbed';
import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';
import NodeType from '../../proptypes/Node';
import PersonType from '../../proptypes/Person';
import audience from '../../utils/audience';
import postLanguage from '../../utils/postLanguage';
import quotes from '../../utils/quotes';

const MAX = 8000;

// Writing a quote: a note of your own, with somebody's post carried under
// it.
//
// The note is posted on the writer's own profile, to the audience they last
// posted to there, in the language they write in: the same starting points
// as the composer. It is an ordinary note afterwards, with its own likes and
// replies, and is edited and removed like one.
//
// Whether the post may be quoted was answered by the server when the post
// was sent, which is what opened this. It is asked again when the note is
// made, and a refusal then is said in the server's words.
const QuoteDialog = ({
  post,
  open,
  onClose,
  onQuoted = null,
  viewer,
  alertSuccess,
  alertError,
}) => {
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Each time it is opened it starts empty.
  useEffect(() => {
    if (open) {
      setBody('');
    }
  }, [open, post.id]);

  const text = body.trim();

  const handleSend = () => {
    setIsSending(true);

    api.quotes.add(viewer, {
      body: text,
      quoteId: post.id,
      access: audience.defaultFor(viewer, viewer),
      language: postLanguage.defaultFor(viewer),
    }).then((result) => {
      alertSuccess(i18n.t('replies:quote.posted'));
      if (onQuoted) {
        onQuoted(result.data);
      }
      onClose();
    }).catch((error) => {
      alertError(i18n.t(quotes.refusalKey(error)));
    })
      .finally(() => {
        setIsSending(false);
      });
  };

  return (
    <Dialog
      open={open}
      onClose={isSending ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby={`quote-title-${post.id}`}
    >
      <DialogTitle id={`quote-title-${post.id}`}>
        {i18n.t('replies:quote.title')}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <TextField
            autoFocus
            multiline
            minRows={3}
            fullWidth
            margin="dense"
            value={body}
            disabled={isSending}
            onChange={(event) => {
              setBody(event.target.value);
            }}
            placeholder={i18n.t('replies:quote.placeholder')}
            slotProps={{
              htmlInput: {
                maxLength: MAX,
                'aria-label': i18n.t('replies:quote.placeholder'),
                dir: 'auto',
              },
            }}
          />
          <QuoteEmbed quote={{ post }} />
          <Stack spacing={1}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              disabled={isSending || text.length === 0}
              onClick={handleSend}
            >
              {!isSending && i18n.t('replies:quote.send')}
              {isSending && <CircularProgress size={24} />}
            </Button>
            <Button
              fullWidth
              disabled={isSending}
              onClick={onClose}
            >
              {i18n.t('actions:cancel')}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

QuoteDialog.propTypes = {
  // The post being quoted.
  post: NodeType.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  // Called with the new note.
  onQuoted: PropTypes.func,
  viewer: PersonType.isRequired,
  alertSuccess: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return {
    viewer: state.session.viewer,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    alertSuccess: (message) => {
      return dispatch(actions.app.alert.success(message));
    },
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(QuoteDialog);
