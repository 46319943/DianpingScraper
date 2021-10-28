const dayjs = require("dayjs");

export function scrape_time(item) {
  item["scrape_timestamp"] = dayjs().valueOf();
  item["scrape_time"] = dayjs().format("YYYY-MM-DD HH:mm:ss");
  return item;
}
