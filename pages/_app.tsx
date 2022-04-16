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
import { MasksContainer } from '../renderer/store/MaskContainer';

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <InfoContainer.Provider>
      <ImageContainer.Provider>
        <RectsContainer.Provider>
          <TextsContainer.Provider>
            <MasksContainer.Provider>
              <ShapeContainer.Provider>
                <Component {...pageProps} />
              </ShapeContainer.Provider>
            </MasksContainer.Provider>
          </TextsContainer.Provider>
        </RectsContainer.Provider>
      </ImageContainer.Provider>
    </InfoContainer.Provider>
  );
};

export default App;
