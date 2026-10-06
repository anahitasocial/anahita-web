/* eslint-disable no-underscore-dangle */
import _ from 'lodash';
import axios from 'axios';
import { singularize } from 'inflection';
import createApi, { browseOwned } from './create';
import createActor from './actor';
import photos from './photos';
import replies from './replies';

import agreements from './agreements';
import authLogs from './authLogs';
import avatar from './avatar';
import cover from './cover';
import abuseReports from './abuseReports';
import accounts from './accounts';
import email from './email';
import feed from './feed';
import hashtags from './hashtags';
import is from './is';
import likes from './likes';
import locations from './locations';
import node from './node';
import nodeInfo from './nodeInfo';
import notifications from './notifications';
import notificationsSub from './notifications/sub';
import onboarding from './onboarding';
import oauthClients from './oauthClients';
import oauthSigningKeys from './oauthSigningKeys';
import openidConfiguration from './openidConfiguration';
import invites from './invites';
import signupRequests from './signupRequests';
import password from './password';
import reauth from './reauth';
import repost from './feed/repost';
import session from './session';
import socialgraph from './socialgraph';
import inbounds from './inbounds';
import tagGraph from './tag_graph';
import totp from './totp';
import api from '../utils/api';
import webauthn from './webauthn';

axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL;
axios.defaults.withCredentials = true;
axios.defaults.maxRedirects = 0;

const convertFormDataKey = (key) => {
  // Convert camelCase parts while preserving bracket structure
  return key.replace(/[^[\]]+/g, (match) => {
    return _.snakeCase(match);
  });
};

// Snake case request interceptor (keep)
axios.interceptors.request.use((config) => {
  let { data } = config;

  if (data instanceof FormData) {
    const newFormData = new FormData();
    Array.from(data.entries()).forEach(([key, value]) => {
      newFormData.append(convertFormDataKey(key), value);
    });
    data = newFormData;
  } else if (data && typeof data === 'object') {
    data = api.snakeCaseKeys(data);
  }

  return { ...config, data };
});

// Camel case response interceptor (keep)
axios.interceptors.response.use(
  (response) => {
    if (response.data && response.config.baseURL === axios.defaults.baseURL) {
      return {
        ...response,
        data: api.camelCaseKeys(response.data),
      };
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.data && error.config.baseURL === axios.defaults.baseURL) {
      const updatedError = { ...error };
      updatedError.response = {
        ...error.response,
        data: api.camelCaseKeys(error.response.data),
      };
      return Promise.reject(updatedError);
    }
    return Promise.reject(error);
  },
);

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
  nodes: [
    'search',
    'stories',
    'blogs',
  ],
};

const apis = {
  authLogs,
  avatar,
  agreements,
  cover,
  feed_leaders: feed.leaders,
  feed_actor: feed.actor,
  hashtags,
  is,
  likes,
  locations,
  node,
  nodeInfo,
  notifications,
  notificationsSub,
  onboarding,
  oauthClients,
  oauthSigningKeys,
  openidConfiguration,
  invites,
  signupRequests,
  password,
  reauth,
  replies,
  repost,
  session,
  socialgraph,
  inbounds,
  tagGraph,
  totp,
  webauthn,
  abuseReports,
  accounts,
  email,
};

namespaces.actors.forEach((ns) => {
  apis[ns] = {
    ...createApi(ns),
    [singularize(ns)]: createActor(ns),
  };
});

namespaces.media.forEach((ns) => {
  apis[ns] = {
    ...createApi(ns),
    browse: browseOwned(ns),
    [singularize(ns)]: createApi(ns),
  };
});

// A photo post is made from images uploaded one at a time, which the
// other kinds of post have no need of.
apis.photos = {
  ...apis.photos,
  ...photos,
  photo: {
    ...apis.photos.photo,
    ...photos,
  },
};

namespaces.nodes.forEach((ns) => {
  apis[ns] = createApi(ns);
});

export default apis;
