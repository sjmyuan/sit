import React from 'react';

import '../renderer/app.global.css';
import { ImageContainer } from '../renderer/store/ImageContainer';
import { InfoContainer } from '../renderer/store/InfoContainer';
import { RectsContainer } from '../renderer/store/RectsContainer';
import { TextsContainer } from '../renderer/store/TextContainer';
import { ShapeContainer } from '../renderer/store/ShapesContainer';
import { LinesContainer } from '../renderer/store/LineContainer';

export const decorators = [
  (Story) => (
    <InfoContainer.Provider>
      <ImageContainer.Provider>
        <RectsContainer.Provider>
          <TextsContainer.Provider>
            <LinesContainer.Provider>
              <ShapeContainer.Provider>{Story()}</ShapeContainer.Provider>
            </LinesContainer.Provider>
          </TextsContainer.Provider>
        </RectsContainer.Provider>
      </ImageContainer.Provider>
    </InfoContainer.Provider>
  ),
];
