import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardActions from '@mui/material/CardActions';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';

import AddIcon from '@mui/icons-material/Add';

import api from '../../../api';
import permissions from '../../../permissions/node';
import NodeType from '../../../proptypes/Node';
import PersonType from '../../../proptypes/Person';

import AnahitaMap from '../../../components/Map';
import LocationsAdd from '../Add';
import Progress from '../../../components/Progress';
import ListItem from '../Browse/ListItem';
import ControlDelete from '../../controls/tags/location/Delete';

const MAP_HEIGHT = 320;

const LocationsGadget = ({
  node,
  viewer,
  cardProps = {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  // The add dialog asks the browser for the viewer's position as soon as it
  // mounts, so it isn't mounted until somebody first opens it. After that it
  // stays mounted, so it can animate closed and open again.
  const [wasOpened, setWasOpened] = useState(false);
  const [locations, setLocations] = useState([]);
  const [waiting, setWaiting] = useState(false);

  // This list is component state, not redux — so a tag added or removed
  // elsewhere in the tree cannot reach it on its own. Bumping this re-runs
  // the browse below, which is what the add and delete controls now do once
  // their request has come back.
  const [revision, setRevision] = useState(0);

  const handleChanged = () => {
    setRevision((current) => {
      return current + 1;
    });
  };

  useEffect(() => {
    setWaiting(true);
    api.locations.browse({
      source_id: node.id,
      start: 0,
      limit: 20,
    })
      .then((response) => {
        const { data } = response.data;
        setLocations(data || []);
        setWaiting(false);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [node.id, revision]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const canDelete = permissions.canEdit(viewer, node);
  const canAdd = permissions.canAdd(viewer, node);

  if (locations.length === 0 && waiting) {
    return (
      <Progress />
    );
  }

  return (
    <>
      {canAdd && wasOpened &&
        <LocationsAdd
          node={node}
          isOpen={isOpen}
          handleClose={handleClose}
          cardProps={cardProps}
          selectedLocations={locations}
          onChange={handleChanged}
        />}
      <Card {...cardProps}>
        <CardHeader
          title={
            <Typography
              variant="h3"
              style={{
                fontSize: 24,
              }}
            >
              Locations
            </Typography>
          }
        />
        {locations.length !== 0 &&
          <AnahitaMap
            locations={locations}
            height={MAP_HEIGHT}
          />}
        <List>
          {locations.map((location) => {
            return (
              <ListItem
                key={`location-graph-list-item-${location.id}`}
                location={location}
                actions={canDelete &&
                  <ControlDelete
                    tag={location}
                    node={node}
                    callback={handleChanged}
                  />}
              />
            );
          })}
        </List>
        {canAdd &&
          <CardActions>
            <Button
              onClick={() => {
                setWasOpened(true);
                return setIsOpen(true);
              }}
              variant="outlined"
              fullWidth
            >
              <AddIcon />
            </Button>
          </CardActions>}
      </Card>
    </>
  );
};

LocationsGadget.propTypes = {
  node: NodeType.isRequired,
  viewer: PersonType.isRequired,
  cardProps: PropTypes.objectOf(PropTypes.any),
};

export default LocationsGadget;
