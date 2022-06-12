import React, { useState } from 'react';
import {
  FormControl,
  InputLabel,
  TextField,
  Select,
  MenuItem,
  Box,
  Button,
} from '@mui/material';
import * as O from 'fp-ts/Option';
import { pipe, constant, identity } from 'fp-ts/lib/function';
import { regions } from '../../constants/regions.json';

type AWSPreferencesProps = {
  initKey: string;
  onCancel: () => void;
  onUpload: (
    accessId: string,
    secretAccessKey: string,
    bucket: string,
    region: string,
    key: string
  ) => void;
};

const AWSPreferences = (props: AWSPreferencesProps): React.ReactElement => {
  const [accessId, setAccessId] = useState<O.Option<string>>(O.none);
  const [secretAccessKey, setSecretAccessKey] = useState<O.Option<string>>(
    O.none
  );
  const [bucket, setBucket] = useState<O.Option<string>>(O.none);
  const [region, setRegion] = useState<O.Option<string>>(O.none);
  const [imgKey, setImgKey] = useState<string>(props.initKey);

  return (
    <Box>
      <Box
        sx={{
          minWidth: 200,
          minHeight: 350,
          padding: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-around',
        }}
      >
        <TextField
          fullWidth
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
        <TextField
          fullWidth
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
        <TextField
          fullWidth
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
        <FormControl fullWidth>
          <InputLabel required error={O.isNone(region)} id="region_label">
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
        <TextField
          fullWidth
          required
          error={imgKey === ''}
          id="image-key"
          label="Key"
          name="image-key"
          value={imgKey}
          onChange={(event) => {
            setImgKey(event.target.value as string);
          }}
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
        }}
      >
        <Button variant="contained" onClick={props.onCancel}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={
            O.isNone(accessId) ||
            O.isNone(secretAccessKey) ||
            O.isNone(bucket) ||
            O.isNone(region)
          }
          onClick={() => {
            if (
              O.isSome(accessId) &&
              O.isSome(secretAccessKey) &&
              O.isSome(bucket) &&
              O.isSome(region)
            )
              props.onUpload(
                accessId.value,
                secretAccessKey.value,
                bucket.value,
                region.value,
                imgKey
              );
          }}
        >
          Upload
        </Button>
      </Box>
    </Box>
  );
};

export default AWSPreferences;
