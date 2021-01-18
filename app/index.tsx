import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import { Provider } from 'react-redux';
import { StylesProvider } from '@material-ui/core';
import { history, configuredStore } from './store';
import './app.global.css';

const store = configuredStore();

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

document.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line global-require
  const Root = require('./Root').default;

  render(
    <StylesProvider injectFirst>
      <AppContainer>
        <Provider store={store}>
          <Root history={history} />
        </Provider>
      </AppContainer>
    </StylesProvider>,
    document.getElementById('root')
  );
});
