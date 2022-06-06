import { S3 } from "aws-sdk";
import { pipe } from "fp-ts/lib/function";
import { E, TE } from "../types";
import { getImageCache } from "./localImages";

export const uploadImage = (
  accessId: string,
  secretAccessKey: string,
  bucket: string,
  region: string,
  imgKey: string,
  remoteKey: string
) => {
  return pipe(
    getImageCache(imgKey),
    TE.chain((blob) => {
      const s3 = new S3({
        accessKeyId: accessId,
        secretAccessKey,
        region,
      });
      return TE.tryCatch(
        () =>
          s3
            .putObject({
              Bucket: bucket,
              Key: remoteKey,
              Body: blob,
              StorageClass: 'STANDARD_IA',
            })
            .promise(),
        E.toError
      );
    }),
    TE.map(() => remoteKey)
  );
};
