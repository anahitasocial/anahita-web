import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';

import RepliesIcon from '@mui/icons-material/ModeCommentOutlined';
import EmptyList from '../../components/EmptyList';
import Progress from '../../components/Progress';
import SignInPrompt from '../../components/SignInPrompt';
import ConfirmDialog from './ConfirmDialog';
import Conversation from './Conversation';
import ReplyBox from './ReplyBox';
import ReplyItem from './ReplyItem';
import VideoReplyOnTheWay from './VideoReplyOnTheWay';
import useThread from './useThread';

import i18n from '../../languages';
import MediumType from '../../proptypes/Medium';
import events from '../../utils/events';
import postLanguage from '../../utils/postLanguage';
import replyAccess from '../../utils/replyAccess';
import replyOrder from '../../utils/replyOrder';
import utils from '../../utils';

const { getAuthor } = utils.node;

// Everything said under a post: the replies to it, the replies to those, and
// a place to add one. What it holds and does is useThread's; this draws it.
const RepliesThread = ({ root, under = null }) => {
  const replies = useThread({ root, under });
  const {
    viewer, chain, shown, hidden, answersOf, writerId,
  } = replies;
  const location = useLocation();
  const [showHidden, setShowHidden] = useState(false);

  // Where the replies would be, a way to them.
  if (replies.heldBack) {
    return (
      <Card>
        <CardContent>
          <SignInPrompt what="comments" />
        </CardContent>
      </Card>
    );
  }

  // On the page of a single reply, what is written here answers it.
  const top = under || root;
  const isRead = !replies.isLoading && !replies.hasFailed;

  // What every reply in the thread is given, wherever it is drawn: the
  // viewer, and what can be done with it.
  const itemProps = {
    viewer,
    onReply: replies.add,
    onEdit: replies.edit,
    onWarning: replies.warn,
    onDelete: replies.deleteItem,
    onHide: replies.hide,
    onLike: replies.like,
    onBlockFromOwner: replies.blockFromOwner,
    blockFromOwnerLabel: i18n.t(events.isEvent(root.owner || {}) ?
      'socialgraph:blockFromOwner.actionEvent' :
      'socialgraph:blockFromOwner.action'),
  };

  // Which note of the writer's chain a reply answers, said above it.
  const contextOf = (reply) => {
    const answers = answersOf(reply);
    return answers ? i18n.t('replies:answersNote', { number: answers }) : '';
  };

  // A reply in a conversation: on its own, without what is under it, which
  // the conversation draws flat.
  const drawReply = (reply, { joined, footer }) => {
    return (
      <ReplyItem
        key={`reply-${reply.id}`}
        {...itemProps}
        node={{ reply, children: [] }}
        joined={joined}
        footer={footer}
        writerId={writerId}
        context={contextOf(reply)}
      />
    );
  };

  return (
    // Twice the step at its foot, so that a conversation's line ends clear
    // of the card's edge.
    <Card sx={{ pb: 2 }}>
      {/* The rest of the post, by its writer: joined by a line, as one
          piece, before anybody's reply. */}
      {chain.length > 0 &&
        <Box>
          {chain.map((reply, index) => {
            return (
              <ReplyItem
                key={`reply-${reply.id}`}
                {...itemProps}
                node={{ reply, children: [] }}
                joined={index < chain.length - 1}
              />
            );
          })}
        </Box>}
      {replies.canReply &&
        <ReplyBox
          autoFocus={Boolean(location.state && location.state.reply)}
          hint={replies.staysHere ? i18n.t(replies.staysHere) : ''}
          direction={postLanguage.directionOf(postLanguage.defaultFor(viewer))}
          placeholder={(getAuthor(top) || {}).name ?
            i18n.t('replies:placeholderTo', { name: getAuthor(top).name }) :
            i18n.t('replies:placeholder')}
          attachments
          onSubmit={(body, card, attached) => {
            return replies.add(top, body, card, attached);
          }}
        />}
      {replies.onTheWay.map((each) => {
        return (
          <VideoReplyOnTheWay
            key={`on-the-way-${each.key}`}
            viewer={viewer}
            parent={each.parent}
            body={each.body}
            language={each.language}
            warning={each.warning}
            threadAfter={each.threadAfter}
            more={each.more}
            file={each.file}
            onReady={replies.load}
            onGone={() => {
              replies.gone(each.key);
            }}
          />
        );
      })}
      {/* Said to everybody, the people who can still reply included, so
          a thread with few voices in it explains itself. */}
      {isRead && replyAccess.isLimited(replies.limitedTo) &&
        <CardContent sx={{ pb: 0 }}>
          <Typography variant="body2" color="textSecondary">
            {replyAccess.summary(replies.limitedTo, i18n.t.bind(i18n))}
          </Typography>
        </CardContent>}
      {replies.isAuthenticated && isRead && !replies.canReply &&
        !replyAccess.isLimited(replies.limitedTo) &&
        <CardContent>
          <Typography variant="body2" color="textSecondary">
            {i18n.t('replies:prompts.notAllowed')}
          </Typography>
        </CardContent>}
      {replies.isLoading && <Progress />}
      {replies.hasFailed &&
        <CardContent>
          <Typography variant="body2" color="error" role="alert">
            {i18n.t('replies:loadFailed')}
          </Typography>
          <Button onClick={replies.load} sx={{ mt: 1 }}>
            {i18n.t('replies:retry')}
          </Button>
        </CardContent>}
      {/* Nothing at all under the post: not when only its writer has
          gone on under it. */}
      {isRead && shown.length === 0 && chain.length === 0 &&
        <EmptyList icon={<RepliesIcon />} inCard />}
      {shown.length >= replyOrder.MIN_TO_CHOOSE &&
        <Box sx={{
          display: 'flex', justifyContent: 'flex-end', px: 2, pb: 1,
        }}
        >
          <ToggleButtonGroup
            size="small"
            color="primary"
            exclusive
            value={replies.order}
            aria-label={i18n.t('replies:order.label')}
            onChange={(event, chosen) => {
              if (chosen) {
                replies.choose(chosen);
              }
            }}
          >
            <ToggleButton value={replyOrder.NEWEST} sx={{ px: 2 }}>
              {i18n.t('replies:order.newest')}
            </ToggleButton>
            <ToggleButton value={replyOrder.OLDEST} sx={{ px: 2 }}>
              {i18n.t('replies:order.oldest')}
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>}
      {shown.map((node) => {
        return (
          <Conversation
            key={`conversation-${node.reply.id}`}
            node={node}
            drawReply={drawReply}
          />
        );
      })}
      {replies.isTruncated &&
        <CardContent>
          <Typography variant="caption" color="textSecondary">
            {i18n.t('replies:truncated')}
          </Typography>
        </CardContent>}
      {/* What whoever runs the thread hid: counted, and a tap away, each
          with what is under it. */}
      {hidden.length > 0 &&
        <>
          <Divider sx={{ mt: 2 }} />
          <Box sx={{ px: 2, py: 2 }}>
            <Typography variant="subtitle2">
              {i18n.t('replies:hidden.title', { count: hidden.length })}
            </Typography>
            <Typography variant="caption" color="textSecondary" component="p">
              {i18n.t('replies:hidden.help')}
            </Typography>
            <Button
              size="small"
              aria-expanded={showHidden}
              onClick={() => {
                setShowHidden(!showHidden);
              }}
              sx={{ ml: -1 }}
            >
              {i18n.t(showHidden ? 'replies:hidden.close' : 'replies:hidden.open')}
            </Button>
          </Box>
          {showHidden && hidden.map((node) => {
            return (
              <ReplyItem
                key={`reply-${node.reply.id}`}
                {...itemProps}
                node={node}
                writerId={writerId}
                context={contextOf(node.reply)}
              />
            );
          })}
        </>}
      <ConfirmDialog
        asking={replies.asking}
        onCancel={replies.dismiss}
        onConfirm={replies.confirm}
      />
    </Card>
  );
};

RepliesThread.propTypes = {
  // The post the thread hangs from.
  root: PropTypes.shape({
    id: PropTypes.number.isRequired,
    replyAccess: PropTypes.string,
    // The profile it is on: a group, for blocking somebody from it.
    owner: PropTypes.object,
  }).isRequired,
  // A reply in the thread, to show only what is under it.
  under: MediumType,
};

export default RepliesThread;
