const puppeteer = require("puppeteer");
const puppeteerExtra = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteerExtra.use(StealthPlugin());

const { user } = require("./db/mongo");
const { parseCookie } = require("./puppeteer_utils");
const { scrapeComment } = require("./scrape_comment");

const { dianping_cookie } = require("./global_variables");

async function main() {
  const browser = await puppeteerExtra.launch({
    headless: true,
    defaultViewport: null,
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
  await page.setCookie(...parseCookie(dianping_cookie));

  // TODO: 降级Puppeteer到9.1.1版本，避免截图BUG
  // TODO: 降级之后还是有截图BUG，肯定是依赖库什么什么的原因。还是就用无界面模式好了

  await scrapeComment(page, "l4twNneJonrrRkFe", "黄鹤楼", { page_index: 1118 });

  // await parseUserPage(page, `http://www.dianping.com/member/1281028058`);
  // await scrapeDianpingUserInDB();

  await browser.close();
  await (await mongo.client).close();
  return 0;
}

// 执行主异步函数
main();
