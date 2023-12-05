const puppeteer = require("puppeteer");
const puppeteerExtra = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteerExtra.use(StealthPlugin());

const { scrapeComment } = require("./scrape_comment");
const { scrapeDianpingUserInDB } = require("./scrape_user");
const { dianping_cookie } = require("./global_variables");

async function main() {
  const browser = await puppeteerExtra.launch({
    // The bug of screenshot during non-headless still exists.
    headless: true,
    // defaultViewport: null,
    defaultViewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 2,
    },
    args: [
      "--start-maximized", // you can also use '--start-fullscreen'
      // '--start-fullscreen',
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
    ],
    ignoreDefaultArgs: ["--enable-automation"],
  });

  const page = await browser.newPage();
  await page.setCookie(...dianping_cookie);

  // TODO: 降级Puppeteer到9.1.1版本，避免截图BUG
  // TODO: 降级之后还是有截图BUG，肯定是依赖库什么什么的原因。还是就用无界面模式好了

  await scrapeComment(page, "G9K4MX4uAHO4TMjs", "拙政园", { page_index: 143, overwrite: true });

  // await scrapeDianpingUserInDB(page);

  await browser.close();
  await (await mongo.client).close();
  return 0;
}

// 执行主异步函数
main();
