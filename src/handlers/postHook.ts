import "source-map-support/register";
import dalamb from "dalamb";
import { APIGatewayEvent } from "aws-lambda";
import { postWebHook } from "../webhook";

export default dalamb<APIGatewayEvent>(async event => {
  console.log(event);
  await postWebHook();
  return {
    statusCode: 200,
    headers: {},
    body: JSON.stringify("ok")
  };
});
