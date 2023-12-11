const fs = require("fs");
const FormData = require("form-data");
const axios = require("axios").default;
const mongo = require("./db/mongo");
const dayjs = require("dayjs");

const { pageGotoVerify } = require("./puppeteer_utils");
const { scrape_time } = require("./scrape_utils");
const { dianping } = require("./db/mongo");

/**
 * 爬取大众点评某一景点评论
 *
 * @param {puppeteer.Page} page
 * @param {*} dianping_id
 * @param {*} dianping_name
 * @param {string} time_limit 截止时间字符串
 * @param {*} page_index
 */
async function scrapeComment(
  page,
  dianping_id,
  dianping_name,
  { time_limit = null, page_index = 1, overwrite = false } = {}
) {
  while (
    await scrapeCommentListPage(
      page,
      page_index,
      dianping_id,
      dianping_name,
      time_limit,
      overwrite
    )
  ) {
    page_index++;
    // Wait for 1s to avoid being blocked
    await page.waitForTimeout(3000);
  }
}

/**
 * @param {import('puppeteer').Page} page
 * @param {string} page_index
 * @param {string} dianping_id 大众点评的景点ID
 * @param {string} dianping_name 大众点评的景点名称
 *
 * @returns {Boolean} 是否继续爬取
 */
async function scrapeCommentListPage(
  page,
  page_index,
  dianping_id,
  dianping_name,
  time_limit = null,
  overwrite = false
) {
  let url = `http://www.dianping.com/shop/${dianping_id}/review_all/p${page_index}?queryType=sortType&queryVal=latest`;
  await pageGotoVerify(page, url);

  // 获取评论列表的各个评论元素。
  let reviewList = await page.$$(".reviews-items > ul > li");

  // 有时候会返回空页面
  if (reviewList.length == 0) {
    let pageContent = await page.content();
    debugger;
    console.log("爬取完成");
  }

  for (const reviewItem of reviewList) {
    // 对每个评论元素，在浏览器环境中进行属性值获取
    let resultObject = await reviewItem.evaluate(
      /**
       * @param {HTMLLIElement} reviewElement
       */
      async (reviewElement) => {
        // 创建保存结果的对象
        // /** @type {CommentObject} */
        // let resultObject = new Object();
        let resultObject = {};

        // 保存原始HTML
        resultObject["html"] = reviewElement.outerHTML;

        // 展开长文本
        let truncatedWordsElement = reviewElement.querySelector(
          ".review-truncated-words"
        );
        if (truncatedWordsElement) {
          // 折叠省略版评论
          truncatedWordsElement.classList.add("Hide");

          // 展开全部评论，删除收起按钮
          let wordsClassList =
            reviewElement.querySelector(".review-words").classList;
          if (wordsClassList.contains("Hide")) {
            wordsClassList.remove("Hide");
          }
          reviewElement.querySelector(".less-words").remove();
        }

        // 用户链接、名称、ID
        resultObject["user_name"] =
          reviewElement.querySelector(".dper-info a").innerText;
        // 匿名用户处理
        let userUrlSuffix = reviewElement
          .querySelector(":scope > a")
          .getAttribute("href");
        if (userUrlSuffix) {
          resultObject["user_url"] =
            "http://www.dianping.com" +
            reviewElement.querySelector(":scope > a").getAttribute("href");
          resultObject["user_id"] =
            resultObject["user_url"].match(/member\/(\d+)/)[1];
        }

        // 遍历Class获取评分。2009年10月及之前的评论没有评分，需要判断
        if (reviewElement.querySelector(".review-rank span")) {
          for (const className of reviewElement.querySelector(
            ".review-rank span"
          ).classList) {
            if (className.includes("sml-str")) {
              let intString = className.replace("sml-str", "");
              resultObject["rank"] = parseInt(intString);
            }
          }
        }

        // 直接获取绑定图片，不需要加载图片
        // 获取所有图片的详细地址和缩略地址
        resultObject["image_list"] = [];
        let reviewImageElementList = reviewElement.querySelectorAll(
          ".review-pictures li"
        );
        for (const reviewImageElement of reviewImageElementList) {
          let imageResult = {};
          imageResult["url"] = reviewImageElement.querySelector("a").href;
          // 不要获取图片懒加载的src，直接获取绑定的相关属性

          // src -> thumbnail
          imageResult["thumbnail"] = reviewImageElement
            .querySelector("img")
            .getAttribute("data-lazyload");
          // big -> origin
          imageResult["origin"] = reviewImageElement
            .querySelector("img")
            .getAttribute("data-big");
          resultObject["image_list"].push(imageResult);
        }

        // 获取所有表情，记录并替换为逗号
        resultObject["emoji_image_map"] = {};
        let reviewEmojiElementList =
          reviewElement.querySelectorAll(".emoji-img");
        for (const reviewEmojiElement of reviewEmojiElementList) {
          if (reviewEmojiElement.src in resultObject["emoji_image_map"]) {
            resultObject["emoji_image_map"][reviewEmojiElement.src] += 1;
          } else {
            resultObject["emoji_image_map"][reviewEmojiElement.src] = 1;
          }
          let textNode = document.createTextNode("，");
          reviewEmojiElement.parentNode.replaceChild(
            textNode,
            reviewEmojiElement
          );
        }

        // 获取发布时间、评论链接、ID
        resultObject["publish_time"] =
          reviewElement.querySelector(".time").innerText;
        resultObject["url"] = reviewElement
          .querySelector(".actions")
          .querySelectorAll("a")[1].href;
        resultObject["id"] = resultObject["url"].match(/review\/(\d+)/)[1];

        // 处理空格、换行，替换为逗号和句号
        let reviewWordsElement = reviewElement.querySelector(".review-words");
        for (let childNode of reviewWordsElement.childNodes) {
          // 判断是否为文本节点
          if (childNode.nodeType == Node.TEXT_NODE) {
            // 如果是第一个节点，去左边空格、换行
            if (childNode == reviewWordsElement.firstChild) {
              childNode.textContent = childNode.textContent.trimLeft();
            }
            // 如果是最后一个节点，去右边空格、换行。
            // 实际中发现，最后一个节点可能是空的文本节点，由此需要考虑倒数第二个
            if (
              childNode == reviewWordsElement.lastChild ||
              childNode ==
                reviewWordsElement.childNodes[
                  reviewWordsElement.childNodes.length - 2
                ]
            ) {
              childNode.textContent = childNode.textContent.trimRight();
            }
            // 替换换行为句号，空格为逗号
            childNode.textContent = childNode.textContent.replaceAll(
              / *\n+ */g,
              "。"
            );
            childNode.textContent = childNode.textContent.replaceAll(
              / +/g,
              "，"
            );
          }
        }

        return resultObject;
      }
    );

    // 是否重新进行文本识别并覆盖
    if (!overwrite) {
      // 判断是否已经存在
      let existQueryResult = await (await dianping)
        .collection(dianping_name)
        .findOne(
          { id: resultObject["id"] },
          {
            projection: {
              id: 1,
              // 'image_list': 1
            },
          }
        );
      if (existQueryResult) {
        continue;
      }
    }

    // 截图文字图片
    // Puppeteer BUG: 截图偏移
    let reviewWordsElement = await reviewItem.$(".review-words");
    let screenshotResult = await reviewWordsElement.screenshot({
      path: `Screenshot/${resultObject["id"]}.png`,
    });

    // 请求OCR服务
    const formData = new FormData();
    formData.append(
      "img",
      fs.createReadStream(`Screenshot/${resultObject["id"]}.png`)
    );
    const res = await axios.post("http://127.0.0.1:5001/", formData, {
      // You need to use `getHeaders()` in Node.js because Axios doesn't
      // automatically set the multipart form boundary in Node.
      headers: formData.getHeaders(),
    });
    resultObject["text"] = res.data;

    // 记录爬取时间（时间字符串、时间戳）
    resultObject = scrape_time(resultObject);

    // 解析时间
    if (resultObject["publish_time"].includes("更新于")) {
      [resultObject["first_time"], resultObject["publish_time"]] =
        resultObject["publish_time"].split("更新于");
      resultObject["first_time"] = resultObject["first_time"].trim();
      resultObject["first_timestamp"] = dayjs(
        resultObject["publish_time"],
        "YYYY-MM-DD"
      ).valueOf();
    }
    resultObject["publish_timestamp"] = dayjs(
      resultObject["publish_time"],
      "YYYY-MM-DD HH:mm"
    ).valueOf();

    // 添加景点属性
    resultObject["dianping_id"] = dianping_id;
    resultObject["dianping_name"] = dianping_name;

    // 根据时间判断是否需要继续爬取
    if (time_limit != null && resultObject["publish_time"] < time_limit) {
      return false;
    }

    // 打印、存入数据库
    console.log(resultObject);
    let updateMongoResult = await (await dianping)
      .collection(dianping_name)
      .updateOne(
        { id: resultObject["id"] },
        { $set: resultObject },
        { upsert: true }
      );
  }

  return true;
}

/**
 * 解析单独的评论页面
 * @param {import('puppeteer').Page} page
 * @param {String} url
 */
async function parseCommentPage(page, url) {
  // TODO
}

module.exports = {
  scrapeComment,
  scrapeCommentListPage,
  parseCommentPage,
};
