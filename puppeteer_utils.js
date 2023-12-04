const readline = require("readline");
let { dianping_cookie } = require("./global_variables");
let newCookies = null;

const puppeteer = require("puppeteer");
const puppeteerExtra = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteerExtra.use(StealthPlugin());

/**
 * 访问页面，自动超时重试
 * @param {import('puppeteer').Page} page
 * @param {*} url
 */
async function pageGoto(page, url) {
  // 访问超时循环
  while (true) {
    try {
      await page.goto(url, { timeout: 15000, referer: "http://www.dianping.com/" });
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

  while (true) {
    const pageTitle = await page.title();
    const pageContent = await page.content();

    // 验证页面
    if (pageTitle == "验证中心") {
      console.log(`当前页面：${url}`);
      await verify(url);
      console.log("验证成功");
      await pageGoto(page, url);
    }
    // 页面无法访问
    else if (pageContent.includes("抱歉！页面无法访问")) {
      console.log(`当前页面：${url}`);
      console.log("爬虫被检测，尝试重新登录");
      await clearLocal(page);
      await page.deleteCookie(...(await page.cookies()));
      let newCookies = await login();
      await page.setCookie(...newCookies);
    }
    // 有时候页面是空页面
    else if (pageContent == "<html><head></head><body></body></html>") {
      console.log(`空页面：${url}`);
      await clearLocal(page);
    }
    // 需要登录
    else if (pageContent.includes('<span class="sub-logo">登录</span>')) {
      console.log(`当前页面：${url}`);
      console.log("需要重新登录");
      await clearLocal(page);
      await page.deleteCookie(...(await page.cookies()));
      let newCookies = await login();
      await page.setCookie(...newCookies);
    }
    // 403 forbidden
    else if (pageContent.includes("403 Forbidden")) {
      console.log(`403 Forbidden：${url}`);
      await clearLocal(page);
      await page.deleteCookie(...(await page.cookies()));
      let newCookies = await login();
      await page.setCookie(...newCookies);
    }
    // 页面正常
    else {
      console.log(`page navigate to ${url}`);
      break;
    }
    await pageGoto(page, url);
    continue;
  }
}

/**
 * 自动打开页面进行验证
 * @returns
 */
async function verify(url) {
  const { browser, page } = await launchPage();
  if (newCookies) {
    await page.setCookie(...newCookies);
  } else {
    await page.setCookie(...dianping_cookie);
  }
  await pageGoto(page, url);
  await page.waitForNavigation({ timeout: 2000 }).catch((reason) => {});
  await page.waitForSelector(".dpHeader > .dpLogo", {
    timeout: 0,
    hidden: true,
  });
  await browser.close();
}

/**
 * 打开登录页面
 * 返回登录后的Cookies
 * @returns
 */
async function login() {
  const { browser, page } = await launchPage();
  await pageGoto(page, "https://account.dianping.com/login");
  await page.waitForSelector("div.login-wrap-prod", { timeout: 0, hidden: true });
  let loginCookies = await page.cookies();
  await browser.close();
  newCookies = loginCookies;
  return loginCookies;
}

/**
 * 删除本地存储
 * @param {puppeteer.Page} page
 */
async function clearLocal(page) {
  await page.evaluate(async () => {
    sessionStorage.clear();
    localStorage.clear();
    let databseInfoList = await indexedDB.databases();
    databseInfoList.forEach((databaseInfo) => {
      indexedDB.deleteDatabase(databaseInfo.name);
    });
  });
}

/**
 * 创建一个新浏览器环境和页面
 * @param {*} param0
 * @returns
 */
async function launchPage({ headless = false } = {}) {
  /** @type {puppeteer.Browser} */
  const browser = await puppeteerExtra.launch({
    headless: headless,
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
  return { browser, page };
}

module.exports = {
  pageGoto,
  pageGotoVerify,
};

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
