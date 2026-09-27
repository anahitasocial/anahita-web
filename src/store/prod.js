import { applyMiddleware, createStore, compose } from 'redux';
import { thunk } from 'redux-thunk';

import { apiErrorMiddleware } from '../middleware';
import reducer from '../reducers';

const middleware = applyMiddleware(
  thunk,
  apiErrorMiddleware,
);

const createFinalStore = compose(middleware)(createStore);

export default (initialState) => {
  return createFinalStore(reducer, initialState);
};
