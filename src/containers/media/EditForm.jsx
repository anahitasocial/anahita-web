import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import Button from '@mui/material/Button';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import LinkPreviewCard from '../../components/LinkPreviewCard';
import LongEditor from './Composer/LazyLongEditor';
import { useOnBluesky } from './Composer/useOnFediverse';
import utils from '../../utils';
import MediumType from '../../proptypes/Medium';
import { Medium as MEDIUM } from '../../constants';

import i18n from '../../languages';

const {
  NAME,
  BODY,
  EXCERPT,
} = MEDIUM.FIELDS;

const MediumFormEdit = (props) => {
  const {
    handleOnChange,
    handleOnSubmit,
    handleCancel,
    fields,
    medium,
    isFetching,
    linkPreview = null,
    onLinkPreviewRemove = null,
    onBodyPaste = null,
    bodyOptional = false,
    nameOptional = false,
    richText = false,
  } = props;

  // Long writing is changed in the editor it was written in. It is not a
  // control of the form, so what it says goes in as a change would.
  const changeBody = (value) => {
    handleOnChange({
      target: {
        name: 'body',
        value,
        type: 'text',
        required: false,
        willValidate: false,
      },
    });
  };
  const bodyMissing = richText && !bodyOptional && !(medium.body || '').trim();
  const bodyTooLong = (medium.body || '').trim().length > BODY.MAX_LENGTH;

  const viewer = useSelector((state) => { return state.session.viewer; });
  const onBluesky = useOnBluesky(viewer);
  const editStaysHere = onBluesky && Boolean(viewer) && medium.createdBy === viewer.id &&
    !utils.federation.isRemote(medium);

  return (
    <form onSubmit={handleOnSubmit} noValidate>
      <CardContent>
        {fields.name &&
          <TextField
            variant="standard"
            name="name"
            value={medium.name || ''}
            onChange={handleOnChange}
            label={i18n.t('media:medium.title')}
            error={fields.name.error !== ''}
            helperText={fields.name.error || ' '}
            autoFocus
            fullWidth
            margin="normal"
            disabled={isFetching}
            required={!nameOptional}
            slotProps={{
              htmlInput: {
                dir: 'auto',
                maxLength: NAME.MAX_LENGTH,
                minLength: NAME.MIN_LENGTH,
              },
            }}
          />}
        {fields.body && richText &&
          <LongEditor
            value={medium.body || ''}
            onChange={changeBody}
            label={i18n.t('media:medium.description')}
            required={!bodyOptional}
            error={bodyTooLong}
            helperText={bodyTooLong ? i18n.t('composer:tooLong', { count: BODY.MAX_LENGTH }) : ' '}
            disabled={isFetching}
            minHeight={280}
            // Under the page's bar, which is 56 pixels tall on a phone.
            stickyTop={{ xs: 56, sm: 64 }}
            uploadAccess={medium.access || 'public'}
          />}
        {fields.body && !richText &&
          <TextField
            variant="standard"
            name="body"
            value={medium.body || ''}
            onChange={handleOnChange}
            onPaste={onBodyPaste}
            label={i18n.t('media:medium.description')}
            error={fields.body.error !== ''}
            helperText={fields.body.error || ' '}
            multiline
            fullWidth
            margin="normal"
            disabled={isFetching}
            required={!bodyOptional}
            slotProps={{
              htmlInput: {
                dir: 'auto',
                maxLength: BODY.MAX_LENGTH,
              },
            }}
          />}
        {/* An article's, said where it is listed. */}
        {fields.excerpt &&
          <TextField
            variant="standard"
            name="excerpt"
            value={medium.excerpt || ''}
            onChange={handleOnChange}
            label={i18n.t('articles:composer.excerpt')}
            error={fields.excerpt.error !== ''}
            helperText={fields.excerpt.error || ' '}
            multiline
            fullWidth
            margin="normal"
            disabled={isFetching}
            slotProps={{
              htmlInput: {
                dir: 'auto',
                maxLength: EXCERPT.MAX_LENGTH,
              },
            }}
          />}
        <LinkPreviewCard
          preview={linkPreview}
          onRemove={isFetching ? null : onLinkPreviewRemove}
        />
        {/* Bluesky only adds and deletes posts. For somebody whose posts
            go there, said before they change one. */}
        {editStaysHere &&
          <Typography variant="caption" color="textSecondary" component="p" sx={{ mt: 1 }}>
            {i18n.t('federation:composer.editStaysHereBluesky')}
          </Typography>}
      </CardContent>
      <CardActions>
        <Button
          disabled={isFetching}
          fullWidth
          onClick={handleCancel}
        >
          {i18n.t('actions:cancel')}
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isFetching || bodyMissing || bodyTooLong}
          fullWidth
        >
          {i18n.t('actions:update')}
        </Button>
      </CardActions>
    </form>
  );
};

MediumFormEdit.propTypes = {
  // A photo or video post may have no title: the pictures or the video
  // are the post.
  nameOptional: PropTypes.bool,
  handleOnChange: PropTypes.func.isRequired,
  handleOnSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  fields: PropTypes.objectOf(PropTypes.any).isRequired,
  medium: MediumType.isRequired,
  isFetching: PropTypes.bool.isRequired,
  // A note's card for the first link in it, a way to save without it, and
  // word of a paste so a pasted link is looked up at once.
  linkPreview: PropTypes.object,
  onLinkPreviewRemove: PropTypes.func,
  onBodyPaste: PropTypes.func,
  // A video needs a title and may have nothing more said of it.
  bodyOptional: PropTypes.bool,
  // An article or a topic: its text in the editor it was written in.
  richText: PropTypes.bool,
};

export default MediumFormEdit;
