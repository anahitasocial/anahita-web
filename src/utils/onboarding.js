// Whether a viewer is walked through onboarding.
//
// Everything here reads the viewer as it arrives from /oauth/userinfo, so the
// gate decides without a request of its own: `avatarUrls` is present only when
// there is an avatar, `hasBio` says whether the bio has anything in it, and
// `onboardedAt` is set once somebody has been through the flow — whether they
// filled it in or skipped every step.

// hasAvatar looks for an actual URL rather than the key. The default viewer
// carries `avatarUrls: {}`, which is truthy and would read as an avatar.
const hasAvatar = (viewer) => {
  const urls = (viewer && viewer.avatarUrls) || {};

  return Object.keys(urls).some((size) => {
    return Boolean(urls[size] && urls[size].url);
  });
};

const hasBio = (viewer) => {
  return Boolean(viewer && viewer.hasBio);
};

// hasIncompleteProfile is what the dashboard nudges about, onboarded or not.
const hasIncompleteProfile = (viewer) => {
  return !hasAvatar(viewer) || !hasBio(viewer);
};

// needsOnboarding is what the gate redirects on.
//
// Only once. Somebody who went through the flow and skipped everything is not
// sent back on every sign-in; the dashboard nudge is what reminds them. And a
// viewer with a complete profile is not sent at all: the follow steps alone
// are not worth interrupting somebody who is already set up.
const needsOnboarding = (viewer) => {
  if (!viewer || !viewer.id) {
    return false;
  }

  return !viewer.onboardedAt && hasIncompleteProfile(viewer);
};

export default {
  hasAvatar,
  hasBio,
  hasIncompleteProfile,
  needsOnboarding,
};
