const cookie = require("cookie");

let dianping_cookie_str = `_lxsdk_cuid=186e54adceac8-0444a0f8679b02-7452547c-1fa400-186e54adceac8; _lxsdk=186e54adceac8-0444a0f8679b02-7452547c-1fa400-186e54adceac8; _hc.v=665e530f-f2da-1bec-17f7-5d451bba0c52.1701677919; qruuid=dd4e17ca-eb69-4e42-a1c8-ee9c6f9f4b4b; WEBDFPID=85u3xu5943uu591w033z4w2v42uw1wx881x66v132689795847y3v605-2017037919106-1701677919106KYKMASKfd79fef3d01d5e9aadc18ccd4d0c95078000; dplet=726834b55233af250cb7906576e7b676; dper=5421936f49f64c15bdd3083930758c1c28d5e7a7c3c9b6d7d1ead25ae18c250feb2cc35fc3d15bbbc0514529c280f48fde3e03ba836e1bd8250b21ba59e731c9; ll=7fd06e815b796be3df069dec7836c3df; ua=%E7%82%B9%E5%B0%8F%E8%AF%848908687382; ctu=e48dc820dbb5c36c649b9e4a6c19b95a663ad442cf558007e43542b3c55ebfda; Hm_lvt_602b80cf8079ae6591966cc70a3940e7=1701677936; Hm_lpvt_602b80cf8079ae6591966cc70a3940e7=1701677959; _lxsdk_s=18c33e86837-d00-1b6-265%7C%7C409`;
let dianping_cookie = parseCookie(dianping_cookie_str);

/**
 * 将cookie字符串解析为puppeteer输入格式
 * @param {*} cookieString
 * @param {*} domain
 */
function parseCookie(cookieString, domain = "http://.dianping.com") {
  // Set decode to String to prevent decode URL-encoded sequences.
  let cookieObject = cookie.parse(cookieString, { decode: String });
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
