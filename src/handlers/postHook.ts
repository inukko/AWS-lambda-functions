import "source-map-support/register";
import dalamb from "dalamb";
import { APIGatewayEvent } from "aws-lambda";
import { getObject } from "../lib/aws";
import { S3 } from "aws-sdk";
import moment from "moment";
import axios from "axios";

const { WEBHOOK_URL, BUCKET_NAME, KEY_NAME } = process.env;

const $WEBHOOK_URL = WEBHOOK_URL ? WEBHOOK_URL : null;

const getObjectParams: S3.Types.GetObjectRequest = {
  Bucket: BUCKET_NAME ? BUCKET_NAME : "",
  Key: KEY_NAME ? KEY_NAME : ""
};

const fetchLiverItems = async (): Promise<any> => {
  try {
    const { data, status } = await getObject(getObjectParams);
    if (status == "ok") {
      console.log("ok");
      return {
        status,
        data
      };
    }
    return { data: { events: [] } };
  } catch (error) {
    console.log(error);
  }
};

const getLiverItems = async () => {
  const result = await fetchLiverItems().catch((error: any) =>
    console.log(error)
  );
  const { events } = result.data;

  if (events.length === 0) {
    return [
      {
        avatar_url:
          "https://pbs.twimg.com/profile_images/1085191620138479618/wwB-jlfk_400x400.jpg",
        username: "🌈 にじさんじ",
        content: "動画の取得に失敗しました(´；ω；｀)"
      }
    ];
  }

  const now = moment();

  /**
   * 一時間以内のライブを抽出
   */
  const liveItems = events.filter((event: any) => {
    const isHourMatch = moment(event.start_date).diff(now, "hour") === 0;
    const isAfter = moment(event.start_date).isAfter(now);
    return isHourMatch && isAfter;
  });
  return liveItems;
};

const makePostParams = async () => {
  const webHookItems = await getLiverItems();

  if (webHookItems.length === 0) {
    return [
      {
        avatar_url:
          "https://pbs.twimg.com/profile_images/1085191620138479618/wwB-jlfk_400x400.jpg",
        username: "🌈 にじさんじ",
        content: "1時間以内に配信予定の動画がありません(´；ω；｀)"
      }
    ];
  }

  const postParams = webHookItems.map((item: any) => {
    const { livers, start_date } = item;
    const liveTime = moment(start_date).format("MM月DD日  HH時mm分");
    const { name, avatar, color } = livers[0];

    const noPrefixHex: string = color.length === 7 ? color.slice(1) : "FFFFFF";
    const decimal: number = parseInt(noPrefixHex, 16);

    return {
      avatar_url: avatar,
      username: `🌈 ${name}`,
      content: `${liveTime}〜 ライブ開始`,
      embeds: [
        {
          thumbnail: {
            url: item.thumbnail
          },
          title: item.name,
          url: item.url,
          color: decimal
        }
      ]
    };
  });

  return postParams;
};

const postWebHook = async (): Promise<void> => {
  const postParams = await makePostParams();

  if ($WEBHOOK_URL === null) {
    return console.error("Webhook URLもしくはEndpoint URLが間違っています");
  }

  postParams.map(async (params: any) => {
    await axios.post($WEBHOOK_URL, params);
  });
};

export default dalamb<APIGatewayEvent>(async event => {
  console.log(event);
  await postWebHook();
  return {
    statusCode: 200,
    headers: {},
    body: JSON.stringify("ok")
  };
});
