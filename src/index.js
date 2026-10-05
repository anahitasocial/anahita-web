import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import JavascriptTimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
// import fr from 'javascript-time-ago/locale/fr';
import './languages';
import Root from './containers/Root';
import configureStore from './store';
import visitor from './utils/visitor';

// Initialize the desired locales.
JavascriptTimeAgo.locale(en);
// JavascriptTimeAgo.locale(fr);

// On a members-only or preview site the server answers some requests
// with "sign in first". The pages that expect that show a way in. This
// is for a request nobody expected to be refused: left alone, the
// rejection is unhandled, and the browser shows it as an error with
// nothing in it, where all that happened is a visitor was asked to sign
// in. Every other unhandled rejection is left to be seen.
window.addEventListener('unhandledrejection', (event) => {
  if (visitor.isMembersOnlyRefusal(event.reason)) {
    event.preventDefault();
  }
});

const store = configureStore();
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <Root store={store} />
  </BrowserRouter>,
);
