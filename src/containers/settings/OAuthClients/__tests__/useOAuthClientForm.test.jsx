/* global globalThis */
import React, { act } from 'react';
import PropTypes from 'prop-types';
import { createRoot } from 'react-dom/client';
import { vi } from 'vitest';

import api from '../../../../api';
import DEFAULT_CLIENT from '../../../../proptypes/OAuthClientDefault';
import useOAuthClientForm, { FALLBACK_GRANT_TYPES, linesToList } from '../useOAuthClientForm';

vi.mock('../../../../api', () => {
  return {
    default: {
      openidConfiguration: { read: vi.fn() },
    },
  };
});

const STARGATE = {
  clientId: 'stargate-command',
  name: 'Stargate Command',
  redirectUris: ['https://sgc.example/callback'],
  grantTypes: ['authorization_code'],
  scopes: ['read', 'old:scope'],
  tokenExpiry: 3600,
  confidential: true,
  skipConsent: false,
  active: true,
};

// A form as the browser would hand it over: its controls, valid, holding
// what the fields hold.
const formOf = (values) => {
  const element = document.createElement('form');
  Object.keys(values).forEach((name) => {
    const input = document.createElement(name === 'redirectUris' ? 'textarea' : 'input');
    input.name = name;
    input.value = values[name];
    element.appendChild(input);
  });
  return element;
};

describe('useOAuthClientForm', () => {
  let box;
  let root;
  let result;
  let sent;

  const Dialog = ({ open, client }) => {
    result = useOAuthClientForm({
      open,
      client,
      onSave: (body) => {
        sent.push(body);
        return Promise.resolve();
      },
    });
    return null;
  };

  Dialog.propTypes = {
    open: PropTypes.bool.isRequired,
    client: PropTypes.object,
  };

  const draw = async (open, client = null) => {
    act(() => {
      root.render(<Dialog open={open} client={client} />);
    });
    await act(async () => {
      await new Promise((resolve) => { setTimeout(resolve, 0); });
    });
  };

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    sent = [];
    vi.clearAllMocks();
    api.openidConfiguration.read.mockImplementation(() => {
      return Promise.resolve({
        data: { grantTypesSupported: ['authorization_code', 'refresh_token'], scopesSupported: ['read', 'write'] },
      });
    });
    box = document.createElement('div');
    root = createRoot(box);
  });

  afterEach(() => {
    act(() => { root.unmount(); });
  });

  it('asks the server what it supports only once the dialog opens', async () => {
    await draw(false);
    expect(api.openidConfiguration.read).not.toHaveBeenCalled();

    await draw(true);
    expect(api.openidConfiguration.read).toHaveBeenCalledTimes(1);
    expect(result.availableGrantTypes).toEqual(['authorization_code', 'refresh_token']);
    expect(result.availableScopes).toEqual(['read', 'write']);
  });

  it('keeps a scope the client holds that the server no longer lists', async () => {
    await draw(true, STARGATE);

    expect(result.isEdit).toBe(true);
    expect(result.availableScopes).toEqual(['read', 'write', 'old:scope']);
    expect(result.fields.redirectUris.value).toBe('https://sgc.example/callback');
    expect(result.confidential).toBe(true);
  });

  it('falls back to the grant types it knows, and the scopes the client has', async () => {
    api.openidConfiguration.read.mockImplementation(() => { return Promise.reject(new Error('down')); });
    await draw(true, STARGATE);

    expect(result.availableGrantTypes).toEqual(FALLBACK_GRANT_TYPES);
    expect(result.availableScopes).toEqual(['read', 'old:scope']);
  });

  it('toggles a grant type and a scope', async () => {
    await draw(true);
    expect(result.grantTypesMissing).toBe(true);

    act(() => { result.toggleGrantType('refresh_token'); });
    act(() => { result.toggleScope('write'); });
    expect(result.grantTypes).toEqual(['refresh_token']);
    expect(result.scopes).toEqual(['write']);
    expect(result.grantTypesMissing).toBe(false);

    act(() => { result.toggleScope('write'); });
    expect(result.scopesMissing).toBe(true);
  });

  it('sends nothing without a grant type and a scope', async () => {
    await draw(true);

    const target = formOf({
      clientId: 'atlantis', name: 'Atlantis', redirectUris: 'https://atlantis.example/', tokenExpiry: '3600',
    });
    act(() => { result.handleSubmit({ preventDefault: () => {}, target }); });

    expect(sent).toEqual([]);
  });

  it('sends a change without the client id, with one address per line, and the default expiry for none', async () => {
    await draw(true, STARGATE);

    const target = formOf({
      clientId: STARGATE.clientId,
      name: ' Stargate Command ',
      redirectUris: 'https://sgc.example/callback\n\n https://sgc.example/two ',
      tokenExpiry: '',
    });
    await act(async () => {
      result.handleSubmit({ preventDefault: () => {}, target });
    });

    expect(sent).toHaveLength(1);
    expect(sent[0].clientId).toBeUndefined();
    expect(sent[0]).toMatchObject({
      name: 'Stargate Command',
      redirectUris: ['https://sgc.example/callback', 'https://sgc.example/two'],
      grantTypes: ['authorization_code'],
      scopes: ['read', 'old:scope'],
      tokenExpiry: DEFAULT_CLIENT.tokenExpiry,
      confidential: true,
    });
    expect(result.submitting).toBe(false);
  });

  it('drops the blank lines of a list of addresses', () => {
    expect(linesToList('a\n\n  b \n')).toEqual(['a', 'b']);
  });
});
