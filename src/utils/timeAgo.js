import moment from 'moment';

// How long ago something was made: "2 hours ago". What has been made cannot be
// in the future, so a device whose clock is a little behind the server's says
// "a few seconds ago", not "in a few seconds".
const timeAgo = (value) => {
  const when = moment.utc(value);
  const now = moment.utc();
  return (when.isAfter(now) ? now : when).fromNow();
};

export default timeAgo;
