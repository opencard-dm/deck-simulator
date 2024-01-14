/* eslint-disable max-len */
// firebase deploy --only functions
import {
  HttpsError,
} from 'firebase-functions/v2/identity';

import {region} from 'firebase-functions';
import {emails} from './emails';

export const beforecreated = region('asia-northeast1').auth.user().beforeCreate((user) => {
  const email = user?.email || '';
  if (emails.includes(email)) {
    return;
  }
  throw new HttpsError('invalid-argument', 'Unauthorized email');
});
