import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import * as O from 'fp-ts/Option';
import AWSSetting from '../features/settings/AWSSetting';

storiesOf('Setting', module)
  .add('without existing config', () => (
    <AWSSetting config={O.none} onSubmit={action('onSubmit')} />
  ))
  .add('with existing config', () => (
    <AWSSetting
      config={O.some({
        accessId: '110111',
        secretAccessKey: 'passwordd',
        bucket: 'test-bucket',
        region: 'ap-northeast-1',
      })}
      onSubmit={action('onSubmit')}
    />
  ));
