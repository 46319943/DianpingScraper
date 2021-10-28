const puppeteer = require("puppeteer");
const puppeteerExtra = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteerExtra.use(StealthPlugin());

const { user } = require("./db/mongo");
const { parseCookie } = require("./puppeteer_utils");
const { scrapeComment } = require("./scrape_comment");

async function main() {
  const browser = await puppeteerExtra.launch({
    headless: false,
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
  await page.setCookie(
    ...parseCookie(
      `dplet=75a469cd1e4b45f650ff0161c4a3bf20; dper=52fdd36542543e52df639f7fb983f4b4f48ad419443c4c8903407e730faecc1e19e9a3e35668c5676530671e591d66c754d7edb248d499ddeff8041a664bb631; ll=7fd06e815b796be3df069dec7836c3df; ua=dpuser_8925286360; ctu=e48dc820dbb5c36c649b9e4a6c19b95a0cfbd01b687a2bfafe27a713bec790ea; _lxsdk_cuid=1762881fa81c8-08140c141bca38-5a30134f-1fa400-1762881fa81c8; _lxsdk=1762881fa81c8-08140c141bca38-5a30134f-1fa400-1762881fa81c8; _hc.v=6744f26c-6a61-0069-887e-7008a594fde5.1635411383; aburl=1; cy=16; cye=wuhan; _lxsdk_s=17cc69a5054-3a4-fc-53e%7C%7C1`
    )
  );

  await scrapeComment(page, "l4twNneJonrrRkFe", "黄鹤楼", "2019-06-01");

  // await parseUserPage(page, `http://www.dianping.com/member/1281028058`);
  // await scrapeDianpingUserInDB();

  await browser.close();
  await (await mongo.client).close();
  return 0;
}

// 执行主异步函数
main();
