import React from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';

import i18n from '../../languages';
import thread from '../../utils/thread';
import utils from '../../utils';

const { getAuthor, getURL } = utils.node;

// A way to more of a conversation, on a reply's own page.
const ConversationLink = ({ to, children }) => {
  return (
    <Link
      component={RouterLink}
      to={to}
      variant="body2"
      underline="hover"
      sx={{ display: 'block', pt: 1 }}
    >
      {children}
    </Link>
  );
};

ConversationLink.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

// A reply of the first level, then its conversation (roadmap row 129):
// flat, one step in, joined by a line, whoever answers whom; the earliest
// branch followed and the rest counted, a tap from where they hang; three
// in sight, then the whole of it on the reply's own page. Each reply still
// answers what it answered: only the drawing is flat.
//
// Each reply is drawn by `drawReply(reply, { joined, footer })`, which the
// thread gives, so that every reply in it is drawn the same way.
const Conversation = ({ node, drawReply }) => {
  const conversation = thread.conversationOf(node);
  const { steps } = conversation;
  // Each reply drawn as it is, at the same width, joined to the next by the
  // line in the pictures' column. Under a reply with more than one answer,
  // the rest a tap away, named; under the last in sight, the whole
  // conversation.
  const drawn = [{ reply: node.reply }, ...steps];

  return (
    <Box>
      {/* A thin rule between one conversation and the next: the line joins
          only within one (after Threads, the user, 2026-11-07). */}
      <Divider sx={{ mt: 1 }} />
      {drawn.map((each, index) => {
        const next = steps[index];
        const isLast = index === drawn.length - 1;
        const footer = (
          <>
            {next && next.more > 0 &&
              <ConversationLink to={getURL(each.reply)}>
                {i18n.t('replies:conversation.more', {
                  count: next.more,
                  name: (getAuthor(each.reply) || {}).name || '',
                })}
              </ConversationLink>}
            {isLast && conversation.hasMore &&
              <ConversationLink to={getURL(node.reply)}>
                {i18n.t('replies:conversation.show', { count: conversation.total })}
              </ConversationLink>}
          </>
        );
        return drawReply(each.reply, { joined: !isLast, footer });
      })}
    </Box>
  );
};

Conversation.propTypes = {
  // A reply of the first level, and the replies under it, as utils/thread
  // arranges them.
  node: PropTypes.shape({
    reply: PropTypes.object.isRequired,
    children: PropTypes.array.isRequired,
  }).isRequired,
  drawReply: PropTypes.func.isRequired,
};

export default Conversation;
