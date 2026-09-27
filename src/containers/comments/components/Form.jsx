import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import CardHeader from '@mui/material/CardHeader';
import CardActions from '@mui/material/CardActions';
import TextField from '@mui/material/TextField';

import ActorAvatar from '../../../components/ActorAvatar';
import CommentType from '../../../proptypes/Comment';
import i18n from '../../../languages';
import { Comments as COMMENT } from '../../../constants';

const { BODY } = COMMENT.FIELDS;

const CommentForm = ({
  handleOnChange,
  handleOnSubmit,
  handleCancel = null,
  comment,
  fields: {
    body,
  },
  isFetching,
}) => {
  const { author } = comment;
  const enableSubmit = comment.id > 0 || body.isValid;

  return (
    <form onSubmit={handleOnSubmit}>
      <CardHeader
        avatar={
          <ActorAvatar
            actor={author}
            linked={Boolean(author.id)}
            size="small"
          />
          }
        title={
          <TextField
            id="comment-text-box"
            margin="normal"
            variant="outlined"
            placeholder={i18n.t('comments:comment.placeholder')}
            onChange={handleOnChange}
            name="body"
            value={comment.body}
            error={body.error !== ''}
            helperText={body.error}
            disabled={isFetching}
            fullWidth
            multiline
            required
            slotProps={{
              htmlInput: {
                maxLength: BODY.MAX_LENGTH,
              },
            }}
          />
          }
      />
      <CardActions>
        {comment.id > 0 &&
        <Button
          onClick={handleCancel}
          size="small"
          fullWidth
        >
          {i18n.t('actions:cancel')}
        </Button>}
        <Button
          type="submit"
          color="primary"
          disabled={isFetching || !enableSubmit}
          variant="contained"
          size="small"
          fullWidth
        >
          {comment.id ? i18n.t('actions:update') : i18n.t('actions:post')}
        </Button>
      </CardActions>
    </form>
  );
};

CommentForm.propTypes = {
  handleOnChange: PropTypes.func.isRequired,
  handleOnSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func,
  comment: CommentType.isRequired,
  fields: PropTypes.objectOf(PropTypes.any).isRequired,
  isFetching: PropTypes.bool.isRequired,
};

export default CommentForm;
