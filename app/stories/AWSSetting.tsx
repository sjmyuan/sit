import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import * as O from 'fp-ts/Option';
import AWSSetting from '../features/settings/AWSSetting';

storiesOf('Setting', module).add('enabled', () => (
  <AWSSetting config={O.none} onSubmit={action('onSubmit')} />
));
