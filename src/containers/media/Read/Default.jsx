import React, { useState, useEffect } from 'react';
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
import PhotoSlides from '../../../components/PhotoSlides';
import Player from '../../../components/Player';
import Progress from '../../../components/Progress';
import EntityBody from '../../../components/NodeBody';
import SignInPrompt from '../../../components/SignInPrompt';
import i18n from '../../../languages';
import utils from '../../../utils';
import photoFiles from '../../../utils/photoFiles';
import styles from './styles';

const {
  getAuthor,
  getPortraitURL,
  getCoverURL,
} = utils.node;

const TABS = {
  REPLIES: 'replies',
  LOCATIONS: 'locations',
};

const MediumReadDefault = ({
  classes,
  medium,
  access = null,
  actions = null,
  menu = null,
  locations = null,
  replies = null,
  context = null,
  quote = null,
  editing = false,
  form = null,
  stats = null,
  handleView = null,
}) => {
  const [tab, setTab] = useState(TABS.REPLIES);

  const changeTab = (event, value) => {
    setTab(value);
  };

  const portrait = getPortraitURL(medium, 'original');
  const cover = getCoverURL(medium, 'large');
  const author = getAuthor(medium);
  const createdAt = moment.utc(medium.createdAt).local().format('LLL').toString();

  // A post with several images is drawn as slides, which load their own.
  const hasSlides = photoFiles.hasSeveral(medium);

  const [isLoaded, setIsLoaded] = useState(!portrait);

  useEffect(() => {
    if (portrait) {
      // eslint-disable-next-line no-undef
      const image = new Image();

      image.src = portrait;

      image.onload = () => {
        setIsLoaded(true);
      };
    }
  }, [portrait]);

  const portraitMedia = (
    <CardMedia
      component="img"
      title={medium.name}
      alt={photoFiles.altOf(medium)}
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
          {/* The profile it was posted on, when that is not its author's
              own: a group, or somebody else's profile. A reply says where
              it was said in its context, below. */}
          {!context && medium.owner && medium.owner.id !== author.id &&
            <CardHeaderOwner owner={medium.owner} />}
          {cover &&
            <CardMedia
              className={classes.cover}
              title={medium.name}
              image={cover}
              src="picture"
            />}
          {hasSlides &&
            <PhotoSlides
              medium={medium}
              size="large"
              onOpen={handleView ? () => {
                handleView();
              } : null}
            />}
          {!hasSlides && portrait && isLoaded && handleView &&
            <ButtonBase
              className={classes.portraitButton}
              onClick={handleView}
              aria-label={i18n.t('media:stepper.open')}
            >
              {portraitMedia}
            </ButtonBase>}
          {!hasSlides && portrait && isLoaded && !handleView && portraitMedia}
          {!hasSlides && !isLoaded &&
            <CardContent>
              <Progress />
            </CardContent>}
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
                {quote}
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
          <Tab label={i18n.t('locations:cTitle')} value={TABS.LOCATIONS} />
        </Tabs>
        {tab === TABS.REPLIES && replies}
        {tab === TABS.LOCATIONS && locations}
      </Grid>
    </Grid>
  );
};

MediumReadDefault.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.node,
  menu: PropTypes.node,
  medium: MediumType.isRequired,
  access: PropTypes.node,
  locations: PropTypes.node,
  // The post a note quotes, under the note's own words.
  quote: PropTypes.node,
  // What a reply is a reply to, above a reply shown on its own.
  context: PropTypes.node,
  // The thread of replies under the post.
  replies: PropTypes.node,
  form: PropTypes.node,
  stats: PropTypes.node,
  editing: PropTypes.bool,
  handleView: PropTypes.func,
};

export default withStyles(MediumReadDefault, styles);
