import React from 'react';
import * as A from 'fp-ts/Array';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@material-ui/core';
import * as O from 'fp-ts/Option';
import { Resolution } from '../../types';
import { PreferencesContainer } from '../../store-unstated';

const availableResolutions: Resolution[] = [
  { width: 480, height: 320 },
  { width: 640, height: 480 },
  { width: 1280, height: 720 },
  { width: 1920, height: 1080 },
];

const ImageSetting = () => {
  const preferences = PreferencesContainer.useContainer();

  const { resolution } = preferences;

  return (
    <Box
      sx={{
        maxWidth: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        flexDirection: 'row',
      }}
    >
      <FormControl>
        <InputLabel required id="resolution_label">
          Resolution
        </InputLabel>
        <Select
          labelId="resolution"
          id="resolution"
          name="resolution"
          value={O.getOrElse(() => 0)(
            A.findIndex<Resolution>(
              ({ width, height }) =>
                width === resolution.width && height === resolution.height
            )(availableResolutions)
          )}
          onChange={(event) => {
            preferences.setAndSaveResolution(
              availableResolutions[event.target.value as number]
            );
          }}
        >
          {A.range(0, availableResolutions.length - 1).map((r) => (
            <MenuItem value={r} key={`resolution-${r}`}>
              {`${availableResolutions[r].width} x ${availableResolutions[r].height}`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default ImageSetting;
