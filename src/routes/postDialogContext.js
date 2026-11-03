import { createContext } from 'react';

// True inside a post opened over a list (PostDialog), where it is read and
// answered and nothing else: the page it opens from has the rest.
const InPostDialog = createContext(false);

export default InPostDialog;
