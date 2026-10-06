import React, { useState } from 'react';
import { connect } from 'react-redux';
import Button from '@mui/material/Button';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import RepostIcon from '@mui/icons-material/Repeat';
import QuoteIcon from '@mui/icons-material/FormatQuote';

import QuoteDialog from './QuoteDialog';
import api from '../../api';
import i18n from '../../languages';
import NodeType from '../../proptypes/Node';
import quotes from '../../utils/quotes';

// The repost button under a post, which opens a choice of two: repost it as
// it is, or quote it, which is writing a note of your own with the post
// carried under it.
//
// Quoting is offered only where the server said this viewer may quote this
// post. Where it said no, the choice is there and switched off, so that it
// does not look like something that went missing.
//
// The number on the button is reposts and quotes together: the times the
// post was passed on.
const ControlsFeedRepost = React.forwardRef(({ parent }, ref) => {
  const [reposted, setReposted] = useState(parent.isRepostedByViewer);
  const [count, setCount] = useState((parent.repostCount || 0) + (parent.quoteCount || 0));
  const [anchorEl, setAnchorEl] = useState(null);
  const [isQuoting, setIsQuoting] = useState(false);

  const close = () => {
    setAnchorEl(null);
  };

  const handleAdd = async () => {
    try {
      const response = await api.repost.add(parent);
      if (response.status === 201) {
        setReposted(true);
        setCount(count + 1);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemove = async () => {
    try {
      const response = await api.repost.deleteItem(parent);
      if (response.status === 200) {
        setReposted(false);
        setCount(count - 1);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const label = i18n.t('replies:quote.menu');

  return (
    <>
      <Button
        ref={ref}
        onClick={(event) => {
          setAnchorEl(event.currentTarget);
        }}
        startIcon={<RepostIcon />}
        color={reposted ? 'primary' : 'default'}
        aria-haspopup="menu"
        aria-expanded={anchorEl ? 'true' : undefined}
        aria-label={label}
        title={label}
        fullWidth
      >
        {count > 0 && count}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={close}
        // Opens upward. The button is in the row at the bottom of a card,
        // often at the bottom of the screen, and a menu that drops down
        // from there covers the next post or runs off the page.
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MenuItem
          onClick={() => {
            close();
            if (reposted) {
              handleRemove();
            } else {
              handleAdd();
            }
          }}
        >
          <ListItemIcon>
            <RepostIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            {i18n.t(reposted ? 'replies:quote.undoRepost' : 'actions:repost')}
          </ListItemText>
        </MenuItem>
        <MenuItem
          disabled={!quotes.canQuote(parent)}
          onClick={() => {
            close();
            setIsQuoting(true);
          }}
        >
          <ListItemIcon>
            <QuoteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            secondary={!quotes.canQuote(parent) ? i18n.t('replies:quote.notOffered') : null}
          >
            {i18n.t('replies:quote.action')}
          </ListItemText>
        </MenuItem>
      </Menu>
      <QuoteDialog
        post={parent}
        open={isQuoting}
        onClose={() => {
          setIsQuoting(false);
        }}
        onQuoted={() => {
          setCount(count + 1);
        }}
      />
    </>
  );
});

ControlsFeedRepost.propTypes = {
  parent: NodeType.isRequired,
};

export default connect()(ControlsFeedRepost);
