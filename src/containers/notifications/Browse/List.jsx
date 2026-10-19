import React from 'react';
import PropTypes from 'prop-types';

import InfiniteScroll from 'react-infinite-scroll-component';

import List from '@mui/material/List';

import Progress from '../../../components/Progress';
import NotificationItem from './ListItem';

import NotificationsType from '../../../proptypes/Notifications';

const NotificationsList = ({
  items,
  hasMore,
  fetchList,
  handleEdit,
  handleDelete,
}) => {
  return (
    <InfiniteScroll
      dataLength={items.allIds.length}
      next={fetchList}
      hasMore={hasMore}
      loader={<Progress key="items-progress" />}
    >
      <List disablePadding>
        {items.allIds.map((itemId) => {
          const item = items.byId[itemId];
          return (
            <NotificationItem
              key={`node_list_item_${item.id}`}
              item={item}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
            />
          );
        })}
      </List>
    </InfiniteScroll>
  );
};

NotificationsList.propTypes = {
  items: NotificationsType.isRequired,
  hasMore: PropTypes.bool.isRequired,
  fetchList: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
};

export default NotificationsList;
