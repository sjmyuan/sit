import { createAsyncThunk } from '@reduxjs/toolkit';
import { pipe } from 'fp-ts/lib/function';
import reduce from 'image-blob-reduce';
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
} from '../types';
import { s3Client, listObjects, putObjects } from './aws';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isRootState = (state: any): state is RootState => {
  return state.settings !== undefined && state.images !== undefined;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getRootState = (state: any): TE.TaskEither<Error, RootState> => {
  return pipe(
    state,
    TE.fromPredicate(
      isRootState,
      (x) => new Error(`${JSON.stringify(x)} is not root state`)
    )
  );
};

const imgReduce = reduce();

export const fetchImages = createAsyncThunk(
  'images/fetch',
  (pointer: O.Option<string>, { getState, rejectWithValue }) => {
    return pipe(
      getState(),
      getRootState,
      TE.filterOrElse(
        (x) => O.isSome(x.settings.awsConfig),
        () => new Error('No AWS Credentials')
      ),
      TE.chain((x) => {
        // empty pointer means there is no more images
        if (O.isNone(pointer)) {
          return TE.of({ objects: [], pointer });
        }
        const awsConfig = x.settings.awsConfig as O.Some<AWSConfig>;
        const s3 = s3Client(awsConfig.value);
        return listObjects(s3, awsConfig.value.bucket)(
          pointer,
          x.settings.pageSize
        );
      }),
      TE.fold<Error, S3ObjectPage, unknown>(
        (e) => T.of(rejectWithValue(e)),
        (r) => T.of(r)
      )
    )();
  }
);

export const refreshImages = createAsyncThunk(
  'images/refresh',
  (_, { getState, rejectWithValue }) => {
    return pipe(
      getState(),
      getRootState,
      TE.filterOrElse(
        (x) => O.isSome(x.settings.awsConfig),
        () => new Error('No AWS Credentials')
      ),
      TE.chain((x) => {
        const awsConfig = x.settings.awsConfig as O.Some<AWSConfig>;
        const s3 = s3Client(awsConfig.value);
        return listObjects(s3, awsConfig.value.bucket)(
          O.none,
          x.settings.pageSize
        );
      }),
      TE.fold<Error, S3ObjectPage, unknown>(
        (e) => T.of(rejectWithValue(e)),
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
      getRootState,
      TE.filterOrElse(
        (x) => O.isSome(x.settings.awsConfig),
        () => new Error('No AWS Credentials')
      ),
      TE.chain((x) => {
        const awsConfig = x.settings.awsConfig as O.Some<AWSConfig>;
        const s3 = s3Client(awsConfig.value);
        const reducedImages: TE.TaskEither<
          Error,
          FileInfo[]
        > = A.array.traverse(TE.taskEither)(images, ({ name, content }) => {
          return pipe(
            TE.fromTask<unknown, Blob>(() =>
              imgReduce.toBlob(content, { max: x.settings.resolution })
            ),
            TE.mapLeft(E.toError),
            TE.map<Blob, FileInfo>((blob) => ({ name, content: blob }))
          );
        });

        return pipe(
          reducedImages,
          TE.chain(putObjects(s3, awsConfig.value.bucket))
        );
      }),
      TE.fold<Error, S3ObjectInfo[], unknown>(
        (e) => T.of(rejectWithValue(e)),
        (r) => T.of(r)
      )
    )();
  }
);
