import React from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
import { makeStyles } from 'tss-react/mui';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';

import { Medium as MEDIUM } from '../../../../constants';
import MediumType from '../../../../proptypes/Medium';
import i18n from '../../../../languages';

const useStyles = makeStyles()((theme) => {
  return {
    root: {
      width: '100%',
    },
    button: {
      padding: theme.spacing(3),
    },
  };
});

const {
  NAME,
  BODY,
} = MEDIUM.FIELDS;

const ComposersFile = React.forwardRef(({
  handleOnChange,
  handleOnFileSelect,
  handleOnSubmit,
  supportedMimetypes,
  fields,
  medium,
  file = null,
  isFetching,
  namespace,
  postOptions = null,
}, ref) => {
  const { classes } = useStyles();

  const {
    // acceptedFiles,
    getRootProps,
    getInputProps,
  } = useDropzone({
    // react-dropzone takes a map of MIME type to file extensions.
    accept: Object.fromEntries(supportedMimetypes.map((type) => {
      return [type, []];
    })),
    onDrop: (files) => {
      handleOnFileSelect(files[0]);
    },
  });

  const { ...rootProps } = getRootProps();

  return (
    <form onSubmit={handleOnSubmit} noValidate>
      <Card>
        <CardContent>
          <Button
            {...rootProps}
            ref={ref}
            disabled={isFetching}
            fullWidth
            size="large"
            className={classes.button}
            variant="outlined"
            color="primary"
          >
            <input
              accept={supportedMimetypes.join(',')}
              style
              id="addFileAttachment"
              type="file"
              name="file"
              {...getInputProps()}
              required
            />
            {!file && i18n.t(`${namespace}:composer.select`)}
            {file && file.name}
          </Button>
          {fields.name &&
            <TextField
              variant="outlined"
              name="name"
              value={medium.name}
              onChange={handleOnChange}
              label={i18n.t(`${namespace}:composer.name`)}
              placeholder={i18n.t(`${namespace}:composer.namePlaceholder`)}
              error={fields.name.error !== ''}
              helperText={fields.name.error}
              fullWidth
              margin="normal"
              disabled={isFetching}
              required
              slotProps={{
                htmlInput: {
                  maxLength: NAME.MAX_LENGTH,
                  minLength: NAME.MIN_LENGTH,
                },

                inputLabel: {
                  shrink: true,
                },
              }}
            />}
          {fields.body &&
            <TextField
              variant="outlined"
              name="body"
              value={medium.body}
              onChange={handleOnChange}
              label={i18n.t(`${namespace}:composer.body`)}
              placeholder={i18n.t(`${namespace}:composer.bodyPlaceholder`)}
              error={fields.body.error !== ''}
              helperText={fields.body.error}
              fullWidth
              margin="normal"
              disabled={isFetching}
              required
              slotProps={{
                htmlInput: {
                  maxLength: BODY.MAX_LENGTH,
                },

                inputLabel: {
                  shrink: true,
                },
              }}
            />}
        </CardContent>
        <CardActions>
          {postOptions}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isFetching}
            fullWidth
          >
            {!isFetching && i18n.t('actions:post')}
            {isFetching && <CircularProgress size={24} />}
          </Button>
        </CardActions>
      </Card>
    </form>
  );
});

ComposersFile.propTypes = {
  // The audience and language buttons, built by the composer.
  postOptions: PropTypes.node,
  handleOnChange: PropTypes.func.isRequired,
  handleOnFileSelect: PropTypes.func.isRequired,
  handleOnSubmit: PropTypes.func.isRequired,
  fields: PropTypes.objectOf(PropTypes.any).isRequired,
  medium: MediumType.isRequired,
  file: PropTypes.objectOf(PropTypes.any),
  isFetching: PropTypes.bool.isRequired,
  success: PropTypes.bool.isRequired,
  supportedMimetypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  namespace: PropTypes.string.isRequired,
};

export default ComposersFile;
