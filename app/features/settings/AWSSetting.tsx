import React, { useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
  FormControl,
  InputLabel,
  Button,
  TextField,
  Select,
  MenuItem,
} from '@material-ui/core';
import * as O from 'fp-ts/Option';
import { sequenceT } from 'fp-ts/Apply';
import { pipe, constVoid, identity, constant } from 'fp-ts/lib/function';
import { AWSConfig } from '../../types';
import { regions } from '../../constants/regions.json';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& .MuiTextField-root': {
        margin: theme.spacing(1),
        width: '25ch',
      },
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
  })
);

interface AWSSettingProps {
  config: O.Option<AWSConfig>;
  onSubmit: (config: AWSConfig) => void;
}

interface AWSSettingState {
  accessId: O.Option<string>;
  secretAccessKey: O.Option<string>;
  bucket: O.Option<string>;
  region: O.Option<string>;
}

const AWSSetting = (props: AWSSettingProps) => {
  const classes = useStyles();

  const { config } = props;

  const [state, setState] = useState<AWSSettingState>({
    accessId: pipe(
      config,
      O.map((x) => x.accessId)
    ),
    secretAccessKey: pipe(
      config,
      O.map((x) => x.secretAccessKey)
    ),
    bucket: pipe(
      config,
      O.map((x) => x.bucket)
    ),
    region: pipe(
      config,
      O.map((x) => x.region)
    ),
  });

  const handleChange = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    pipe(
      O.fromNullable(event.target.name),
      O.fold(constVoid, (name: string) =>
        setState({
          ...state,
          [name]: O.some(event.target.value as string),
        })
      )
    );
  };

  const handSubmit = (event: React.FormEvent<unknown>) => {
    event.preventDefault();

    const sequenceTOption = sequenceT(O.Applicative);

    pipe(
      sequenceTOption(
        state.accessId,
        state.secretAccessKey,
        state.bucket,
        state.region
      ),
      O.map(([accessId, secretAccessKey, bucket, region]) => ({
        accessId,
        secretAccessKey,
        bucket,
        region,
      })),
      O.fold(constVoid, props.onSubmit)
    );
  };

  return (
    <form
      className={classes.root}
      noValidate
      autoComplete="off"
      onSubmit={handSubmit}
    >
      <TextField
        required
        id="access_id"
        name="accessId"
        label="Access Key ID"
        value={pipe(state.accessId, O.fold(constant(''), identity))}
        onChange={handleChange}
      />
      <TextField
        required
        id="secret_access_key"
        name="secretAccessKey"
        type="password"
        label="Secret Access Key"
        value={pipe(state.secretAccessKey, O.fold(constant(''), identity))}
        onChange={handleChange}
      />
      <TextField
        required
        id="bucket"
        label="Bucket"
        name="bucket"
        value={pipe(state.bucket, O.fold(constant(''), identity))}
        onChange={handleChange}
      />
      <FormControl className={classes.formControl}>
        <InputLabel id="region_lable">Region</InputLabel>
        <Select
          labelId="aws-region"
          id="region"
          name="region"
          value={pipe(state.region, O.fold(constant(''), identity))}
          onChange={handleChange}
        >
          {regions.map((r) => (
            <MenuItem value={r} key={`region-${r}`}>
              {r}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button type="submit" variant="contained" size="medium" color="primary">
        Save
      </Button>
    </form>
  );
};

export default AWSSetting;
