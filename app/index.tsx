import React, { Fragment } from 'react';
import { render } from 'react-dom';
import * as O from 'fp-ts/Option';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import { history, configuredStore } from './store';
import './app.global.css';
import { getFromStorage } from './localStorage';
import { AWSConfig } from './types';

const awsConfig = getFromStorage<AWSConfig>('aws_config');

const store = configuredStore({
  settings: { awsConfig: O.fromEither(awsConfig) },
  counter: { value: 1 },
  router: undefined as any,
});

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

document.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line global-require
  const Root = require('./containers/Root').default;
  render(
    <AppContainer>
      <Root store={store} history={history} />
    </AppContainer>,
    document.getElementById('root')
  );
});
