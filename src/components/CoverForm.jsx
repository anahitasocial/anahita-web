import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'tss-react/mui';
import ButtonBase from '@mui/material/ButtonBase';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import CardMedia from '@mui/material/CardMedia';
import Fade from '@mui/material/Fade';

import NodeType from '../proptypes/Node';
import i18n from '../languages';
import utils from '../utils';

const { getActorName } = utils.node;

const styles = (theme) => {
  return {
    coverPlaceholder: {
      height: theme.spacing(40),
    },
    cover: {
      width: '100%',
      height: theme.spacing(40),
    },
    coverIcon: {
      width: theme.spacing(10),
      height: theme.spacing(10),
      margin: '10% auto',
    },
    button: {
      position: 'relative',
      width: '100%',
      height: theme.spacing(40),
      backgroundColor: theme.palette.background.default,
    },
    input: {
      display: 'none',
    },
    progress: {
      position: 'absolute',
    },
  };
};

const CoverForm = ({
  classes,
  node,
  cover = '',
  anchorEl = null,
  isFetching = false,
  canEdit = false,
  handleOpen,
  handleClose,
  handleFieldChange,
  handleDelete,
}) => {
  return (
    <>
      <ButtonBase
        className={classes.button}
        disabled={!canEdit || isFetching}
        onClick={handleOpen}
      >
        {cover &&
          <Fade in>
            <CardMedia
              className={classes.cover}
              title={getActorName(node)}
              image={cover}
              src="picture"
            />
          </Fade>}
        {!cover && <div className={classes.coverPlaceholder} />}
        {isFetching && <CircularProgress className={classes.progress} />}
      </ButtonBase>
      <Menu
        id="cover-add-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem>
          <label htmlFor="selectCoverFile">
            <input
              accept="image/*"
              className={classes.input}
              id="selectCoverFile"
              type="file"
              disabled={!canEdit || isFetching}
              onChange={handleFieldChange}
            />
            {i18n.t('actions:update')}
          </label>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          {i18n.t('actions:delete')}
        </MenuItem>
      </Menu>
    </>
  );
};

CoverForm.propTypes = {
  classes: PropTypes.object.isRequired,
  node: NodeType.isRequired,
  cover: PropTypes.string,
  anchorEl: PropTypes.object,
  isFetching: PropTypes.bool,
  canEdit: PropTypes.bool,
  handleOpen: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleFieldChange: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
};

export default withStyles(CoverForm, styles);
