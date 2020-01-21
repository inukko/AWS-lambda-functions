import axios from "axios";
import { $ENDPOINT_URL } from "./entity";

export const fetchLiverItems = async (): Promise<any> => {
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
