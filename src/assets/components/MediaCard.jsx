import React from 'react';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardActions from '@mui/material/CardActions';

import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

import { Link } from 'react-router-dom';

import DocumentsIcon from '@mui/icons-material/PictureAsPdf';
import NotesIcon from '@mui/icons-material/Note';
import PhotosIcon from '@mui/icons-material/Photo';
import TopicsIcon from '@mui/icons-material/QuestionAnswer';
import ArticlesIcon from '@mui/icons-material/LibraryBooks';

import i18n from '../../languages';

const HomeCardMedia = () => {
  return (
    <Card component="section">
      <CardHeader
        title={
          <Typography variant="h6">
            {i18n.t('commons:posts')}
          </Typography>
        }
        subheader="Media nodes"
      />
      <List>
        <ListItemButton
          component={Link}
          to="/explore/notes/"
        >
          <ListItemAvatar>
            <Avatar>
              <NotesIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={i18n.t('notes:cTitle')} />
        </ListItemButton>
        <ListItemButton
          component={Link}
          to="/explore/photos/"
        >
          <ListItemAvatar>
            <Avatar>
              <PhotosIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={i18n.t('photos:cTitle')} />
        </ListItemButton>
        <ListItemButton
          component={Link}
          to="/explore/topics/"
        >
          <ListItemAvatar>
            <Avatar>
              <TopicsIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={i18n.t('topics:cTitle')} />
        </ListItemButton>
        <ListItemButton
          component={Link}
          to="/explore/articles/"
        >
          <ListItemAvatar>
            <Avatar>
              <ArticlesIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={i18n.t('articles:cTitle')} />
        </ListItemButton>
        <ListItemButton
          component={Link}
          to="/explore/documents/"
        >
          <ListItemAvatar>
            <Avatar>
              <DocumentsIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={i18n.t('documents:cTitle')} />
        </ListItemButton>
      </List>
      <CardActions>
        <Button
          fullWidth
          href="/explore/notes"
          various="text"
        >
          {i18n.t('commons:viewAll')}
        </Button>
      </CardActions>
    </Card>
  );
};

export default HomeCardMedia;
