/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React, { Fragment } from 'react';
import { AppProps } from 'next/app';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import { Provider } from 'react-redux';
import { StylesProvider } from '@material-ui/core';
import { configuredStore } from '../renderer/store';
import '../renderer/app.global.css';
import {
  ShapeContainer,
  RectsContainer,
  TextsContainer,
} from '../renderer/store-unstated';

const store = configuredStore();

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <RectsContainer.Provider>
      <TextsContainer.Provider>
        <ShapeContainer.Provider>
          <AppContainer>
            <Provider store={store}>
              <StylesProvider injectFirst>
                <Component {...pageProps} />
              </StylesProvider>
            </Provider>
          </AppContainer>
        </ShapeContainer.Provider>
      </TextsContainer.Provider>
    </RectsContainer.Provider>
  );
};

export default App;
