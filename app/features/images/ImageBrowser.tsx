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
    gridList: {},
    gridListTile: {
      display: 'flex',
      alignItems: 'center',
    },
    modalStyle: {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    },
    paper: {
      position: 'absolute',
      width: 400,
      backgroundColor: theme.palette.background.paper,
      border: '2px solid #000',
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
    },
  })
);

const ImageBrowser = () => {
  const classes = useStyles();
  const images = useSelector(selectImages);

  return (
    <div className={classes.root}>
      <GridList cellHeight="auto" className={classes.gridList} cols={4}>
        {images.images.map(({ key, url }) => (
          <GridListTile key={key} cols={1} className={classes.gridListTile}>
            <Image src={url} />
          </GridListTile>
        ))}
      </GridList>
    </div>
  );
};

export default ImageBrowser;
