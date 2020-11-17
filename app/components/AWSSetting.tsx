import React, { useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { FormControl, InputLabel } from '@material-ui/core';
import * as O from 'fp-ts/Option';
import { pipe, constVoid, constUndefined, identity } from 'fp-ts/lib/function';

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
  accessId: O.Option<string>;
  secretAccessKey: O.Option<string>;
  bucket: O.Option<string>;
  region: O.Option<string>;
}

interface AWSSettingState {
  accessId: O.Option<string>;
  secretAccessKey: O.Option<string>;
  bucket: O.Option<string>;
  region: O.Option<string>;
}

const AWSSetting = (props: AWSSettingProps) => {
  const classes = useStyles();

  const { accessId, secretAccessKey, bucket, region } = props;

  const [state, setState] = useState<AWSSettingState>({
    accessId,
    secretAccessKey,
    bucket,
    region,
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

  return (
    <form className={classes.root} noValidate autoComplete="off">
      <TextField
        required
        id="access_id"
        name="accessId"
        label="Access Key ID"
        value={pipe(state.accessId, O.fold(constUndefined, identity))}
        onChange={handleChange}
      />
      <TextField
        required
        id="secret_access_key"
        name="secretAccessKey"
        type="password"
        label="Secret Access Key"
        value={pipe(state.secretAccessKey, O.fold(constUndefined, identity))}
        onChange={handleChange}
      />
      <TextField
        required
        id="bucket"
        label="Bucket"
        name="bucket"
        value={pipe(state.bucket, O.fold(constUndefined, identity))}
        onChange={handleChange}
      />
      <FormControl className={classes.formControl}>
        <InputLabel id="region_lable">Region</InputLabel>
        <Select
          labelId="aws-region"
          id="region"
          name="region"
          value={pipe(state.region, O.fold(constUndefined, identity))}
          onChange={handleChange}
        >
          <MenuItem value="ap-southeast-1">ap-southeast-1</MenuItem>
          <MenuItem value="ap-southeast-2">ap-southeast-2</MenuItem>
          <MenuItem value="ap-northeast-1">ap-northeast-1</MenuItem>
        </Select>
      </FormControl>
      <input type="submit" value="Save" />
    </form>
  );
};

export default AWSSetting;
