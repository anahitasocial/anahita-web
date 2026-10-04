import { singularize } from 'inflection';
import apis from '../api';

import createAction from './create';
import createGraphAction from './createGraph';
import createActorFollowRequests from './actor/followRequests';
import createActorAdminsAction from './actor/admins';
import admin from './admin';
import app from './app';
import commentsInline from './commentsInline';
import likes from './likes';
import session from './session';
import socialgraph from './socialgraph';
import stories from './stories';
import inbounds from './inbound';

const namespaces = {
  actors: [
    'groups',
    'people',
  ],
  media: [
    'articles',
    'documents',
    'notes',
    'photos',
    'topics',
  ],
  tags: [
    'hashtags',
    'locations',
  ],
  nodes: [
    'search',
    'blogs',
  ],
  feeds: [
    'feed_leaders',
    'feed_actor',
  ],
};

const actions = {
  admin,
  app,
  commentsInline,
  likes,
  session,
  socialgraph,
  stories,
  inbounds,
};

namespaces.actors.forEach((namespace) => {
  const api = apis[namespace][singularize(namespace)];
  actions[namespace] = {
    ...createAction(namespace)(apis[namespace]),
    followRequests: createActorFollowRequests(namespace)(api.followRequests),
    settings: {
      access: createAction(`${namespace}_access`)(api.access),
      admins: createActorAdminsAction(`${namespace}_admins`)(api.admins),
      apps: createAction(`${namespace}_apps`)(api.apps),
      // Under the actor's own namespace, not a `${namespace}_features` one:
      // the response is the whole actor, and landing it as an ordinary
      // EDIT_SUCCESS replaces the current actor in the store, so the
      // composers and profile tabs that read actor.features follow the save.
      features: createAction(namespace)({ edit: api.features.edit }),
    },
  };
});

namespaces.media.forEach((namespace) => {
  const api = apis[namespace][singularize(namespace)];
  actions[namespace] = {
    ...createAction(namespace)(apis[namespace]),
    likes: likes(namespace)(apis.likes),
    access: createAction(`${namespace}_access`)(api.access),
  };
});

namespaces.tags.forEach((namespace) => {
  actions[namespace] = createAction(namespace)(apis[namespace]);
});

namespaces.nodes.forEach((namespace) => {
  actions[namespace] = createAction(namespace)(apis[namespace]);
});

actions.comments = {
  ...createAction('comments')(apis.comments),
  likes: likes('comments')(apis.likes),
};

actions.commentStatus = (namespace) => {
  return createAction('commentStatus')(apis.commentStatus(namespace));
};

namespaces.feeds.forEach((namespace) => {
  actions[namespace] = {
    ...createAction(namespace)(apis[namespace]),
    likes: likes(namespace)(apis.likes),
    reposts: createAction('reposts')(apis.reposts),
  };
});

actions.locationsGraph = createGraphAction('locations')(apis.tagGraph);

actions.notifications = {
  ...createAction('notifications')(apis.notifications),
  subs: createAction('notifications_sub')(apis.notificationsSub),
};

export default actions;
