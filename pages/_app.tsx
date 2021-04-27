/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React, { Fragment } from 'react';
import { AppProps } from 'next/app';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import { StylesProvider } from '@material-ui/core';
import '../renderer/app.global.css';
import {
  ShapeContainer,
  RectsContainer,
  TextsContainer,
  PreferencesContainer,
  InfoContainer,
} from '../renderer/store-unstated';

//const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;
const AppContainer = ReactHotAppContainer;

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <InfoContainer.Provider>
      <PreferencesContainer.Provider>
        <RectsContainer.Provider>
          <TextsContainer.Provider>
            <ShapeContainer.Provider>
              <AppContainer>
                <StylesProvider injectFirst>
                  <Component {...pageProps} />
                </StylesProvider>
              </AppContainer>
            </ShapeContainer.Provider>
          </TextsContainer.Provider>
        </RectsContainer.Provider>
      </PreferencesContainer.Provider>
    </InfoContainer.Provider>
  );
};

export default App;
