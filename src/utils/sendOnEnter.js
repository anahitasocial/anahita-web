// Whether a key sends what is being written, in a box that sends on Enter:
// the one-line reply (the user, 2026-11-07). Enter sends,
// on a touch screen too, where the keyboard's return key says Send; Shift
// and Enter make a new line, and the whole form, a tap away, is where a
// reply of several lines is written. Enter that finishes a word being
// composed, as in Persian or Japanese, sends nothing.
const sendOnEnter = (event) => {
  return event.key === 'Enter' &&
    !event.shiftKey &&
    !(event.isComposing || (event.nativeEvent && event.nativeEvent.isComposing));
};

export default sendOnEnter;
