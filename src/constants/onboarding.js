export default {
  // In the order they are offered. A step whose list comes back empty is left
  // out of the flow rather than shown empty.
  STEPS: {
    AVATAR: 'avatar',
    PROFILE: 'profile',
    FEATURED: 'featured',
  },
  // Where the dashboard remembers that the "Complete your profile" card was
  // dismissed. Per browser: a convenience, not a record.
  NUDGE_DISMISSED_STORAGE_KEY: 'anahita-dismissed-profile-nudge',
};
