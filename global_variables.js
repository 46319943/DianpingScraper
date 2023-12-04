const cookie = require("cookie");

let dianping_cookie_str = `
_lxsdk_cuid=186e54adceac8-0444a0f8679b02-7452547c-1fa400-186e54adceac8; _lxsdk=186e54adceac8-0444a0f8679b02-7452547c-1fa400-186e54adceac8; _hc.v=665e530f-f2da-1bec-17f7-5d451bba0c52.1701677919; WEBDFPID=85u3xu5943uu591w033z4w2v42uw1wx881x66v132689795847y3v605-2017037919106-1701677919106KYKMASKfd79fef3d01d5e9aadc18ccd4d0c95078000; ctu=e48dc820dbb5c36c649b9e4a6c19b95a663ad442cf558007e43542b3c55ebfda; Hm_lvt_602b80cf8079ae6591966cc70a3940e7=1701677936; fspop=test; cy=16; cye=wuhan; qruuid=e0c09bdc-5b14-41b1-bade-b1dcd69f8daf; dplet=b51a257f6575d1149ed904e9995a1c28; dper=5421936f49f64c15bdd3083930758c1c34e5dcbd97871d56410a785e5e61d770422f3dccc89d3e1902756f9f627ba9563ce99e7b0df743b5b227ca327c1f576e; ll=7fd06e815b796be3df069dec7836c3df; ua=%E7%82%B9%E5%B0%8F%E8%AF%848908687382; Hm_lpvt_602b80cf8079ae6591966cc70a3940e7=1701702115; _lxsdk_s=18c354bd18a-55a-ef2-aa%7C%7C905`;
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
