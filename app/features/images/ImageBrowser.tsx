/* eslint-disable react/jsx-wrap-multilines */
import React from 'react';
import { clipboard } from 'electron';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
  GridList,
  GridListTile,
  GridListTileBar,
  IconButton,
} from '@material-ui/core';
import { Link as CopyKeyIcon } from '@material-ui/icons';
import { useSelector, useDispatch } from 'react-redux';
import Image from './Image';
import { selectImages } from '../../store';
import { setInfo } from '../../utils/infoSlice';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      overflow: 'hidden',
      backgroundColor: theme.palette.background.paper,
    },
    gridListTile: {
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      position: 'relative',
    },
    icon: {
      color: 'rgba(255, 255, 255, 0.54)',
    },
  })
);

const ImageBrowser = () => {
  const classes = useStyles();
  const images = useSelector(selectImages);
  const dispatch = useDispatch();

  const copyLink = (link: string) => {
    clipboard.writeText(link);
    dispatch(setInfo('Copied to Clipboard!'));
  };

  return (
    <div className={classes.root}>
      <GridList cellHeight="auto" cols={4}>
        {images.images.map(({ key, url }) => (
          <GridListTile
            classes={{ tile: classes.gridListTile }}
            key={key}
            cols={1}
          >
            <Image src={url} />
            <GridListTileBar
              actionIcon={
                <IconButton
                  aria-label={`copy ${key}`}
                  className={classes.icon}
                  onClick={() => copyLink(url)}
                >
                  <CopyKeyIcon />
                </IconButton>
              }
            />
          </GridListTile>
        ))}
      </GridList>
    </div>
  );
};

export default ImageBrowser;
