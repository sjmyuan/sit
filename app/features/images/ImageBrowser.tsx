/* eslint-disable react/jsx-wrap-multilines */
import React from 'react';
import { clipboard } from 'electron';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
  GridList,
  GridListTile,
  GridListTileBar,
  IconButton,
  Box,
} from '@material-ui/core';
import { Link as CopyKeyIcon, DeleteOutline } from '@material-ui/icons';
import { useSelector, useDispatch } from 'react-redux';
import Image from './Image';
import { selectImages } from '../../store';
import { setInfo } from '../../utils/infoSlice';
import { deleteImgs } from '../../utils/imagesThunk';

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
    bar: {
      height: '30px',
    },
    icon: {
      color: 'rgba(255, 255, 255, 0.54)',
      padding: '6px',
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

  const deleteImage = (key: string) => {
    dispatch(deleteImgs([key]));
  };

  return (
    <div className={classes.root}>
      <GridList cellHeight={180} cols={4} spacing={12}>
        {images.images.map(({ key, url }) => (
          <GridListTile
            classes={{ tile: classes.gridListTile }}
            key={key}
            cols={1}
          >
            <Image src={url} />
            <GridListTileBar
              className={classes.bar}
              actionIcon={
                <Box>
                  <IconButton
                    aria-label={`delete ${key}`}
                    className={classes.icon}
                    onClick={() => deleteImage(key)}
                  >
                    <DeleteOutline />
                  </IconButton>
                  <IconButton
                    aria-label={`copy ${key}`}
                    className={classes.icon}
                    onClick={() => copyLink(url)}
                  >
                    <CopyKeyIcon />
                  </IconButton>
                </Box>
              }
            />
          </GridListTile>
        ))}
      </GridList>
    </div>
  );
};

export default ImageBrowser;
