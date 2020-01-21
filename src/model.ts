import moment from "moment";
import { getLiverItems } from "./usecase";

export const makePostParams = async () => {
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
