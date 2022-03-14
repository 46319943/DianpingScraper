const cookie = require("cookie");

let dianping_cookie_str = `ctu=e48dc820dbb5c36c649b9e4a6c19b95a9a96ce3b2b477de7ea2c6b94b19ce776; _lxsdk_cuid=17d3ceb782dc8-06ec1d3fe40882-561a1154-144000-17d3ceb782dc8; _lxsdk=17d3ceb782dc8-06ec1d3fe40882-561a1154-144000-17d3ceb782dc8; _hc.v=3f3dd23a-833e-e5ae-3f5e-fab5d60e7fc3.1637404683; s_ViewType=10; ua=dpuser_8925286360; fspop=test; cy=16; cye=wuhan; dplet=c68bab115235ebab1c50ffdbd796db0f; dper=a3c5969cf19b5bb0b17a944d30d6a0647294cb77e4c3f901339abf67072058ab97a4fffb8dcd461b54ddb95391c13bcf7fe210ba449af545ad680a3e4a628cf98b40ac994d49f9d216643ce394c7538591ce1e11ffc78337de56c4580fe91ff8; ll=7fd06e815b796be3df069dec7836c3df; _lxsdk_s=17f872faae5-d58-578-89d%7C%7C582`;
let dianping_cookie = parseCookie(dianping_cookie_str);

/**
 * 将cookie字符串解析为puppeteer输入格式
 * @param {*} cookieString
 * @param {*} domain
 */
function parseCookie(cookieString, domain = "http://.dianping.com") {
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

module.exports = {
  dianping_cookie_str,
  dianping_cookie,
};
