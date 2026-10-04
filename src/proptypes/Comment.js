import {
  shape,
  number,
  string,
  bool,
} from 'prop-types';

import PersonType from './Person';

export default shape({
  id: number,
  type: string,
  body: string,
  author: PersonType,
  createdAt: string,
  editor: PersonType,
  updatedAt: string,
  likesCount: number,
  dislikesCount: number,
  isLikedByViewer: bool,
});
