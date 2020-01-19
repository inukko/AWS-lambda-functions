import { S3 } from "aws-sdk";
const s3 = new S3();

export const getObject = (params: S3.Types.GetObjectRequest): Promise<any> => {
  return new Promise(resolve => {
    s3.getObject(params, (error: any, data: any) => {
      if (error) {
        console.log(error, error.stack);
      } else {
        const body = JSON.parse(data.Body.toString());
        resolve(body);
      }
    });
  });
};
