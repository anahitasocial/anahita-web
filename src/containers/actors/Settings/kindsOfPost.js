// The kinds of post a channel's admins turn on (anahita-services roadmap
// row 147): articles and topics, off for a new channel. Notes, photos and
// videos are always on (graph-grpc-defaults/actor_features/channel.json).
//
// A kind is on when the channel's merged features list it among
// text-service's node types. The server keeps the kinds its defaults have
// and adds those a profile saved, so turning one on saves it beside them,
// and turning it off saves the list without it.
//
// JSX-free, as featurePermissions.js is, so it can be tested as data.
import { toFeatures } from './featurePermissions';

export const OPTIONAL_KINDS = ['article', 'topic'];
const TEXT = 'text-service';

const textOf = (features) => {
  return (features || []).find((feature) => { return feature.service === TEXT; });
};

// Whether a kind is on for this channel.
export const isOn = (features, kind) => {
  const text = textOf(features);
  return Boolean(text && text.enabled && (text.nodeTypes || []).includes(kind));
};

// Whether the channel has a place for it at all: its text-service on.
export const hasText = (features) => {
  const text = textOf(features);
  return Boolean(text && text.enabled);
};

// The whole feature list to save, with the kind and its composer on or off.
export const withKind = (features, kind, on) => {
  const toggle = (list) => {
    const without = (list || []).filter((each) => { return each !== kind; });
    return on ? [...without, kind] : without;
  };
  return toFeatures(features).map((feature) => {
    if (feature.service !== TEXT) {
      return feature;
    }
    return {
      ...feature,
      nodeTypes: toggle(feature.nodeTypes),
      composers: toggle(feature.composers),
    };
  });
};
