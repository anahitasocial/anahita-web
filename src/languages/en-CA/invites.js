export default {
  cTitle: 'Invites',
  mTitle: 'Invites',
  empty: 'No invites sent.',
  // How many more may wait at once; the count goes down as they send.
  remaining_one: 'You can send {{count}} more invite.',
  remaining_other: 'You can send {{count}} more invites.',
  atLimit_one: 'You have {{count}} invite waiting, the most you can. One frees up when an invite is accepted, expires, or you revoke it.',
  atLimit_other: 'You have {{count}} invites waiting, the most you can. One frees up when an invite is accepted, expires, or you revoke it.',
  restricted: {
    cTitle: 'Invites are restricted',
    cDescription: 'Administrators only.',
  },
  fields: {
    recipientEmail: 'Email',
  },
  status: {
    pending: 'Waiting',
    used: 'Accepted',
    expired: 'Expired',
  },
  actions: {
    add: 'Add',
    send: 'Send',
    revoke: 'Revoke',
    // The icon button carries no text, so the accessible name has to
    // say which invite it revokes — there is one per row.
    revokeFor: 'Revoke the invite to {{email}}',
  },
  form: {
    cTitle: 'Invite someone',
    cDescription: 'They get an email with a link to join.',
  },
  confirmRevoke: {
    cTitle: 'Revoke this invite?',
    // Kept, because it sends mail to somebody who is not expecting it.
    cDescription: 'The link to {{email}} stops working, and they are told it was withdrawn.',
  },
  alerts: {
    sent: 'An invite was sent to {{email}}',
    revoked: 'The invite to {{email}} was revoked',
  },
  errors: {
    browse: 'The invites could not be loaded.',
    add: 'The invite could not be sent.',
    delete: 'The invite could not be revoked.',
    // Only a fallback: the server sends its own message here, which
    // names the number outstanding and how a slot frees.
    conflict: 'That address already has an account, or you have too many invites outstanding.',
    forbidden: 'This site is not issuing invites.',
    rateLimited: 'Too many invites recently. Try again later.',
  },
};
