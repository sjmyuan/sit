import React from 'react';

import { storiesOf } from '@storybook/react';
import * as O from 'fp-ts/Option';
import AWSSetting from '../components/AWSSetting';

storiesOf('Setting', module).add('enabled', () => (
  <AWSSetting
    accessId={O.none}
    secretAccessKey={O.none}
    bucket={O.none}
    region={O.none}
  />
));
