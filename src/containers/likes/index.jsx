import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import LikeIcon from '@mui/icons-material/Favorite';

import LikesBrowse from './Browse';
import CommentType from '../../proptypes/Comment';
import NodeType from '../../proptypes/Node';
import utils from '../../utils';
import i18n from '../../languages';

const Likes = ({
  node,
  comment = null,
}) => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const likeableNode = comment || node;
  const { likesCount } = likeableNode;
  const namespace = utils.node.getNamespace(likeableNode);
  const LikesStat = LikesBrowse(namespace);

  return (
    <>
      <Dialog
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        open={open}
      >
        <DialogTitle>
          {`${likesCount} Likes`}
        </DialogTitle>
        <DialogContent dividers style={{ padding: 0 }}>
          {open && <LikesStat node={node} comment={comment} />}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            fullWidth
          >
            {i18n.t('commons:close')}
          </Button>
        </DialogActions>
      </Dialog>
      <Button
        variant="text"
        onClick={() => {
          setOpen(true);
        }}
        disabled={!likesCount}
        startIcon={<LikeIcon />}
        size="small"
      >
        {likesCount}
      </Button>
    </>
  );
};

Likes.propTypes = {
  node: NodeType.isRequired,
  comment: CommentType,
};

export default Likes;
