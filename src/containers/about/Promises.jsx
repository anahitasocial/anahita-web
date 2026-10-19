import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PromiseIcon from '@mui/icons-material/VerifiedUserOutlined';
import RulesIcon from '@mui/icons-material/Rule';

import useSite, { textIn } from '../site/useSite';
import i18n from '../../languages';

// What this site promises the people who use it (roadmap row 102): the
// promises in the server's site.json, short and plain so that they are read
// (the user, 2026-10-19), with the way to the site's rules. Nothing while
// the site has not said, or has nothing to say.
const Promises = () => {
  const site = useSite();
  const promises = (site && site.promises) || [];
  const hasRules = Boolean(site && site.rules && site.rules.items && site.rules.items.length > 0);

  if (promises.length === 0 && !hasRules) {
    return null;
  }

  return (
    <Card sx={{ mb: 2 }}>
      {promises.length > 0 &&
        <>
          <CardHeader
            avatar={<Avatar><PromiseIcon /></Avatar>}
            title={<Typography variant="h6">{i18n.t('about:promises.title')}</Typography>}
          />
          <CardContent sx={{ pt: 0 }}>
            <Stack spacing={2}>
              {promises.map((promise, index) => {
                const body = textIn(promise.body, i18n.language);
                return (
                  // eslint-disable-next-line react/no-array-index-key
                  <div key={`promise-${index}`}>
                    <Typography variant="subtitle1">
                      {textIn(promise.title, i18n.language)}
                    </Typography>
                    {body &&
                      <Typography variant="body2" color="textSecondary">
                        {body}
                      </Typography>}
                  </div>
                );
              })}
            </Stack>
          </CardContent>
        </>}
      {hasRules &&
        <CardActions sx={{ px: 2, pb: 2 }}>
          <Button
            component={RouterLink}
            to="/rules"
            startIcon={<RulesIcon />}
          >
            {i18n.t('about:promises.rules')}
          </Button>
        </CardActions>}
    </Card>
  );
};

export default Promises;
