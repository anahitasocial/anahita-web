import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

import SupportIcon from '@mui/icons-material/ContactSupport';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import WebsiteIcon from '@mui/icons-material/Language';
import TermsIcon from '@mui/icons-material/Description';
import PolicyIcon from '@mui/icons-material/Policy';

import HeaderMeta from '../../components/HeaderMeta';
import api from '../../api';
import i18n from '../../languages';

// Where to get help. PUBLIC, deliberately — the emails that link here go to
// somebody who cannot sign in, so gating it would make it reachable only by the
// people who do not need it.
//
// The contact details come from the SERVER, through NodeInfo: auth-service's
// SUPPORT_EMAIL, SUPPORT_PHONE and SUPPORT_WEBSITE.
//
// They used to be REACT_APP_ variables. Those are compiled into the bundle, so
// changing a support address meant rebuilding and redeploying the frontend; and
// SUPPORT_EMAIL is already the address the transactional emails send from, so a
// second copy here was a second place for it to be wrong. Now it is one setting
// and a restart.

const SITE_NAME = process.env.REACT_APP_NAME;

// The number a person dials is not the number to put in a tel: link. Spaces,
// dashes and brackets are for reading; a dialler wants digits and a leading +.
const telHref = (phone) => {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
};

const SupportPage = () => {
  // null until NodeInfo answers — a third state, distinct from "nothing is
  // configured", so the page does not flash the empty message first.
  const [contact, setContact] = useState(null);

  useEffect(() => {
    let cancelled = false;

    api.nodeInfo.read()
      .then(({ data }) => {
        if (!cancelled) {
          const metadata = (data && data.metadata) || {};
          setContact({
            email: metadata.supportEmail || '',
            phone: metadata.supportPhone || '',
            website: metadata.supportWebsite || '',
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setContact({ email: '', phone: '', website: '' });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const hasAny = contact && (contact.email || contact.phone || contact.website);

  return (
    <Container maxWidth="sm">
      <HeaderMeta title={`${i18n.t('pages:support')} - ${SITE_NAME}`} />
      <Card>
        <CardHeader
          avatar={
            <Avatar>
              <SupportIcon />
            </Avatar>
          }
          title={
            <Typography variant="h6">
              {i18n.t('support:cTitle')}
            </Typography>
          }
          subheader={i18n.t('support:cDesc', { site: SITE_NAME })}
        />
        <Divider />
        {contact &&
          <List>
            {contact.email &&
              <ListItem button component="a" href={`mailto:${contact.email}`}>
                <ListItemIcon><EmailIcon /></ListItemIcon>
                <ListItemText
                  primary={i18n.t('support:email.title')}
                  secondary={contact.email}
                />
              </ListItem>}
            {contact.phone &&
              <ListItem button component="a" href={telHref(contact.phone)}>
                <ListItemIcon><PhoneIcon /></ListItemIcon>
                <ListItemText
                  primary={i18n.t('support:phone.title')}
                  secondary={contact.phone}
                />
              </ListItem>}
            {contact.website &&
              <ListItem
                button
                component="a"
                href={contact.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ListItemIcon><WebsiteIcon /></ListItemIcon>
                <ListItemText
                  primary={i18n.t('support:website.title')}
                  secondary={contact.website}
                />
              </ListItem>}
            {/* Nothing configured is a real state and says so, rather than
                an empty card that reads as a broken page. */}
            {!hasAny &&
              <ListItem>
                <ListItemText secondary={i18n.t('support:unconfigured')} />
              </ListItem>}
          </List>}

        <Divider />

        {/* Somebody on a support page is often here about their account or
            their data, so the two documents that answer those belong on it. */}
        <List>
          <ListItem button component={RouterLink} to="/legal/tos">
            <ListItemIcon><TermsIcon /></ListItemIcon>
            <ListItemText primary={i18n.t('legal:tos')} />
          </ListItem>
          <ListItem button component={RouterLink} to="/legal/privacy">
            <ListItemIcon><PolicyIcon /></ListItemIcon>
            <ListItemText primary={i18n.t('legal:privacy')} />
          </ListItem>
        </List>
      </Card>
    </Container>
  );
};

export default SupportPage;
