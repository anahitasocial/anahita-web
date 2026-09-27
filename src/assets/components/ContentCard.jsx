import React from 'react';
import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';

const HomeCardContent = ({
  title = '',
  subheader = '',
  content = null,
  actions = null,
}) => {
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
      {content &&
        <CardContent>
          {content}
        </CardContent>}
      {actions &&
        <CardActions>
          {actions}
        </CardActions>}
    </Card>
  );
};

HomeCardContent.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  content: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
  ]),
  actions: PropTypes.node,
};

export default HomeCardContent;
