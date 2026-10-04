import axios from 'axios';

// Start a change of the signed-in person's email address.
//
// This does NOT change the address. It mails a 6-digit code to the
// person's CURRENT address, and the change applies only once they type
// it back with confirm() below. That is deliberate: email is what
// password reset delivers to, so an attacker sitting inside a live
// session must not be able to repoint the account on their own.
//
// TAKES ONLY THE ADDRESS. requests.EmailChangeEdit accepts nothing else
// — re-authentication happens separately at /reauth/*, which records a
// short-lived marker this endpoint checks. This module used to accept
// currentPassword and totpPasscode and send them alongside; the server
// ignored them, and the signature invited callers to keep threading a
// password through an endpoint built not to take one.
//
// Responses: 204 code sent, 400 invalid address, 403 no recent
// step-up (the caller re-authenticates and retries), 409 address already
// in use.
function edit(params) {
  const { email } = params;
  return axios.patch('email/change', {
    email,
  });
}

// Approve the pending change with the code that was mailed to the
// current address.
//
// Responses: 204 changed (every session, this one included, is signed
// out), 400 not six digits, 409 the new address was taken in the
// meantime, 410 nothing pending or the code expired or ran out of
// tries, 422 wrong code with { remaining } tries left.
function confirm(params) {
  const { code } = params;
  return axios.post('email/change/confirm', {
    code,
  });
}

export default {
  edit,
  confirm,
};
