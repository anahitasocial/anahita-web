import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { withStyles } from 'tss-react/mui';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import ButtonBase from '@mui/material/ButtonBase';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';

import MediumType from '../../../proptypes/Medium';
import ActorTitle from '../../../components/ActorTitle';
import ActorAvatar from '../../../components/ActorAvatar';
import CardHeaderOwner from '../../../components/MediumOwnerCardHeader';
import Player from '../../../components/Player';
import EntityBody from '../../../components/NodeBody';
import SignInPrompt from '../../../components/SignInPrompt';
import i18n from '../../../languages';
import utils from '../../../utils';
import styles from './styles';

const {
  getAuthor,
  getPortraitURL,
} = utils.node;

const TABS = {
  REPLIES: 'replies',
  LOCATIONS: 'locations',
};

const MediumReadArticle = ({
  classes,
  medium = {},
  access = null,
  actions = null,
  menu = null,
  locations = null,
  replies = null,
  context = null,
  editing = false,
  form = null,
  stats = null,
  handleView = null,
  cover = null,
}) => {
  const [tab, setTab] = useState(TABS.REPLIES);

  const changeTab = (event, value) => {
    setTab(value);
  };

  const portrait = getPortraitURL(medium, 'large');
  const author = getAuthor(medium);
  const createdAt = moment.utc(medium.createdAt).local().format('LLL').toString();

  const portraitMedia = (
    <CardMedia
      component="img"
      title={medium.name}
      alias={medium.name}
      image={portrait}
    />
  );

  return (
    <Grid
      container
      sx={{ justifyContent: 'center' }}
    >
      <Grid size={{ xs: 12, md: 8 }}>
        <Card component="article">
          {context}
          {!context && medium.owner && medium.owner.id !== author.id &&
            <CardHeaderOwner owner={medium.owner} />}
          {cover}
          {portrait && handleView &&
            <ButtonBase
              className={classes.portraitButton}
              onClick={handleView}
              aria-label={i18n.t('media:stepper.open')}
            >
              {portraitMedia}
            </ButtonBase>}
          {portrait && !handleView && portraitMedia}
          <CardHeader
            avatar={
              <ActorAvatar
                actor={author}
                linked={Boolean(author.id)}
              />
            }
            title={
              <ActorTitle
                actor={author}
                linked={Boolean(author.id)}
              />
            }
            subheader={
              <>
                {createdAt}
                {access}
              </>
            }
            action={menu}
          />
          {editing && form}
          {!editing &&
            <>
              {medium.body && <Player text={medium.body} />}
              <CardContent component="article">
                {medium.name &&
                  <Typography
                    variant="h2"
                    dir="auto"
                    lang={medium.language && medium.language !== 'und' ? medium.language : undefined}
                    className={classes.title}
                  >
                    {medium.name}
                  </Typography>}
                {medium.body &&
                  <EntityBody contentFilter lang={medium.language}>
                    {medium.body}
                  </EntityBody>}
                <SignInPrompt show={Boolean(medium.truncated)} />
              </CardContent>
              {stats &&
                <CardActions>
                  {stats}
                </CardActions>}
              {actions &&
                <CardActions>
                  {actions}
                </CardActions>}
            </>}
        </Card>
        <Tabs
          value={tab}
          onChange={changeTab}
          centered
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label={i18n.t('replies:cTitle')} value={TABS.REPLIES} />
          <Tab label="Locations" value={TABS.LOCATIONS} />
        </Tabs>
        {tab === TABS.REPLIES && replies}
        {tab === TABS.LOCATIONS && locations}
      </Grid>
    </Grid>
  );
};

MediumReadArticle.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.node,
  menu: PropTypes.node,
  medium: MediumType.isRequired,
  access: PropTypes.node,
  locations: PropTypes.node,
  // What a reply is a reply to, above a reply shown on its own.
  context: PropTypes.node,
  // The thread of replies under the article.
  replies: PropTypes.node,
  form: PropTypes.node,
  stats: PropTypes.node,
  editing: PropTypes.bool,
  handleView: PropTypes.func,
  cover: PropTypes.node,
};

export default withStyles(MediumReadArticle, styles);
