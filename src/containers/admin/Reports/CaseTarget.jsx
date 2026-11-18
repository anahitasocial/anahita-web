import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import RefuseIcon from '@mui/icons-material/BlockOutlined';
import SpamIcon from '@mui/icons-material/ReportGmailerrorredOutlined';

import i18n from '../../../languages';
import utils from '../../../utils';
import warnings from '../../../utils/warnings';
import MenuItemLabel from '../../../components/MenuItemLabel';
import target from './target';
import { CARD_TITLE } from './CaseRecord';

const { getURL } = utils.node;

// What was reported, at the head of a case: what it is and whose, its text,
// the way to it, and a menu of what else an administrator may do about it
// from here. "View" goes to the thing itself, where the controls that delete
// or disable it live, with their own confirmations.
const CaseTarget = ({ report }) => {
  const {
    item,
    submitting,
    spam,
    refuse,
    reported,
    canWarn,
    warning,
  } = report;

  // The menu of what else an administrator may do, at the case's head.
  const [menuAnchor, setMenuAnchor] = useState(null);

  const isOpen = item.status === 'open';
  const targetUrl = target.url(item);
  const body = target.body(item);

  // Closes the menu, then does what was chosen in it.
  const chosen = (then) => {
    return () => {
      setMenuAnchor(null);
      then();
    };
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Card>
        <CardHeader
          title={target.title(item)}
          subheader={
            <>
              {target.kind(item.targetType)}
              {item.targetOwner && item.targetOwner.id !== item.targetId &&
                <>
                  {' · '}
                  <Link component={RouterLink} to={getURL(item.targetOwner)}>
                    {i18n.t('abuseReports:list.by', { name: item.targetOwner.name })}
                  </Link>
                </>}
            </>
          }
          action={
            <>
              <Chip
                size="small"
                label={i18n.t(`abuseReports:statuses.${item.status}`)}
                color={isOpen ? 'primary' : 'default'}
              />
              {/* What else an administrator may do about it: the third
                  action and after go in a menu (AGENTS.md, rule 2). */}
              {targetUrl && (spam.canRemove || refuse.canRefuse || canWarn) &&
                <IconButton
                  size="small"
                  aria-label={i18n.t('actions:more')}
                  onClick={(event) => { setMenuAnchor(event.currentTarget); }}
                  sx={{ ml: 1 }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>}
            </>
          }
          // The text wraps beside the status, never under it.
          sx={{
            '& .MuiCardHeader-content': { minWidth: 0, overflowWrap: 'anywhere' },
            '& .MuiCardHeader-action': { alignSelf: 'flex-start', m: 0, ml: 2 },
          }}
          slotProps={CARD_TITLE}
        />
        {(body || item.targetGone) &&
          <CardContent>
            {body &&
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {body}
              </Typography>}
            {item.targetGone &&
              <Typography variant="body2" color="textSecondary">
                {i18n.t('abuseReports:case.targetGoneHint')}
              </Typography>}
          </CardContent>}
        {targetUrl &&
          <>
            <Divider />
            <CardContent>
              <Typography variant="body2" color="textSecondary">
                {i18n.t('abuseReports:case.openHint')}
              </Typography>
            </CardContent>
            <CardActions>
              <Button fullWidth component={RouterLink} to={targetUrl} color="primary">
                {i18n.t('abuseReports:case.open')}
              </Button>
            </CardActions>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => { setMenuAnchor(null); }}
            >
              {canWarn &&
                <MenuItem disabled={submitting} onClick={chosen(warning.open)}>
                  <MenuItemLabel icon={warnings.iconOf(warnings.of(reported).kind, { fontSize: 'small' })}>
                    {i18n.t('warnings:label')}
                  </MenuItemLabel>
                </MenuItem>}
              {spam.canRemove &&
                <MenuItem disabled={submitting} onClick={chosen(spam.open)}>
                  <MenuItemLabel icon={<SpamIcon fontSize="small" />}>
                    {i18n.t('abuseReports:spam.action')}
                  </MenuItemLabel>
                </MenuItem>}
              {refuse.canRefuse &&
                <MenuItem disabled={submitting} onClick={chosen(refuse.open)}>
                  <MenuItemLabel icon={<RefuseIcon fontSize="small" />}>
                    {i18n.t('abuseReports:refuse.caseAction')}
                  </MenuItemLabel>
                </MenuItem>}
            </Menu>
          </>}
      </Card>
    </Box>
  );
};

CaseTarget.propTypes = {
  // What useCase gives.
  report: PropTypes.object.isRequired,
};

export default CaseTarget;
