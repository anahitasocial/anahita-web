import React from 'react';
import { makeStyles } from 'tss-react/mui';
import PropTypes from 'prop-types';

import ArticlesIcon from '@mui/icons-material/LibraryBooks';
import DocumentsIcon from '@mui/icons-material/PictureAsPdf';
import LocationsIcon from '@mui/icons-material/LocationOn';
import NotesIcon from '@mui/icons-material/Note';
import PhotosIcon from '@mui/icons-material/Photo';
import TopicsIcon from '@mui/icons-material/QuestionAnswer';
import TodosIcon from '@mui/icons-material/AssignmentTurnedIn';

const useStyles = makeStyles()({
  icon: {
    fontSize: 20,
  },
});

const StyledIcon = ({ component: Component, ...props }) => {
  const { classes } = useStyles();
  return (
    <Component className={classes.icon} {...props} />
  );
};

StyledIcon.propTypes = {
  component: PropTypes.object.isRequired,
};

export default {
  Articles: <StyledIcon component={ArticlesIcon} />,
  Documents: <StyledIcon component={DocumentsIcon} />,
  Locations: <StyledIcon component={LocationsIcon} />,
  Notes: <StyledIcon component={NotesIcon} />,
  Photos: <StyledIcon component={PhotosIcon} />,
  Topics: <StyledIcon component={TopicsIcon} />,
  Todos: <StyledIcon component={TodosIcon} />,
};
