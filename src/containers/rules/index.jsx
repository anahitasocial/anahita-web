import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import Progress from '../../components/Progress';
import RulesChecklist from '../../components/RulesChecklist';
import { textIn, useRules } from '../site/useSite';
import actions from '../../actions';
import api from '../../api';
import { listProps } from '../../utils/lists';
import i18n from '../../languages';

// One rule: its title, and a line more if it has one.
const Words = ({ item }) => {
  const title = textIn(item.title, i18n.language);
  const body = textIn(item.body, i18n.language);
  return (
    <span>
      <Typography component="span" variant="subtitle1" sx={{ display: 'block' }}>
        {title}
      </Typography>
      {body &&
        <Typography component="span" variant="body2" color="textSecondary">
          {body}
        </Typography>}
    </span>
  );
};

Words.propTypes = {
  item: PropTypes.object.isRequired,
};

// The site's rules, on a page of their own (roadmap row 102), after the Terms
// of Service and the Privacy Policy: the documents first, then what people
// hold themselves to.
//
// Somebody who has to agree ticks them one at a time (RulesChecklist).
//
// Anybody else, signed in or not, reads them as a list.
const Rules = ({
  refreshSession,
  alertError,
}) => {
  const navigate = useNavigate();
  const { site, known, outdated } = useRules();
  const [sending, setSending] = useState(false);

  const items = (site && site.rules && site.rules.items) || [];

  const agree = () => {
    setSending(true);
    api.agreements.editRules(site.rules.version)
      .then(() => { return refreshSession(); })
      .then(() => { navigate('/', { replace: true }); })
      .catch(() => { alertError(i18n.t('agreements:prompts.error')); })
      .then(() => { setSending(false); });
  };

  if (!known) {
    return <Progress />;
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Stack spacing={2}>
        <div>
          <Typography variant="h5" component="h1" gutterBottom>
            {i18n.t('agreements:rules.title')}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {outdated ? i18n.t('agreements:rules.intro') : i18n.t('agreements:rules.read')}
          </Typography>
        </div>

        {items.length === 0 &&
          <Alert severity="info">{i18n.t('agreements:rules.none')}</Alert>}

        {outdated ?
          <RulesChecklist
            items={items.map((item) => {
              return {
                title: textIn(item.title, i18n.language),
                body: textIn(item.body, i18n.language),
              };
            })}
            agreeLabel={i18n.t('agreements:actions.agreeRules')}
            onAgree={agree}
            sending={sending}
          /> :
          <Stack spacing={2} {...listProps(items)}>
            {items.map((item, index) => {
              return (
                // eslint-disable-next-line react/no-array-index-key
                <li key={`rule-${index}`}>
                  <Words item={item} />
                </li>
              );
            })}
          </Stack>}
      </Stack>
    </Container>
  );
};

Rules.propTypes = {
  refreshSession: PropTypes.func.isRequired,
  alertError: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => {
  return {
    refreshSession: () => { return dispatch(actions.session.read()); },
    alertError: (message) => { return dispatch(actions.app.alert.error(message)); },
  };
};

export default connect(null, mapDispatchToProps)(Rules);
