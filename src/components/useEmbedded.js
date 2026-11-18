import { useEffect, useState } from 'react';

import api from '../api';

// What a post's text shows of the posts and profiles it points to
// (PostEmbed, and its Citations): each read from the server as the reader,
// once for the page, however many times it is shown. One the reader may
// not see, or that is gone, is said to have failed, and is drawn as its
// address.

// Each read once, for its block and its line in the citations alike. One
// that could not be read is asked again the next time.
const once = (cache, key, read) => {
  if (!cache.has(key)) {
    cache.set(key, read().catch((error) => {
      cache.delete(key);
      throw error;
    }));
  }
  return cache.get(key);
};

// A post of this installation, by where it is read from and its id.
const posts = new Map();
const readPost = (at) => {
  return once(posts, `${at.namespace}/${at.id}`, () => {
    return api[at.namespace].read(at.id).then((result) => {
      return result.data;
    });
  });
};

// A profile, by its alias: which kind it is, then itself.
const profiles = new Map();
const readProfile = (alias) => {
  return once(profiles, alias, () => {
    return api.handles.read(alias).then((result) => {
      const { kind, id } = result.data;
      return api[kind].read(id);
    }).then((result) => {
      return result.data;
    });
  });
};

// What `read()` answers, read again whenever `key` changes and not at all
// while it is empty, and whether it failed. An answer that comes after the
// key has changed is dropped.
const useRead = (key, read) => {
  const [value, setValue] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!key) {
      return undefined;
    }
    let current = true;
    setValue(null);
    setFailed(false);
    read().then((answer) => {
      if (current) {
        setValue(answer);
      }
    }).catch(() => {
      if (current) {
        setFailed(true);
      }
    });
    return () => {
      current = false;
    };
  }, [key]);

  return [value, failed];
};

// The post an address is to, given as utils/embeds' postAt gives it:
// { post, failed }, the post null while it is read.
const usePost = (at) => {
  const namespace = at ? at.namespace : '';
  const id = at ? at.id : 0;
  const [post, failed] = useRead(namespace && id ? `${namespace}/${id}` : '', () => {
    return readPost({ namespace, id });
  });
  return { post, failed };
};

// The profile of an alias: { actor, failed }, the actor null while it is
// read.
const useProfile = (alias) => {
  const [actor, failed] = useRead(alias, () => {
    return readProfile(alias);
  });
  return { actor, failed };
};

export { usePost, useProfile };
