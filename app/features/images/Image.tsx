import React, { useState, useEffect } from 'react';
import * as TE from 'fp-ts/TaskEither';
import * as O from 'fp-ts/Option';
import { pipe, constVoid } from 'fp-ts/lib/function';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Modal } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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

const modalStyle = {
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
};
type ImageProps = {
  src: TE.TaskEither<Error, string>;
};
type ImageState = {
  src: O.Option<string>;
  modal: boolean;
};

const Image = (props: ImageProps) => {
  const classes = useStyles();
  const { src: propSrc } = props;
  const [imgSrc, setImgSrc] = useState<O.Option<string>>(O.none);
  const [isModal, setModal] = useState<boolean>(false);

  useEffect(() => {
    pipe(
      propSrc,
      TE.map((src) => {
        setImgSrc(O.some(src));
        return constVoid();
      })
    )();
  }, [propSrc]);

  if (O.isNone(imgSrc)) {
    return <div />;
  }

  const handleModalClose = () => {
    setModal(false);
  };

  const handleModalOpen = () => {
    setModal(true);
  };

  return (
    <div>
      <img
        src={imgSrc.value}
        alt=""
        onClick={handleModalOpen}
        onKeyUp={handleModalOpen}
        role="presentation"
      />
      <Modal
        open={isModal}
        onClose={handleModalClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div style={modalStyle} className={classes.paper}>
          <img src={imgSrc.value} alt="" />
        </div>
      </Modal>
    </div>
  );
};

export default Image;
