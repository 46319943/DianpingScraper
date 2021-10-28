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
      `Hm_lvt_602b80cf8079ae6591966cc70a3940e7=1635424472; dplet=2a21557ea4e5c9cca2e7cced1a3b24e5; dper=52fdd36542543e52df639f7fb983f4b4bf9fc73dbea46968472b318f40fdbe4fc8dd3a7d5c9648e34f7e53f6707a36556b97a2dd5f184e5db90b357b25650542; ll=7fd06e815b796be3df069dec7836c3df; ua=dpuser_8925286360; ctu=e48dc820dbb5c36c649b9e4a6c19b95a2008e3b42304683e2825ac1d045f2d1d; _lxsdk_cuid=17cc6e5ecccc8-097f6a95314f82-561a145a-144000-17cc6e5ecccc8; _lxsdk=17cc6e5ecccc8-097f6a95314f82-561a145a-144000-17cc6e5ecccc8; _hc.v=2d3733d7-fe59-fed3-89a3-52349f74ee80.1635424530; Hm_lpvt_602b80cf8079ae6591966cc70a3940e7=1635424565; _lxsdk_s=17cc6e5eccd-6f8-d21-620%7C%7C564`
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
