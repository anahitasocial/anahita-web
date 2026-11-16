import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Switch from '@mui/material/Switch';

import ActorType from '../../../proptypes/Actor';
import actions from '../../../actions';
import i18n from '../../../languages';
import offers from '../../../utils/offers';
import {
  OPTIONAL_KINDS,
  hasText,
  isOn,
  withKind,
} from './kindsOfPost';

// What a channel posts besides notes, photos and videos (roadmap row 147):
// articles and topics, off until its admins turn them on. Only what the
// site offers is shown. Saved as soon as it is switched, as the download
// card below it is; the page says whether it was saved.
const ActorsSettingsPostKinds = ({
  actor,
  metadata = {},
  editFeatures,
}) => {
  const [saving, setSaving] = useState('');

  const kinds = OPTIONAL_KINDS.filter((kind) => {
    return offers.post(metadata, kind);
  });
  if (kinds.length === 0 || !hasText(actor.features)) {
    return null;
  }

  const toggle = (kind, on) => {
    setSaving(kind);
    return editFeatures({ id: actor.id, features: withKind(actor.features, kind, on) })
      .catch(() => {})
      .finally(() => {
        setSaving('');
      });
  };

  return (
    <Card>
      <CardHeader
        title={i18n.t('channels:postKinds.title')}
        subheader={i18n.t('channels:postKinds.subheader')}
        slotProps={{
          title: { variant: 'subtitle1', sx: { fontWeight: 500 } },
          subheader: { variant: 'body2' },
        }}
      />
      <List disablePadding>
        {kinds.map((kind) => {
          const id = `channel-kind-${kind}`;
          return (
            <ListItem
              key={kind}
              // Room for the switch: its words wrap before it, not under it.
              sx={{ pr: 10 }}
              secondaryAction={
                <Switch
                  edge="end"
                  checked={isOn(actor.features, kind)}
                  disabled={Boolean(saving)}
                  onChange={(event) => {
                    return toggle(kind, event.target.checked);
                  }}
                  slotProps={{ input: { 'aria-labelledby': id } }}
                />
              }
            >
              <ListItemText
                id={id}
                primary={i18n.t(`channels:postKinds.${kind}`)}
                secondary={i18n.t(`channels:postKinds.${kind}Help`)}
              />
            </ListItem>
          );
        })}
      </List>
    </Card>
  );
};

ActorsSettingsPostKinds.propTypes = {
  actor: ActorType.isRequired,
  metadata: PropTypes.object,
  editFeatures: PropTypes.func.isRequired,
};

const mapStateToProps = (namespace) => {
  return (state) => {
    const { nodeInfo } = state.app;
    return {
      actor: state[namespace][namespace].current,
      metadata: (nodeInfo && nodeInfo.metadata) || {},
    };
  };
};

const mapDispatchToProps = (namespace) => {
  return (dispatch) => {
    return {
      editFeatures: (params) => {
        return dispatch(actions[namespace].settings.features.edit(params));
      },
    };
  };
};

export default (namespace) => {
  return connect(
    mapStateToProps(namespace),
    mapDispatchToProps(namespace),
  )(ActorsSettingsPostKinds);
};
