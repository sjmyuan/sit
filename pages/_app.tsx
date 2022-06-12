/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React from 'react';
import { AppProps } from 'next/app';
import '../renderer/app.global.css';
import { ImageContainer } from '../renderer/store/ImageContainer';
import { InfoContainer } from '../renderer/store/InfoContainer';
import { RectsContainer } from '../renderer/store/RectsContainer';
import { TextsContainer } from '../renderer/store/TextContainer';
import { ShapeContainer } from '../renderer/store/ShapesContainer';
import { LinesContainer } from '../renderer/store/LineContainer';
import { CommandsContainer } from '../renderer/store/CommandContainer';

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <InfoContainer.Provider>
      <ImageContainer.Provider>
        <CommandsContainer.Provider>
          <RectsContainer.Provider>
            <TextsContainer.Provider>
              <LinesContainer.Provider>
                <ShapeContainer.Provider>
                  <Component {...pageProps} />
                </ShapeContainer.Provider>
              </LinesContainer.Provider>
            </TextsContainer.Provider>
          </RectsContainer.Provider>
        </CommandsContainer.Provider>
      </ImageContainer.Provider>
    </InfoContainer.Provider>
  );
};

export default App;
