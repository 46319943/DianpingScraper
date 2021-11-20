const cookie = require("cookie");
const readline = require("readline");
let { dianping_cookie } = require("./global_variables");

const puppeteer = require("puppeteer");
const puppeteerExtra = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteerExtra.use(StealthPlugin());

/**
 * 访问页面，自动超时重试
 * @param {*} page
 * @param {*} url
 */
async function pageGoto(page, url) {
  // 访问超时循环
  while (true) {
    try {
      await page.goto(url, { timeout: 15000 });
      break;
    } catch (error) {
      console.log("time out error occur");
      continue;
    }
  }
}

/**
 * 访问页面时遇到验证页面，暂停访问等待输入
 * @param {import('puppeteer').Page} page
 * @param {*} url
 */
async function pageGotoVerify(page, url) {
  await pageGoto(page, url);

  // 获取失败，需要验证
  while ((await page.title()) == "验证中心") {
    console.log(`当前页面：${url}`);

    // await askQuestion("手动打开谷歌浏览器进行验证，回车继续");
    // 自动打开页面
    await verify();
    console.log("验证成功");

    await pageGoto(page, url);
  }

  let pageContent = await page.content();

  while (pageContent.includes("抱歉！页面无法访问")) {
    console.log(`当前页面：${url}`);
    console.log("爬虫被检测，尝试重新登录");
    // await askQuestion("爬虫被检测，更换IP或重新登录，回车继续");

    await page.evaluate(async () => {
      sessionStorage.clear();
      localStorage.clear();
      let databseInfoList = await indexedDB.databases();
      databseInfoList.forEach((databaseInfo) => {
        indexedDB.deleteDatabase(databaseInfo.name);
      });
    });
    let newCookies = await login();
    await page.setCookie(...newCookies);

    // TODO: cookie设置失败? 可能要先删除再设置?
    let currentCookies = await page.cookies();
    console.log(currentCookies);
    
    await pageGoto(page, url);
  }

  // 有时候页面是空页面
  while (pageContent == "<html><head></head><body></body></html>") {
    console.log(`空页面：${url}`);
    await page.evaluate(async () => {
      sessionStorage.clear();
      localStorage.clear();
      let databseInfoList = await indexedDB.databases();
      databseInfoList.forEach((databaseInfo) => {
        indexedDB.deleteDatabase(databaseInfo.name);
      });
    });
    await pageGoto(page, url);
  }

  console.log(`page navigate to ${url}`);
}

/**
 * 浏览器窗口滚动至底部并延时两秒返回Resolved的Promise
 */
async function scrollToBottom() {
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  window.scrollTo({
    left: 0,
    top: document.body.scrollHeight,
    behavior: "smooth",
  });
  await sleep(2000);
}

/**
 * 将cookie字符串解析为puppeteer输入格式
 * @param {*} cookieString
 * @param {*} domain
 */
function parseCookie(cookieString, domain = "http://www.dianping.com") {
  let cookieObject = cookie.parse(cookieString);
  let cookieKeyValueList = Array();
  for (const key in cookieObject) {
    if (cookieObject.hasOwnProperty(key)) {
      const element = cookieObject[key];
      cookieKeyValueList.push({
        name: key,
        value: element,
        url: domain,
      });
    }
  }
  return cookieKeyValueList;
}

/**
 * 异步等待获取输入
 * @param {string} query
 */
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

/**
 * 自动打开页面进行验证
 * @returns
 */
async function verify() {
  /** @type {puppeteer.Browser} */
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
  /** @type {puppeteer.Page} */
  const page = await browser.newPage();
  await page.setCookie(...parseCookie(dianping_cookie));
  await pageGoto(
    page,
    "http://www.dianping.com/shop/l4twNneJonrrRkFe/review_all/p58?queryType=sortType&queryVal=latest"
  );

  let verifyResolve;
  let promise = new Promise((resolve) => {
    verifyResolve = resolve;
  });

  await page.waitForSelector("a.logo-view", { timeout: 0 });
  verifyResolve();

  async function checkVerify() {
    if ((await page.title()) != "验证中心") {
      verifyResolve();
      return;
    }
    setTimeout(checkVerify, 1000);
  }
  // checkVerify();

  await browser.close();

  return promise;
}

async function login() {
  /** @type {puppeteer.Browser} */
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
  /** @type {puppeteer.Page} */
  const page = await browser.newPage();
  await pageGoto(
    page,
    "https://account.dianping.com/login?redir=https://www.dianping.com/member/8084928"
  );
  await page.waitForSelector("div#top-nav .icon-logo", { timeout: 0 });
  let newCookies = await page.cookies();
  await browser.close();
  return newCookies;
}

module.exports = {
  pageGoto,
  pageGotoVerify,
  scrollToBottom,
  parseCookie,
  askQuestion,
};
