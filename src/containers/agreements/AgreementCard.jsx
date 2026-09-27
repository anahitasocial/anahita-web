import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@mui/styles/makeStyles';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import DocumentIcon from '@mui/icons-material/Description';

const useStyles = makeStyles((theme) => {
  return {
    // The text in a bounded, scrolling box rather than behind a link.
    //
    // A link is not a presentation. "It was on the screen they accepted from"
    // is a far better thing to be able to say than "they could have clicked
    // it", and it is also simply kinder to somebody who wants to read it.
    content: {
      maxHeight: 320,
      overflowY: 'auto',
      padding: theme.spacing(0, 2),
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: theme.shape.borderRadius,
      '& a': {
        color: theme.palette.primary.main,
      },
    },
  };
});

const AgreementCard = ({
  title,
  subheader = '',
  body,
  actionLabel,
  onAccept,
  disabled = false,
}) => {
  const classes = useStyles();

  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar>
            <DocumentIcon />
          </Avatar>
        }
        title={<Typography variant="h6">{title}</Typography>}
        subheader={subheader}
      />
      <CardContent>
        <div className={classes.content}>
          {body}
        </div>
      </CardContent>
      <CardActions>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={onAccept}
          disabled={disabled}
        >
          {actionLabel}
        </Button>
      </CardActions>
    </Card>
  );
};

AgreementCard.propTypes = {
  title: PropTypes.string.isRequired,
  subheader: PropTypes.string,
  body: PropTypes.node.isRequired,
  actionLabel: PropTypes.string.isRequired,
  onAccept: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default AgreementCard;
