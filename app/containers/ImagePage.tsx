import React from 'react';
import * as O from 'fp-ts/Option';
import { useSelector } from 'react-redux';
import {
  Container,
  AppBar,
  IconButton,
  Typography,
  Button,
  Toolbar,
  makeStyles,
  createStyles,
  Theme,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import ImageBrowser from '../features/images/ImageBrowser';
import { selectAWSConfig } from '../features/settings/settingsSlice';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
  })
);
export default function ImagePage() {
  const value = useSelector(selectAWSConfig);
  const classes = useStyles();
  if (O.isNone(value)) {
    return <div>There is no AWS credentials</div>;
  }
  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            News
          </Typography>
          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl">
        <ImageBrowser config={value.value} />
      </Container>
    </div>
  );
}
