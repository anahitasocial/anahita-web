import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import FediverseIcon from '@mui/icons-material/Hub';
import RemoveIcon from '@mui/icons-material/Delete';

import actions from '../../actions';
import api from '../../api';
import i18n from '../../languages';
import federation from '../../utils/federation';

// The servers this installation refuses: nothing is taken from them,
// nothing is sent to them, and nobody on them can be looked up.
//
// Here, with the other settings that are the whole installation's, and
// not with the reports: refusing a server is a choice made for everybody
// on the site. The server holds it to super administrators as well.
//
// Refusing a server does not reach back. People from it who are already
// kept here stay, with their posts; that is said on the card, since the
// opposite is what most would expect.
const SettingsFediverse = ({
  alertSuccess,
  alertError,
}) => {
  const [blocks, setBlocks] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  // An installation may not run the service at all.
  const [absent, setAbsent] = useState(false);
  const [domain, setDomain] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setIsFetching(true);

    return api.federation.blocks()
      .then(({ data }) => {
        setBlocks(data.data || []);
      })
      .catch((err) => {
        if (federation.isAbsent(err)) {
          setAbsent(true);
          return;
        }
        alertError(i18n.t('settings:fediverse.errors.load'));
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, [alertError]);

  useEffect(() => {
    load();
  }, [load]);

  const add = (event) => {
    event.preventDefault();
    setSubmitting(true);

    return api.federation.addBlock({ domain: domain.trim(), reason: reason.trim() })
      .then(({ data }) => {
        alertSuccess(i18n.t('settings:fediverse.added', { domain: data.domain }));
        setDomain('');
        setReason('');
        return load();
      })
      .catch((err) => {
        alertError(i18n.t(`settings:fediverse.errors.${federation.reasonOf(err)}`, {
          defaultValue: i18n.t('settings:fediverse.errors.generic'),
        }));
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const remove = (block) => {
    return api.federation.removeBlock(block.domain)
      .then(() => {
        alertSuccess(i18n.t('settings:fediverse.removed', { domain: block.domain }));
        return load();
      })
      .catch(() => {
        alertError(i18n.t('settings:fediverse.errors.generic'));
      });
  };

  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar>
            <FediverseIcon />
          </Avatar>
        }
        title={
          <Typography variant="h6">
            {i18n.t('settings:fediverse.cTitle')}
          </Typography>
        }
        subheader={i18n.t('settings:fediverse.cDescription')}
      />
      <Divider />
      {isFetching && <LinearProgress />}

      {absent &&
        <CardContent>
          <Typography variant="body2" color="textSecondary">
            {i18n.t('settings:fediverse.absent')}
          </Typography>
        </CardContent>}

      {!absent &&
        <>
          {!isFetching && blocks.length === 0 &&
            <CardContent>
              <Typography variant="body2">
                {i18n.t('settings:fediverse.none')}
              </Typography>
            </CardContent>}

          {blocks.length > 0 &&
            <List>
              {blocks.map((block) => {
                return (
                  <ListItem
                    key={block.domain}
                    divider
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label={i18n.t('settings:fediverse.remove', { domain: block.domain })}
                        title={i18n.t('settings:fediverse.remove', { domain: block.domain })}
                        onClick={() => {
                          remove(block);
                        }}
                      >
                        <RemoveIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={block.domain}
                      secondary={block.reason || i18n.t('settings:fediverse.noReason')}
                    />
                  </ListItem>
                );
              })}
            </List>}

          <form onSubmit={add}>
            <CardContent>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                {i18n.t('settings:fediverse.staysHere')}
              </Typography>
              <TextField
                name="domain"
                label={i18n.t('settings:fediverse.domain.label')}
                helperText={i18n.t('settings:fediverse.domain.help')}
                value={domain}
                onChange={(event) => {
                  setDomain(event.target.value);
                }}
                autoComplete="off"
                margin="normal"
                required
                fullWidth
              />
              <TextField
                name="reason"
                label={i18n.t('settings:fediverse.reason.label')}
                helperText={i18n.t('settings:fediverse.reason.help')}
                value={reason}
                onChange={(event) => {
                  setReason(event.target.value);
                }}
                slotProps={{ htmlInput: { maxLength: 500 } }}
                autoComplete="off"
                margin="normal"
                fullWidth
              />
            </CardContent>
            <CardActions>
              <Button
                type="submit"
                color="secondary"
                variant="contained"
                disabled={!domain.trim() || submitting}
                fullWidth
              >
                {i18n.t('settings:fediverse.add')}
              </Button>
            </CardActions>
          </form>
        </>}
    </Card>
  );
};

SettingsFediverse.propTypes = {
  alertSuccess: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => {
  return {
    alertSuccess: (message) => {
      return dispatch(actions.app.alert.success(message));
    },
    alertError: (message) => {
      return dispatch(actions.app.alert.error(message));
    },
  };
};

export default connect(null, mapDispatchToProps)(SettingsFediverse);
