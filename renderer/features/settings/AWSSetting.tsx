import React from 'react';
import {
  FormControl,
  InputLabel,
  TextField,
  Select,
  MenuItem,
  Box,
} from '@material-ui/core';
import * as O from 'fp-ts/Option';
import { pipe, constant, identity } from 'fp-ts/lib/function';
import { regions } from '../../constants/regions.json';
import { PreferencesContainer } from '../../store-unstated';

const AWSSetting = (): React.ReactElement => {
  const preferences = PreferencesContainer.useContainer();

  const { accessId, secretAccessKey, bucket, region } = preferences;

  return (
    <Box
      sx={{
        maxWidth: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        flexDirection: 'row',
        '& .MuiTextField-root': {
          margin: '10px',
          minWidth: 194,
        },
      }}
    >
      <Box sx={{ padding: '24px' }}>
        <TextField
          required
          error={O.isNone(accessId)}
          id="access_id"
          name="accessId"
          label="Access Key ID"
          value={pipe(accessId, O.fold(constant(''), identity))}
          onChange={(event) => {
            preferences.setAndSaveAccessId(
              pipe(
                O.some(event.target.value as string),
                O.filter((x) => x.trim() !== '')
              )
            );
          }}
        />
      </Box>
      <Box sx={{ padding: '24px' }}>
        <TextField
          required
          error={O.isNone(secretAccessKey)}
          id="secret_access_key"
          name="secretAccessKey"
          type="password"
          label="Secret Access Key"
          value={pipe(secretAccessKey, O.fold(constant(''), identity))}
          onChange={(event) => {
            preferences.setAndSaveSecretAccessKey(
              pipe(
                O.some(event.target.value as string),
                O.filter((x) => x.trim() !== '')
              )
            );
          }}
        />
      </Box>
      <Box sx={{ padding: '24px' }}>
        <TextField
          required
          error={O.isNone(bucket)}
          id="bucket"
          label="Bucket"
          name="bucket"
          value={pipe(bucket, O.fold(constant(''), identity))}
          onChange={(event) => {
            preferences.setAndSaveBucket(
              pipe(
                O.some(event.target.value as string),
                O.filter((x) => x.trim() !== '')
              )
            );
          }}
        />
      </Box>
      <Box sx={{ padding: '24px' }}>
        <FormControl>
          <InputLabel required error={O.isNone(region)} id="region_lable">
            Region
          </InputLabel>
          <Select
            labelId="aws-region"
            id="region"
            name="region"
            error={O.isNone(region)}
            value={pipe(region, O.fold(constant(''), identity))}
            onChange={(event) => {
              preferences.setAndSaveRegion(
                pipe(
                  O.some(event.target.value as string),
                  O.filter((x) => x.trim() !== '')
                )
              );
            }}
          >
            {regions.map((r) => (
              <MenuItem value={r} key={`region-${r}`}>
                {r}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

export default AWSSetting;
