import { useEffect, useMemo, useState } from 'react';

import api from '../../../api';
import utils from '../../../utils';
import DEFAULT_CLIENT from '../../../proptypes/OAuthClientDefault';

const { form } = utils;

// Only ever a fallback, for when the discovery document cannot be read.
// Safe to hard-code because these three are fixed by a `oneof` tag on
// the request struct rather than by configuration — the list cannot
// vary between installations the way the scope catalog can.
export const FALLBACK_GRANT_TYPES = [
  'authorization_code',
  'refresh_token',
  'client_credentials',
];

const TEXT_FIELDS = [
  'clientId',
  'name',
  'redirectUris',
  'tokenExpiry',
];

// One URI per line is the friendliest shape for a list in a text area,
// and blank lines are what happen when somebody presses return twice.
// Dropped rather than sent, because the server validates every entry as
// a URL and an empty string is not one — which would fail the whole
// save over a stray newline.
export const linesToList = (value) => {
  return value
    .split('\n')
    .map((line) => {
      return line.trim();
    })
    .filter(Boolean);
};

const clientToFieldValues = (client) => {
  const source = client || DEFAULT_CLIENT;

  return {
    clientId: source.clientId || '',
    name: source.name || '',
    redirectUris: (source.redirectUris || []).join('\n'),
    tokenExpiry: source.tokenExpiry || DEFAULT_CLIENT.tokenExpiry,
  };
};

// Adds a value to a list, or takes it out if it is there.
const toggled = (list, value) => {
  return list.includes(value) ?
    list.filter((entry) => {
      return entry !== value;
    }) :
    [...list, value];
};

// Registering an OAuth client, or changing one, apart from how the dialog
// is drawn: its fields, which grant types and scopes it has of those the
// server offers, its three switches, and sending it.
//
// The dialog stays mounted between uses, so everything is seeded again each
// time it opens. `onSave` is the container's, which reports a failure and
// keeps the dialog open with what was typed.
const useOAuthClientForm = ({ open, client = null, onSave }) => {
  const isEdit = Boolean(client);

  const [fields, setFields] = useState(() => {
    return form.createFormFields(TEXT_FIELDS, clientToFieldValues(client));
  });
  const [grantTypes, setGrantTypes] = useState([]);
  const [scopes, setScopes] = useState([]);
  const [confidential, setConfidential] = useState(false);
  const [skipConsent, setSkipConsent] = useState(false);
  const [active, setActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // What the server says it supports, rather than a list maintained in
  // the browser. Both are validated on every save — grant types against
  // a `oneof` tag, scopes against the catalog in anahita-libs — so a
  // local copy can only drift, and the form this replaces had: it
  // offered a `password` grant auth-service has never accepted.
  const [supported, setSupported] = useState(null);

  useEffect(() => {
    if (!open || supported) {
      return undefined;
    }

    let cancelled = false;

    api.openidConfiguration.read()
      .then(({ data }) => {
        if (!cancelled) {
          setSupported({
            grantTypes: data.grantTypesSupported || FALLBACK_GRANT_TYPES,
            scopes: data.scopesSupported || [],
          });
        }
      })
      .catch(() => {
        // Degrade rather than block. Grant types are safe to assume;
        // the scope list is not, so it falls back to whatever this
        // client already holds. An edit then round-trips without
        // silently dropping scopes, and an add has nothing to offer —
        // correctly, since scopes are required and inventing them here
        // would just produce an invalid_scope from the server.
        if (!cancelled) {
          setSupported({
            grantTypes: FALLBACK_GRANT_TYPES,
            scopes: (client && client.scopes) || [],
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, supported, client]);

  // Re-seed every time the dialog opens, so editing one client and then
  // another does not show the first one's values.
  useEffect(() => {
    if (!open) {
      return;
    }

    setFields(form.createFormFields(TEXT_FIELDS, clientToFieldValues(client)));
    setGrantTypes((client && client.grantTypes) || []);
    setScopes((client && client.scopes) || []);
    setConfidential(Boolean(client && client.confidential));
    setSkipConsent(Boolean(client && client.skipConsent));
    setActive(client ? client.active !== false : DEFAULT_CLIENT.active);
  }, [open, client]);

  // The server requires at least one of each, and says so with a bare
  // 400. Checked here so the refusal names the field.
  const grantTypesMissing = grantTypes.length === 0;
  const scopesMissing = scopes.length === 0;

  const handleChange = (event) => {
    const { target } = event;
    // Checked now, while the field holds what was just typed: an updater
    // runs later, and read then, the message can be a keystroke behind
    // the value. Only the result is merged in.
    const checked = form.validateField(target, { [target.name]: fields[target.name] }, ['clientId', 'name']);
    setFields((previous) => {
      return { ...previous, ...checked };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const validated = form.validateForm(event.target, fields);
    setFields(validated);

    if (!form.isValid(validated) || grantTypesMissing || scopesMissing) {
      return;
    }

    const values = form.fieldsToData(validated);

    setSubmitting(true);

    Promise.resolve(onSave({
      // Sent on add only. clientId is immutable, and the edit endpoint
      // ignores it — including it would look like a rename that did
      // nothing.
      ...(isEdit ? {} : { clientId: values.clientId.trim() }),
      name: values.name.trim(),
      redirectUris: linesToList(values.redirectUris),
      grantTypes,
      scopes,
      tokenExpiry: Number(values.tokenExpiry) || DEFAULT_CLIENT.tokenExpiry,
      confidential,
      skipConsent,
      active,
      // firstParty is not sent. The handler assigns it true on both add
      // and edit whatever the body says, so a control for it would be a
      // switch that does nothing.
    }))
      .catch(() => {
        // Already reported by the container, which keeps the dialog
        // open with the typed values intact.
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const availableScopes = useMemo(() => {
    const catalog = (supported && supported.scopes) || [];

    // A scope the client holds but the catalog no longer lists still
    // has to be visible — otherwise it disappears from the form and is
    // dropped by the next save without anybody being told.
    const extras = scopes.filter((scope) => {
      return !catalog.includes(scope);
    });

    return [...catalog, ...extras];
  }, [supported, scopes]);

  return {
    isEdit,
    fields,
    handleChange,
    handleSubmit,
    submitting,
    grantTypes,
    availableGrantTypes: (supported && supported.grantTypes) || FALLBACK_GRANT_TYPES,
    grantTypesMissing,
    toggleGrantType: (value) => {
      setGrantTypes(toggled(grantTypes, value));
    },
    scopes,
    availableScopes,
    scopesMissing,
    toggleScope: (value) => {
      setScopes(toggled(scopes, value));
    },
    confidential,
    setConfidential,
    skipConsent,
    setSkipConsent,
    active,
    setActive,
  };
};

export default useOAuthClientForm;
