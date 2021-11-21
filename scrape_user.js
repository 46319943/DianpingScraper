const FormData = require("form-data");
const axios = require("axios").default;
const mongo = require("./db/mongo");
const dayjs = require("dayjs");

const { scrape_time } = require("./scrape_utils");
const { pageGotoVerify } = require("./puppeteer_utils");

/**
 * @param {import('puppeteer').Page} page
 * 爬取数据库中所有评论的用户信息
 */
async function scrapeDianpingUserInDB(page) {
  // 获取点评数据库中的用户列表并爬取
  let userUrlList = await commentUserList();

  // 获取所有已经爬取的用户列表
  let userListQueryResult = await (await mongo.user)
    .find({}, { projection: { url: 1 } })
    .toArray();
  let userExistList = userListQueryResult.map((user) => user["url"]);
  for (const userUrl of userUrlList) {
    if (userExistList.includes(userUrl)) {
      continue;
    }
    await parseUserPage(page, userUrl);
  }
}

/**
 * 解析用户页面
 * @param {import('puppeteer').Page} page
 * @param {String} url
 */
async function parseUserPage(page, url) {
  await pageGotoVerify(page, url);

  let resultObject = await page
    .evaluate(async () => {
      let resultObject = {};

      // 原始HTML文本
      resultObject["html"] = document.querySelector("*").outerHTML;

      // 名称
      resultObject["name"] = document.querySelector("h2.name").innerText;

      // 是否为VIP
      if (document.querySelector(".icon-vip")) {
        resultObject["is_vip"] = true;
      } else {
        resultObject["is_vip"] = false;
      }

      // 等级
      let rankElemnt = document.querySelector(".user-info .user-rank-rst");
      for (const className of rankElemnt.classList) {
        if (className.includes("urr-rank")) {
          resultObject["rank"] = parseInt(className.replace("urr-rank", ""));
        }
      }

      // 性别
      if (document.querySelector(".woman")) {
        resultObject["gender"] = "woman";
      } else if (document.querySelector(".man")) {
        resultObject["gender"] = "man";
      } else {
        resultObject["gender"] = "unknown";
      }

      // 城市
      resultObject["city"] = document.querySelector(".user-groun").innerText;

      // 注册时间
      resultObject["register_time"] = document
        .querySelector(".user-time")
        .innerText.replace("注册时间：", "");

      let attentionElementList = document.querySelectorAll(
        ".user_atten li strong"
      );
      for (let attentionElement of attentionElementList) {
        attentionElement.style.width = "fit-content";
        attentionElement.style.lineHeight = 1;

        // 只包含一个矢量元素，则在最后面添加“个”字，提高OCR识别成功率。
        // 其实这里应该用子节点数量，而不是子元素数量。因为有的数字不会用矢量加密，而是直接是文本节点
        // 但是这样也没啥问题，可以就行
        // if (attentionElement.childElementCount < 2) {
        //     attentionElement.append('个')
        // }

        // 还是全部都加“个”更好。有的两个数字还是会被识别错
        attentionElement.append("个");
      }

      return resultObject;
    })
    .catch(async (reason) => {
      let pageContent = await page.content();
      console.log(reason);
    });

  // 原始链接、ID
  resultObject["url"] = url;
  resultObject["id"] = resultObject["url"].match(/member\/(\d+)/)[1];

  // 记录爬取时间、戳
  resultObject = scrape_time(resultObject);

  // 解析注册时间
  resultObject["register_timestamp"] = dayjs(
    resultObject["register_time"],
    "YYYY-MM-DD"
  ).valueOf();

  // 关注、粉丝、获赞OCR
  let attentionList = await scrapeAttentionInfo(page);
  resultObject["attention"] = attentionList[0];
  resultObject["fan"] = attentionList[1];
  resultObject["like"] = attentionList[2];

  // 打印、存入数据库
  console.log(resultObject);
  let updateMongoResult = await (
    await mongo.user
  ).updateOne(
    { id: resultObject["id"] },
    { $set: resultObject },
    { upsert: true }
  );
}

/**
 * 关注、粉丝、获赞OCR
 * @param {import('puppeteer').Page} page
 */
async function scrapeAttentionInfo(page) {
  let resultList = [];
  let attentionElementList = await page.$$(".user_atten li strong");

  for (const attentionElement of attentionElementList) {
    let attentionScreenshot = await attentionElement.screenshot({
      path: "attention_temp.png",
    });
    // 请求OCR服务
    let formData = new FormData();
    formData.append(
      "img",
      attentionScreenshot,
      // 必须添加文件名，才能被Flask框架识别为文件
      { contentType: "image/png", filename: "attention.png" }
    );
    let res = await axios.post("http://localhost:8890/rec", formData, {
      headers: formData.getHeaders(),
    });
    resultList.push(res.data);
  }

  return resultList;
}

async function commentUserList() {
  // TODO: 匿名用户排除
  let commentUserResult = await (await mongo.huanghelou)
    .find({}, { projection: { user_url: 1 } })
    .toArray();
  let userUrlList = [];
  for (let comment of commentUserResult) {
    let user_url = comment["user_url"];
    if (user_url) {
      userUrlList.push(comment["user_url"]);
    }
  }
  return userUrlList;
}

module.exports = {
  scrapeDianpingUserInDB,
  parseUserPage,
  scrapeAttentionInfo,
  commentUserList,
};
