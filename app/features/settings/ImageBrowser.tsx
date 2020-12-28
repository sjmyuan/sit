import React, { useState, useEffect } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import * as A from 'fp-ts/Array';
import * as E from 'fp-ts/Either';
import { sequenceS } from 'fp-ts/Apply';
import { pipe, constVoid, identity, constant } from 'fp-ts/lib/function';
import ImageList from '@material-ui/core/ImageList';
import ImageListItem from '@material-ui/core/ImageListItem';
import { S3 } from 'aws-sdk';
import { AWSConfig } from '../../types';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: 500,
      height: 450,
    },
  })
);

interface ImageBrowserProps {
  config: AWSConfig;
}

type ImageInfo = {
  src: string;
  key: string;
};

interface ImageBrowserState {
  images: ImageInfo[];
  currentPointer: O.Option<string>;
}

const ImageBrowser = (props: ImageBrowserProps) => {
  const classes = useStyles();

  const {
    config: { accessId, secretAccessKey, region, bucket },
  } = props;

  const [state, setState] = useState<ImageBrowserState>({
    images: [],
    currentPointer: O.none,
  });

  useEffect(() => {
    const s3 = new S3({
      accessKeyId: accessId,
      secretAccessKey,
      region,
    });
    pipe(
      TE.fromTask(() =>
        s3
          .listObjects({
            Bucket: bucket,
            MaxKeys: 500,
          })
          .promise()
      ),
      TE.mapLeft((e) => new Error(`Failed to list objects, error is ${e}`)),
      TE.chain((res) => {
        const images = pipe(
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
          ),
          TE.chain((keys) =>
            A.array.traverse(TE.taskEither)(keys, (k) =>
              pipe(
                TE.fromTask(() =>
                  s3.getSignedUrlPromise('getObject', {
                    Bucket: bucket,
                    Key: k,
                  })
                ),
                TE.map((url) => ({ src: url, key: k }))
              )
            )
          )
        );

        const currentPointer = TE.of(O.fromNullable(res.NextMarker));

        return sequenceS(TE.taskEither)({
          images,
          currentPointer,
        });
      }),
      TE.map((newState) => {
        setState(newState);
        return constVoid();
      })
    );
  }, [accessId, secretAccessKey, region, bucket]);

  return (
    <div className={classes.root}>
      <ImageList variant="masonry" cols={3} gap={8}>
        {state.images.map((item) => (
          <ImageListItem key={item.key}>
            <img
              srcSet={`${item.src}?w=161&fit=crop&auto=format 1x,
                ${item.src}?w=161&fit=crop&auto=format&dpr=2 2x`}
              alt={item.key}
            />
          </ImageListItem>
        ))}
      </ImageList>
    </div>
  );
};

export default ImageBrowser;
