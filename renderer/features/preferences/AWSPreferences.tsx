import React, { useState } from 'react';
import {
  FormControl,
  InputLabel,
  TextField,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import * as O from 'fp-ts/Option';
import { pipe, constant, identity } from 'fp-ts/lib/function';
import { regions } from '../../constants/regions.json';

const AWSPreferences = (): React.ReactElement => {
  const [accessId, setAccessId] = useState<O.Option<string>>(O.none);
  const [secretAccessKey, setSecretAccessKey] = useState<O.Option<string>>(
    O.none
  );
  const [bucket, setBucket] = useState<O.Option<string>>(O.none);
  const [region, setRegion] = useState<O.Option<string>>(O.none);

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
            setAccessId(
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
            setSecretAccessKey(
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
            setBucket(
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
              setRegion(
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

export default AWSPreferences;
