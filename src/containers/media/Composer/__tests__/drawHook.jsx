/* global globalThis */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { applyMiddleware, legacy_createStore as createStore } from 'redux';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// What the composer's hook tests draw their hooks with: React's own
// createRoot and act, in a store of their own and MUI's own theme.

const theme = createTheme();

// A store that keeps the state it is given and writes down every action
// dispatched to it; `alerts()` are the notices among them. An action that
// is a function is run, as the app's store runs one.
export const storeOf = (state) => {
  const dispatched = [];
  const thunks = ({ dispatch, getState }) => {
    return (next) => {
      return (action) => {
        return typeof action === 'function' ? action(dispatch, getState) : next(action);
      };
    };
  };
  const store = createStore((current = state, action) => {
    dispatched.push(action);
    return current;
  }, applyMiddleware(thunks));
  return {
    store,
    dispatched,
    alerts: () => {
      return dispatched.filter((action) => { return Boolean(action.severity); });
    },
  };
};

// Draws `useHook` with the props given to `draw`; `result.current` is what
// it gave the last time it was drawn.
export const drawHook = (useHook, store) => {
  const result = { current: null };
  let root = null;
  let box = null;

  const Host = (props) => {
    result.current = useHook(props);
    return null;
  };

  return {
    result,
    draw: (props = {}) => {
      globalThis.IS_REACT_ACT_ENVIRONMENT = true;
      if (!root) {
        box = document.createElement('div');
        document.body.appendChild(box);
        root = createRoot(box);
      }
      const host = <ThemeProvider theme={theme}><Host {...props} /></ThemeProvider>;
      act(() => {
        root.render(store ? <Provider store={store}>{host}</Provider> : host);
      });
    },
    unmount: () => {
      if (root) {
        act(() => { root.unmount(); });
        box.remove();
        root = null;
      }
    },
  };
};

// What has been promised settles, and what it set is drawn.
export const settle = async () => {
  await act(async () => {
    await new Promise((resolve) => { setTimeout(resolve, 0); });
  });
};
