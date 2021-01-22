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
import { selectSettings } from '../../store';
import { updateResolution, updatePageSize, updateCDN } from './settingsSlice';

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

const ImageSetting = () => {
  const classes = useStyles();

  const { resolution, pageSize, cdn } = useSelector(selectSettings);
  const dispatch = useDispatch();

  return (
    <div className={classes.root}>
      <TextField
        id="cdn"
        name="cdn"
        label="CDN Host"
        value={pipe(cdn, O.fold(constant(''), identity))}
        onChange={(event) =>
          dispatch(
            updateCDN(
              pipe(
                O.some(event.target.value as string),
                O.filter((x) => x.trim() !== '')
              )
            )
          )
        }
      />
      <FormControl className={classes.formControl}>
        <InputLabel required id="page_size_label">
          Page Size
        </InputLabel>
        <Select
          labelId="page_size"
          id="page_size"
          name="page_size"
          value={pageSize}
          onChange={(event) =>
            dispatch(updatePageSize(event.target.value as number))
          }
        >
          {[10, 20, 30, 50, 80, 130].map((r) => (
            <MenuItem value={r} key={`page-size-${r}`}>
              {r}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl className={classes.formControl}>
        <InputLabel required id="resolution_label">
          Resolution
        </InputLabel>
        <Select
          labelId="resolution"
          id="resolution"
          name="resolution"
          value={resolution}
          onChange={(event) =>
            dispatch(updateResolution(event.target.value as number))
          }
        >
          {[480, 720, 1080].map((r) => (
            <MenuItem value={r} key={`resolution-${r}`}>
              {r}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default ImageSetting;
