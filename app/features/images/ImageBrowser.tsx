import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import { useSelector } from 'react-redux';
import Image from './Image';
import { selectImages } from '../../store';

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
  })
);

const ImageBrowser = () => {
  const classes = useStyles();
  const images = useSelector(selectImages);

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
          </GridListTile>
        ))}
      </GridList>
    </div>
  );
};

export default ImageBrowser;
