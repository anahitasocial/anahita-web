import {
  shape,
  number,
  string,
  oneOf,
} from 'prop-types';

export default shape({
  id: number,
  type: oneOf(['node.tag.hashtag-service.hashtag.v1']),
  alias: string,
  name: string,
  createdAt: string,
  updatedAt: string,
});
