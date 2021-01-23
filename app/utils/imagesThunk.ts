import { createAsyncThunk } from '@reduxjs/toolkit';
import { pipe } from 'fp-ts/lib/function';
import jimp from 'jimp';
import { sequenceS } from 'fp-ts/Apply';
import {
  O,
  AWSConfig,
  TE,
  T,
  S3ObjectPage,
  FileInfo,
  A,
  E,
  S3ObjectInfo,
  Resolution,
} from '../types';
import { s3Client, listObjects, putObjects, deleteObjects } from './aws';

type RequiedState = {
  settings: {
    secretAccessKey: O.Option<string>;
    accessId: O.Option<string>;
    bucket: O.Option<string>;
    region: O.Option<string>;
    pageSize: number;
    resolution: Resolution;
    cdn: O.Option<string>;
  };
  images: {
    historyPointer: O.Option<string>[];
    nextPointer: O.Option<string>;
  };
};

const getAWSConfig = (state: RequiedState): O.Option<AWSConfig> => {
  const awsConfig = {
    accessId: state.settings.accessId,
    secretAccessKey: state.settings.secretAccessKey,
    bucket: state.settings.bucket,
    region: state.settings.region,
  };

  return sequenceS(O.option)(awsConfig);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isRequiredState = (state: any): state is RequiedState => {
  return state.settings !== undefined && state.images !== undefined;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const validateState = (state: any) => {
  return pipe(
    state,
    TE.fromPredicate(
      isRequiredState,
      (x) => new Error(`${JSON.stringify(x)} is not root state`)
    ),
    TE.filterOrElse(
      (x) => O.isSome(getAWSConfig(x)),
      () => new Error('No AWS Credentials')
    )
  );
};

export const fetchNextPageImages = createAsyncThunk(
  'images/fetchNextpage',
  (_, { getState, rejectWithValue }) => {
    return pipe(
      getState(),
      validateState,
      TE.chain<Error, RequiedState, S3ObjectPage>((x) => {
        const { nextPointer } = x.images;
        // empty pointer means there is no more images
        if (O.isNone(nextPointer)) {
          return TE.left(new Error('Next page is empty'));
        }
        const awsConfig = getAWSConfig(x) as O.Some<AWSConfig>;
        const s3 = s3Client(awsConfig.value);
        return listObjects(s3, awsConfig.value.bucket)(
          nextPointer,
          x.settings.pageSize,
          x.settings.cdn
        );
      }),
      TE.fold<Error, S3ObjectPage, unknown>(
        (e) => T.of(rejectWithValue(e.message)),
        (r) => T.of(r)
      )
    )();
  }
);

export const fetchPreviousPageImages = createAsyncThunk(
  'images/fetchPreviousPage',
  (_, { getState, rejectWithValue }) => {
    return pipe(
      getState(),
      validateState,
      TE.chain<Error, RequiedState, S3ObjectPage>((x) => {
        const { historyPointer } = x.images;
        // empty pointer means there is no more images
        if (historyPointer.length < 2) {
          return TE.left(new Error('Previous page is empty'));
        }

        const previousPointer = historyPointer[historyPointer.length - 2];
        const awsConfig = getAWSConfig(x) as O.Some<AWSConfig>;
        const s3 = s3Client(awsConfig.value);
        return listObjects(s3, awsConfig.value.bucket)(
          previousPointer,
          x.settings.pageSize,
          x.settings.cdn
        );
      }),
      TE.fold<Error, S3ObjectPage, unknown>(
        (e) => T.of(rejectWithValue(e.message)),
        (r) => T.of(r)
      )
    )();
  }
);

export const uploadImgs = createAsyncThunk(
  'images/upload',
  (images: FileInfo[], { getState, rejectWithValue }) => {
    return pipe(
      getState(),
      validateState,
      TE.chain<Error, RequiedState, S3ObjectInfo[]>((x) => {
        const awsConfig = getAWSConfig(x) as O.Some<AWSConfig>;
        const s3 = s3Client(awsConfig.value);
        const reducedImages: TE.TaskEither<
          Error,
          FileInfo[]
        > = A.array.traverse(TE.taskEither)(images, ({ name, content }) => {
          return pipe(
            TE.fromTask<unknown, jimp>(() =>
              content.arrayBuffer().then((ab) => jimp.read(Buffer.from(ab)))
            ),
            TE.chain<unknown, jimp, Blob>((img) => {
              return TE.fromTask(() =>
                img
                  .contain(
                    x.settings.resolution.width,
                    x.settings.resolution.height
                  )
                  .getBufferAsync(jimp.MIME_PNG)
                  .then((buff) => new Blob([buff]))
              );
            }),
            TE.mapLeft(E.toError),
            TE.map<Blob, FileInfo>((blob) => ({ name, content: blob }))
          );
        });

        return pipe(
          reducedImages,
          TE.chain(putObjects(s3, awsConfig.value.bucket, x.settings.cdn))
        );
      }),
      TE.fold<Error, S3ObjectInfo[], unknown>(
        (e) => T.of(rejectWithValue(e.message)),
        (r) => T.of(r)
      )
    )();
  }
);

export const deleteImgs = createAsyncThunk(
  'images/delete',
  (images: string[], { getState, rejectWithValue }) => {
    return pipe(
      getState(),
      validateState,
      TE.chain<Error, RequiedState, void>((x) => {
        const awsConfig = getAWSConfig(x) as O.Some<AWSConfig>;
        const s3 = s3Client(awsConfig.value);
        return deleteObjects(s3, awsConfig.value.bucket)(images);
      }),
      TE.fold<Error, void, unknown>(
        (e) => T.of(rejectWithValue(e.message)),
        () => T.of(images)
      )
    )();
  }
);
