import moment from "moment";

/**
 * 環境変数
 */
const { WEBHOOK_URL, ENDPOINT_URL } = process.env;
export const $WEBHOOK_URL = WEBHOOK_URL ? WEBHOOK_URL : null;
export const $ENDPOINT_URL = ENDPOINT_URL ? ENDPOINT_URL : null;

/**
 * 日付操作
 */
export const now = moment();
