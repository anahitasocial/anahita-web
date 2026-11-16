import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Switch from '@mui/material/Switch';

import AccessIcon from '@mui/icons-material/Visibility';

import AccessRow from '../../../components/AccessRow';
import audience from '../../../utils/audience';
import PersonType from '../../../proptypes/Person';
import _ from '../../../utils/lodash';

import ActorType from '../../../proptypes/Actor';
import actions from '../../../actions';
import api from '../../../api';
import i18n from '../../../languages';
import utils from '../../../utils';
import { Access as ACCESS } from '../../../constants';

// The access levels where asking to follow is a meaningful thing to
// offer. Public and registered profiles are already visible to the
// person asking, so there is nothing for a request to unlock.
const OPEN_TO_EVERYONE = [
  ACCESS.ACTORS.PUBLIC,
  ACCESS.ACTORS.REGISTERED,
];

const ActorsSettingsAccess = (props) => {
  const {
    editAccess,
    alertError,
    alertSuccess,
    actor,
    viewer,
    minContentAccess = ACCESS.ACTORS.PUBLIC,
  } = props;

  const actorType = utils.node.isPerson(actor) ? 'PEOPLE' : 'ACTORS';

  // An installation can rule out anything new being public
  // (MIN_CONTENT_ACCESS on the server, published in NodeInfo). There Public
  // is shown greyed with why, unless this profile is public already: it may
  // stay so. The server refuses the change either way.
  const publicAllowed = minContentAccess === ACCESS.ACTORS.PUBLIC ||
    actor.access === ACCESS.ACTORS.PUBLIC;
  const place = audience.placeOf(actor, viewer);
  const accessOptions = _.values(ACCESS[actorType]).map((level) => {
    const notHere = level === ACCESS.ACTORS.PUBLIC && !publicAllowed;
    return {
      value: level,
      name: audience.nameOf(level, i18n.t),
      description: audience.describe(level, place, actor.name, i18n.t),
      disabled: notHere,
      reason: notHere ? i18n.t('access:dialog.notOnSite') : '',
    };
  });

  const [access, setAccess] = useState(actor.access || ACCESS.ACTORS.PUBLIC);

  // Defaulted rather than taken raw. The server omitted this field
  // whenever it was false — omitempty on a bool — so it arrived
  // undefined, made the Switch uncontrolled, and was posted as the
  // string "undefined", which cannot bind to a bool and took the whole
  // request down with a 400. The response no longer omits it; this
  // keeps the card working against a server that has not been updated.
  const [allowFollowRequest, setAllowFollowRequest] = useState(
    Boolean(actor.allowFollowRequest),
  );
  const [waiting, setWaiting] = useState(false);

  // Whether this person is on the fediverse, where only a profile that is
  // open to everybody may be. Asked for a person only; where there is no
  // fediverse service, or it does not say, they are taken not to be.
  const [isFederated, setIsFederated] = useState(false);
  const [isConfirmingLeave, setIsConfirmingLeave] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    if (utils.node.isPerson(actor) && !utils.federation.isRemote(actor)) {
      api.federation.settings(actor).then((result) => {
        if (isCurrent) {
          setIsFederated(Boolean(result.data && result.data.enabled));
        }
      }).catch(() => {
        // No service, or not theirs to ask: no warning to give.
      });
    }
    return () => {
      isCurrent = false;
    };
  }, [actor.id]);

  // Closing the profile takes them off the fediverse, and that is not
  // undone by opening it again: other servers are told to remove them and
  // may not take them back.
  const wouldLeave = isFederated && access !== ACCESS.ACTORS.PUBLIC;

  // No confirmation step.
  //
  // There was one, and it asked a question the page already answers:
  // the access dialog shows every level with a line saying who it
  // admits, and the choice is made beside that line. A dialog
  // repeating "are you sure" after somebody has read six options and
  // picked one teaches them to dismiss dialogs, which is worse than
  // not having asked.
  //
  // It is also reversible in one click, unlike the Danger zone
  // actions, which is where confirmation earns its place.
  // THE ONE EXCEPTION to there being no confirmation: somebody on the
  // fediverse closing their profile. That is not reversible in any number
  // of clicks, and nothing on this card would otherwise say so. It is said
  // beside the choice as soon as it is made, and asked once more before it
  // is saved.
  const handleOnSubmit = (event) => {
    if (event) {
      event.preventDefault();
    }
    if (wouldLeave && !isConfirmingLeave) {
      setIsConfirmingLeave(true);
      return null;
    }
    setIsConfirmingLeave(false);

    setWaiting(true);

    return editAccess({
      ...actor,
      access,
      allowFollowRequest,
    }).then(() => {
      if (wouldLeave) {
        setIsFederated(false);
      }
      alertSuccess(i18n.t('actor:access.alerts.success'));
    }).catch(() => {
      alertError(i18n.t('actor:access.alerts.error'));
    }).finally(() => {
      setWaiting(false);
    });
  };

  const followRequestDisabled = OPEN_TO_EVERYONE.includes(access);

  return (
    <form onSubmit={handleOnSubmit}>
      <Card>
        <CardHeader
          avatar={
            <Avatar>
              <AccessIcon />
            </Avatar>
          }
          title={i18n.t('actor:access.title')}
          subheader={i18n.t('actor:access.cDescription')}
          slotProps={{
            title: { variant: 'subtitle1', sx: { fontWeight: 500 } },
          }}
        />
        <Divider />

        {/* The level chosen, opening the access dialog: each level there
            with who it admits, in the composer's words (roadmap row
            155). */}
        <List disablePadding>
          <AccessRow
            label={i18n.t('actor:access.labels.whoCanSee')}
            value={access}
            options={accessOptions}
            onChange={setAccess}
            divider
          />
        </List>
        {wouldLeave &&
          <Alert severity="warning" sx={{ m: 2 }}>
            {i18n.t('federation:leaving.byClosing')}
          </Alert>}

        <ListItem>
          <FormControlLabel
            control={
              <Switch
                checked={allowFollowRequest}
                onChange={(event) => {
                  setAllowFollowRequest(event.target.checked);
                }}
                name="allowFollowRequest"
                color="primary"
                // Nothing to unlock when the profile is already
                // visible to whoever would be asking.
                disabled={followRequestDisabled}
              />
            }
            label={i18n.t('actor:access.labels.othersCanRequestToFollow')}
          />
        </ListItem>

        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            disabled={waiting}
          >
            {i18n.t('actions:update')}
          </Button>
        </CardActions>
      </Card>
      <Dialog
        open={isConfirmingLeave}
        onClose={() => { setIsConfirmingLeave(false); }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{i18n.t('federation:settings.leave.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {i18n.t('federation:leaving.byClosingConfirm')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button fullWidth onClick={() => { setIsConfirmingLeave(false); }}>
            {i18n.t('actions:cancel')}
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="error"
            onClick={() => { handleOnSubmit(); }}
          >
            {i18n.t('federation:leaving.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </form>
  );
};

ActorsSettingsAccess.propTypes = {
  actor: ActorType.isRequired,
  // Whose profile it is decides the words: "people who follow you".
  viewer: PersonType.isRequired,
  editAccess: PropTypes.func.isRequired,
  alertSuccess: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
  // 'public' or 'registered': the widest anything new may be made here.
  minContentAccess: PropTypes.string,
};

const mapStateToProps = (namespace) => {
  return (state) => {
    const {
      [namespace]: {
        current: actor,
      },
    } = state[namespace];

    const { nodeInfo } = state.app;
    const metadata = (nodeInfo && nodeInfo.metadata) || {};

    return {
      actor,
      viewer: state.session.viewer,
      minContentAccess: metadata.minContentAccess,
    };
  };
};

const mapDispatchToProps = (namespace) => {
  return (dispatch) => {
    return {
      editAccess: (params) => {
        return dispatch(actions[namespace].settings.access.edit(params));
      },
      alertSuccess: (message) => {
        return dispatch(actions.app.alert.success(message));
      },
      alertError: (message) => {
        return dispatch(actions.app.alert.error(message));
      },
    };
  };
};

export default (namespace) => {
  return connect(
    mapStateToProps(namespace),
    mapDispatchToProps(namespace),
  )(ActorsSettingsAccess);
};
