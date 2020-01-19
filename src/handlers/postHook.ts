import "source-map-support/register";
import dalamb from "dalamb";
import { APIGatewayEvent } from "aws-lambda";
// import { getObject } from "../lib/aws";
// import { S3 } from "aws-sdk";
import moment from "moment";
import axios from "axios";

const {
  WEBHOOK_URL,
  ENDPOINT_URL
  /* TODO: S3に格納したAPIから取得する */
  // BUCKET_NAME,
  // KEY_NAME
} = process.env;

const $WEBHOOK_URL = WEBHOOK_URL ? WEBHOOK_URL : null;
const $ENDPOINT_URL = ENDPOINT_URL ? ENDPOINT_URL : null;

/* TODO: S3に格納したAPIから取得する */
// const getObjectParams: S3.Types.GetObjectRequest = {
//   Bucket: BUCKET_NAME ? BUCKET_NAME : "",
//   Key: KEY_NAME ? KEY_NAME : ""
// };

const now = moment();

const fetchLiverItems = async (): Promise<any> => {
  if ($ENDPOINT_URL === null) {
    return [
      {
        avatar_url:
          "https://pbs.twimg.com/profile_images/1085191620138479618/wwB-jlfk_400x400.jpg",
        username: "🌈 にじさんじ",
        content: "動画の取得に失敗しました(´；ω；｀)"
      }
    ];
  }

  try {
    /* TODO: S3に格納したAPIから取得する */
    // const { data, status } = await getObject(getObjectParams);
    const { data, status } = await axios($ENDPOINT_URL)
      .then(response => response.data)
      .catch(error => console.error(error));

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

  /* TODO: 時間毎のアナウンスを追加する */
  // const firstContent = {
  //   avatar_url:
  //     "https://pbs.twimg.com/profile_images/1071956107172634624/jzM7CFQ7_400x400.jpg",
  //   username: "Youtube Bot",
  //   content: `▼${now.format("HH時")}に配信予定の動画です`
  // };

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
