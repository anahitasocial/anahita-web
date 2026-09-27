/* eslint-disable react/no-unused-prop-types */
/* eslint no-console: ["error", { allow: ["log", "error"] }] */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardActions from '@mui/material/CardActions';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

import AnahitaMap from '../../components/Map';
import Progress from '../../components/Progress';
import { App as APP } from '../../constants';
import icons from '../../components/AppIcons';
import api from '../../api';
import utils from '../../utils';
import i18n from '../../languages';

const { getURL } = utils.node;
const { SORTING } = APP.BROWSE;

// Shared empty default: a literal [] in the parameter list would be a
// new array on every render.
const NO_IDS = [];

const HomeCardMap = ({
  title = 'Map',
  subheader = '',
  showList = false,
  sort = SORTING.TOP,
  limit = 10,
  ids = NO_IDS,
}) => {
  const [items, setItems] = useState([]);

  // Depend on the ids by value, not by reference — see NodesCard for the
  // same fix. A fresh `ids = []` on every render makes this effect
  // re-run after its own setItems, looping requests forever.
  const idsKey = ids.join(',');

  useEffect(() => {
    api.locations.browse({
      start: 0,
      limit,
      sort,
      ids,
    })
      .then((results) => {
        const { data } = results;
        setItems([...data.data]);
      })
      .catch((err) => {
        return console.error(err);
      });
  }, [limit, sort, idsKey]);

  return (
    <Card component="section">
      <CardHeader
        title={
          <Typography variant="h6">
            {title}
          </Typography>
        }
        subheader={subheader}
      />
      {items.length === 0 && <Progress />}
      {items.length > 0 &&
        <AnahitaMap
          locations={items}
          height={295}
        />}
      {showList &&
        <List>
          {items.map((item) => {
            const key = `locations_${item.id}`;
            const href = getURL(item);
            return (
              <ListItemButton
                key={key}
                href={href}
                component="a"
              >
                <ListItemAvatar>
                  <Avatar>
                    {icons.Locations}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography noWrap>
                      {item.name}
                    </Typography>
                  }
                />
              </ListItemButton>
            );
          })}
        </List>}
      <CardActions>
        <Button
          fullWidth
          href="/explore/locations/"
          various="text"
        >
          {i18n.t('commons:viewAll')}
        </Button>
      </CardActions>
    </Card>
  );
};

HomeCardMap.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  limit: PropTypes.number,
  sort: PropTypes.oneOf([
    SORTING.TOP,
    SORTING.RECENT,
  ]),
  ids: PropTypes.arrayOf(PropTypes.number),
  showList: PropTypes.bool,
};

export default HomeCardMap;
