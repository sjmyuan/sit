import React, { useState, useEffect } from 'react';
import * as TE from 'fp-ts/TaskEither';
import * as O from 'fp-ts/Option';
import { pipe, constVoid } from 'fp-ts/lib/function';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Modal } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    image: {
      maxWidth: '100%',
      maxHeight: '100%',
    },
    paper: {
      position: 'absolute',
      width: 400,
      backgroundColor: theme.palette.background.paper,
      border: '2px solid #000',
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    },
  })
);

type ImageProps = {
  src: string;
};

const Image = (props: ImageProps) => {
  const classes = useStyles();
  const { src: propSrc } = props;
  const [isModal, setModal] = useState<boolean>(false);

  const handleModalClose = () => {
    setModal(false);
  };

  const handleModalOpen = () => {
    setModal(true);
  };

  return (
    <div>
      <img
        src={propSrc}
        alt=""
        onClick={handleModalOpen}
        onKeyUp={handleModalOpen}
        role="presentation"
        className={classes.image}
      />
      <Modal
        open={isModal}
        onClose={handleModalClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div className={classes.paper}>
          <img src={propSrc} alt="" className={classes.image} />
        </div>
      </Modal>
    </div>
  );
};

export default Image;
