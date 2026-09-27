import {
  shape,
  number,
  string,
  bool,
  oneOf,
} from 'prop-types';

import PERSON from '../constants/person';
import ImageUrls from './ImageUrls';

const { USERTYPE } = PERSON.FIELDS;

const Agreement = shape({
  accepted: bool,
  version: string,
});

export default shape({
  id: number,
  alias: string,
  email: string,
  personType: oneOf([
    USERTYPE.GUEST,
    USERTYPE.REGISTERED,
    USERTYPE.ADMIN,
    USERTYPE.SUPER_ADMIN,
  ]),
  // Absent when there is no avatar. `avatar_urls` camel-cases to this, not to
  // avatarURLs.
  avatarUrls: ImageUrls,
  hasBio: bool,
  tosAgreement: Agreement,
  privacyAgreement: Agreement,
  // When the viewer went through onboarding, or null.
  onboardedAt: string,
});
