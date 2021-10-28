const cookie = require("cookie");
const readline = require("readline");


/**
 * 访问页面，自动超时重试
 * @param {*} page
 * @param {*} url
 */
async function pageGoto(page, url) {
  // 访问超时循环
  while (true) {
    try {
      await page.goto(url, { timeout: 45000 });
      break;
    } catch (error) {
      console.log("time out error occur");
      continue;
    }
  }
}

/**
 * 访问页面时遇到验证页面，暂停访问等待输入
 * @param {*} page 
 * @param {*} url 
 */
async function pageGotoVerify(page, url) {
  await pageGoto(page, url);

  // 获取失败，需要验证
  while ((await page.title()) == "验证中心") {
    console.log(`当前页面：${url}`);

    // TODO: 自动打开页面
    await askQuestion("手动打开谷歌浏览器进行验证，回车继续");

    await pageGoto(page, url);
  }
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

module.exports = {
  pageGoto,
  pageGotoVerify,
  scrollToBottom,
  parseCookie,
  askQuestion
}