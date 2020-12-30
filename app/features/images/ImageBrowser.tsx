import React, { useState, useEffect } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import * as A from 'fp-ts/Array';
import * as E from 'fp-ts/Either';
import { sequenceS } from 'fp-ts/Apply';
import { pipe, constVoid } from 'fp-ts/lib/function';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import { S3 } from 'aws-sdk';
import { AWSConfig } from '../../types';
import Image from './Image';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      overflow: 'hidden',
      backgroundColor: theme.palette.background.paper,
    },
    gridList: {
      width: 500,
      height: 450,
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

interface ImageBrowserProps {
  config: AWSConfig;
}

interface ImageBrowserState {
  keys: string[];
  currentPointer: O.Option<string>;
}

const ImageBrowser = (props: ImageBrowserProps) => {
  const classes = useStyles();

  const {
    config: { accessId, secretAccessKey, region, bucket },
  } = props;

  const s3 = new S3({
    accessKeyId: accessId,
    secretAccessKey,
    region,
  });

  const [state, setState] = useState<ImageBrowserState>({
    keys: [],
    currentPointer: O.none,
  });

  useEffect(() => {
    const program = pipe(
      TE.fromTask(() =>
        s3
          .listObjects({
            Bucket: bucket,
            MaxKeys: 50,
          })
          .promise()
      ),
      TE.mapLeft((e) => new Error(`Failed to list objects, error is ${e}`)),
      TE.chain((res) => {
        const keys = pipe(
          TE.fromEither(
            E.fromNullable(new Error('There is no keys in bucket'))(
              res.Contents
            )
          ),
          TE.chain((contents) =>
            A.array.traverse(TE.taskEither)(contents, (k) =>
              TE.fromEither(
                E.fromNullable(new Error('The key is empty'))(k.Key)
              )
            )
          )
        );

        const currentPointer = TE.of(O.fromNullable(res.NextMarker));

        return sequenceS(TE.taskEither)({
          keys,
          currentPointer,
        });
      }),
      TE.map((newState) => {
        setState(newState);
        return constVoid();
      })
    );
    program();
  }, [accessId, secretAccessKey, region, bucket]);

  const getImage = (key: string): TE.TaskEither<Error, string> => {
    return TE.fromTask(() =>
      s3.getSignedUrlPromise('getObject', {
        Bucket: bucket,
        Key: key,
      })
    );
  };

  return (
    <div className={classes.root}>
      <GridList cellHeight={160} className={classes.gridList} cols={3}>
        {state.keys.map((key) => (
          <GridListTile key={key} cols={1}>
            <Image src={getImage(key)} />
          </GridListTile>
        ))}
      </GridList>
    </div>
  );
};

export default ImageBrowser;
