// Whether a key sends what is being written, in a box that sends on Enter.
// Shift and Enter make a new line, and so does Enter on a touch screen, whose
// keyboard has no Shift to do it with: there the button sends. Enter that
// finishes a word being composed, as in Persian or Japanese, sends nothing.
const sendOnEnter = (event, touch = false) => {
  return event.key === 'Enter' &&
    !event.shiftKey &&
    !touch &&
    !(event.isComposing || (event.nativeEvent && event.nativeEvent.isComposing));
};

export default sendOnEnter;
