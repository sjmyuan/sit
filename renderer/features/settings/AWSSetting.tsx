import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useSelector, useDispatch } from 'react-redux';
import {
  FormControl,
  InputLabel,
  TextField,
  Select,
  MenuItem,
} from '@material-ui/core';
import * as O from 'fp-ts/Option';
import { pipe, constant, identity } from 'fp-ts/lib/function';
import { regions } from '../../constants/regions.json';
import { selectAWSSettings } from '../../store';
import {
  updateAccessId,
  updateSecretAccessKey,
  updateBucket,
  updateRegion,
} from './settingsSlice';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& .MuiTextField-root': {
        margin: theme.spacing(1),
        minWidth: 194,
      },

      maxWidth: '100%',
      display: 'flex',
      flexWrap: 'wrap',
      flexDirection: 'row',
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 194,
    },
  })
);

const AWSSetting = () => {
  const classes = useStyles();

  const { accessId, secretAccessKey, bucket, region } = useSelector(
    selectAWSSettings
  );
  const dispatch = useDispatch();

  return (
    <div className={classes.root}>
      <TextField
        required
        error={O.isNone(accessId)}
        id="access_id"
        name="accessId"
        label="Access Key ID"
        value={pipe(accessId, O.fold(constant(''), identity))}
        onChange={(event) =>
          dispatch(
            updateAccessId(
              pipe(
                O.some(event.target.value as string),
                O.filter((x) => x.trim() !== '')
              )
            )
          )
        }
      />
      <TextField
        required
        error={O.isNone(secretAccessKey)}
        id="secret_access_key"
        name="secretAccessKey"
        type="password"
        label="Secret Access Key"
        value={pipe(secretAccessKey, O.fold(constant(''), identity))}
        onChange={(event) =>
          dispatch(
            updateSecretAccessKey(
              pipe(
                O.some(event.target.value as string),
                O.filter((x) => x.trim() !== '')
              )
            )
          )
        }
      />
      <TextField
        required
        error={O.isNone(bucket)}
        id="bucket"
        label="Bucket"
        name="bucket"
        value={pipe(bucket, O.fold(constant(''), identity))}
        onChange={(event) =>
          dispatch(
            updateBucket(
              pipe(
                O.some(event.target.value as string),
                O.filter((x) => x.trim() !== '')
              )
            )
          )
        }
      />
      <FormControl className={classes.formControl}>
        <InputLabel required error={O.isNone(region)} id="region_lable">
          Region
        </InputLabel>
        <Select
          labelId="aws-region"
          id="region"
          name="region"
          error={O.isNone(region)}
          value={pipe(region, O.fold(constant(''), identity))}
          onChange={(event) =>
            dispatch(
              updateRegion(
                pipe(
                  O.some(event.target.value as string),
                  O.filter((x) => x.trim() !== '')
                )
              )
            )
          }
        >
          {regions.map((r) => (
            <MenuItem value={r} key={`region-${r}`}>
              {r}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default AWSSetting;
