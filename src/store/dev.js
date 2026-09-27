import { applyMiddleware, createStore, compose } from 'redux';
import { thunk } from 'redux-thunk';
import { createLogger } from 'redux-logger';

import { apiErrorMiddleware } from '../middleware';
import reducer from '../reducers';

const loggerMiddleware = createLogger();

const middleware = applyMiddleware(
  thunk,
  apiErrorMiddleware,
  loggerMiddleware,
);

// Connects to the Redux DevTools browser extension when it is installed.
// eslint-disable-next-line no-underscore-dangle
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const createFinalStore = composeEnhancers(middleware)(createStore);

export default (initialState) => {
  return createFinalStore(reducer, initialState);
};
