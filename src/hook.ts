import axios from "axios";
import { $WEBHOOK_URL } from "./entity";
import { makePostParams } from "./model";

export const postWebHook = async (): Promise<void> => {
  const postParams = await makePostParams();

  if ($WEBHOOK_URL === null) {
    return console.error("Webhook URLもしくはEndpoint URLが間違っています");
  }

  const url = $WEBHOOK_URL;
  postParams.map(async (params: any) => {
    await axios.post(url, params);
  });
};
