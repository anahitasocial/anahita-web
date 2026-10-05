import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CommentRead from '../Read';
import CommentForm from '../components/Form';
import Progress from '../../../components/Progress';
import SignInPrompt from '../../../components/SignInPrompt';

import actions from '../../../actions';
import NodeType from '../../../proptypes/Node';
import CommentsType from '../../../proptypes/Comments';
import CommentDefault from '../../../proptypes/CommentDefault';
import PersonType from '../../../proptypes/Person';
import { App as APP } from '../../../constants';
import utils from '../../../utils';
import visitor from '../../../utils/visitor';

const { form } = utils;
const { LIMIT } = APP.BROWSE;
const formFields = form.createFormFields([
  'body',
]);

const CommentsBrowse = ({
  browseList,
  resetList,
  addItem,
  items,
  canAdd = false,
  parent,
  viewer,
  isFetching,
  cardProps = {},
  total = 0,
  heldBack = false,
}) => {
  const namespace = utils.node.getNamespace(parent);

  const { id, objectType } = parent;

  const [start, setStart] = useState(0);
  const [fields, setFields] = useState(formFields);
  const [comment, setComment] = useState({
    ...CommentDefault,
    author: viewer,
    parent,
  });

  useEffect(() => {
    return () => {
      resetList();
    };
  }, []);

  useEffect(() => {
    // Not asked for when the answer is known to be no: comments are held
    // back from a visitor on a preview site, and asking would only be
    // refused.
    if (heldBack) {
      return;
    }

    browseList({
      node: { id, objectType },
      start,
      limit: LIMIT,
      sort: 'created_at',
      direction: 'asc',
    }).catch(() => {
      // The failure is in the store, where the list reads it. Without
      // this the rejection goes unhandled, and the browser shows it raw.
    });
  }, [id, objectType, start, heldBack]);

  const fetchList = () => {
    return setStart(start + LIMIT);
  };

  const handleOnChange = (event) => {
    const { target } = event;
    const { name, value } = target;

    comment[name] = value;

    const newFields = form.validateField(target, fields);

    setFields({ ...newFields });
    setComment({ ...comment });
  };

  const handleOnSubmit = (event) => {
    event.preventDefault();

    const { target } = event;
    const newFields = form.validateForm(target, fields);

    if (form.isValid(newFields)) {
      addItem(comment)
        .then(() => {
          setComment({
            ...CommentDefault,
            author: viewer,
            parent,
          });
        });
    }

    setFields({ ...newFields });
  };

  const hasMore = total > items.allIds.length;

  // Where the comments would be, a way to them.
  if (heldBack) {
    return (
      <Card>
        <CardContent>
          <SignInPrompt what="comments" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <InfiniteScroll
        dataLength={items.allIds.length}
        next={fetchList}
        hasMore={hasMore}
        loader={
          <Progress key={`${namespace}-progress`} />
        }
      >
        {items.allIds.map((itemId) => {
          const node = items.byId[itemId];
          const key = `comment_node_${node.id}`;
          return (
            <CommentRead
              key={key}
              parent={parent}
              comment={node}
            />
          );
        })}
      </InfiniteScroll>
      {canAdd &&
        <CommentForm
          fields={fields}
          comment={comment}
          handleOnChange={handleOnChange}
          handleOnSubmit={handleOnSubmit}
          isFetching={isFetching}
          cardProps={cardProps}
        />}
    </Card>
  );
};

const mapStateToProps = (state) => {
  const { viewer } = state.session;

  const {
    comments: items,
    error,
    isFetching,
    total,
  } = state.comments;

  return {
    viewer,
    items,
    error,
    isFetching,
    total,
    heldBack: visitor.isPreviewVisitor(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    browseList: (params) => {
      return dispatch(actions.comments.browse(params));
    },
    resetList: () => {
      return dispatch(actions.comments.reset());
    },
    addItem: (comment) => {
      return dispatch(actions.comments.add(comment));
    },
  };
};

CommentsBrowse.propTypes = {
  items: CommentsType.isRequired,
  parent: NodeType.isRequired,
  canAdd: PropTypes.bool,
  // The comments are not shown to this viewer: a visitor on a site that
  // shows visitors only the start of things.
  heldBack: PropTypes.bool,
  addItem: PropTypes.func.isRequired,
  browseList: PropTypes.func.isRequired,
  resetList: PropTypes.func.isRequired,
  viewer: PersonType.isRequired,
  isFetching: PropTypes.bool.isRequired,
  cardProps: PropTypes.objectOf(PropTypes.any),
  total: PropTypes.number,
};

export default (connect(
  mapStateToProps,
  mapDispatchToProps,
)(CommentsBrowse));
