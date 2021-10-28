const puppeteer = require("puppeteer");
const puppeteerExtra = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteerExtra.use(StealthPlugin());

const cookie = require("cookie");
const readline = require("readline");
const fs = require("fs");
const FormData = require("form-data");
const axios = require("axios").default;
const mongo = require("./db/mongo");
const dayjs = require("dayjs");
const { user } = require("./db/mongo");

async function main() {
  const browser = await puppeteerExtra.launch({
    headless: false,
    defaultViewport: null,
    args: [
      "--start-maximized", // you can also use '--start-fullscreen'
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
    ],
    ignoreDefaultArgs: ["--enable-automation"],
  });

  const page = await browser.newPage();
  await page.setCookie(
    ...parseCookie(
      `Hm_lvt_602b80cf8079ae6591966cc70a3940e7=1612156012; lgtoken=0a590ae94-2eac-4485-aafb-a6a296b5652d; dplet=5580a25a822c72a0fd84cf4bfaf2dec0; dper=db2cc5552c2370649b900e423a34ebf5f021b31549e49955fee455b3d869d3a965ce23b3fe8267f871fd7934ad77595680703eaebfffbd9851d4ebec62a8fdfa; ll=7fd06e815b796be3df069dec7836c3df; ua=dpuser_8925286360; ctu=e48dc820dbb5c36c649b9e4a6c19b95a65373169ae1d9b39314e0b594106edab; _lxsdk_cuid=1775bfce8c7c8-0527415135ca71-13e3563-1fa400-1775bfce8c7c8; _lxsdk=1775bfce8c7c8-0527415135ca71-13e3563-1fa400-1775bfce8c7c8; _hc.v=ed1851f5-757b-c45f-5d1e-ed7da6818c80.1612156038; Hm_lpvt_602b80cf8079ae6591966cc70a3940e7=1612156038; _lxsdk_s=1775bfce8c8-d-00c-edb%7C%7C143`
    )
  );

  await scrapeDianpingID(page, "l4twNneJonrrRkFe", "黄鹤楼", "2019-06-01");

  // await parseUserPage(page, `http://www.dianping.com/member/1281028058`);
  // await scrapeDianpingUserInDB();

  await browser.close();
  await (await mongo.client).close();
  return 0;
}

// 执行主异步函数
main();
