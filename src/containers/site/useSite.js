import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import api from '../../api';
import agreementsUtil from '../../utils/agreements';

// What the site says about itself (GET /site, roadmap row 102), asked once
// and remembered: the gate, the agreements page and the About page all read
// it. Null until it has come; and null for good where it does not, which
// asks nobody to agree to anything.
let asked = null;

const ask = () => {
  if (!asked) {
    asked = api.site.read()
      .then((result) => { return result.data || null; })
      .catch(() => {
        asked = null;
        return null;
      });
  }
  return asked;
};

const useSite = () => {
  const [site, setSite] = useState(null);

  useEffect(() => {
    let current = true;
    ask().then((said) => {
      if (current) {
        setSite(said);
      }
    });
    return () => {
      current = false;
    };
  }, []);

  return site;
};

// The words of a text in `language`, or the nearest there is: the same
// language as spoken elsewhere, then English, then any. As the server's
// about.Text.In.
export const textIn = (text, language) => {
  if (!text) {
    return '';
  }
  if (text[language]) {
    return text[language];
  }
  const base = String(language || '').split('-')[0];
  const keys = Object.keys(text);
  const near = keys.find((key) => { return key.split('-')[0] === base && text[key]; });
  if (near) {
    return text[near];
  }
  const english = keys.find((key) => { return key.startsWith('en') && text[key]; });
  if (english) {
    return text[english];
  }
  const any = keys.find((key) => { return text[key]; });
  return any ? text[any] : '';
};

// Whether the viewer is behind on the site's rules (roadmap row 102), for the
// gates and the pages: `known` once the site has answered, or failed to.
// SITE_RULES off (NodeInfo's `siteRules` false) asks nobody.
export const useRules = () => {
  const site = useSite();
  const [known, setKnown] = useState(false);
  const viewer = useSelector((state) => { return state.session.viewer; });
  const rulesOn = useSelector((state) => {
    const { metadata } = state.app.nodeInfo || {};
    return !metadata || metadata.siteRules !== false;
  });

  useEffect(() => {
    let current = true;
    ask().then(() => {
      if (current) {
        setKnown(true);
      }
    });
    return () => {
      current = false;
    };
  }, []);

  return {
    site,
    known,
    outdated: agreementsUtil.hasOutdatedRules(viewer, site, rulesOn),
  };
};

export default useSite;
