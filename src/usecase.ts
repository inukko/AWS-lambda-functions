import moment from "moment";
import { now } from "./entity";
import { fetchLiverItems } from "./adapter";

export const getLiverItems = async () => {
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
