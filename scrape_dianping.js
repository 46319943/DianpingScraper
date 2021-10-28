const puppeteer = require('puppeteer-extra')

const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const cookie = require('cookie');
const readline = require('readline');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios').default;
const mongo = require('./db/mongo')
const dayjs = require('dayjs');
const { user } = require('./db/mongo');


async function main() {

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: [
            '--start-maximized', // you can also use '--start-fullscreen'
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding'
        ],
        ignoreDefaultArgs: ['--enable-automation'],
    });

    // const browser = await puppeteer.launch({
    //     product: 'chrome',
    //     // executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    //     executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    //     headless: false,
    //     // ignoreDefaultArgs: ["--enable-automation"]
    // });

    const page = await browser.newPage();
    await page.setCookie(...parseCookie(
        `Hm_lvt_602b80cf8079ae6591966cc70a3940e7=1612156012; lgtoken=0a590ae94-2eac-4485-aafb-a6a296b5652d; dplet=5580a25a822c72a0fd84cf4bfaf2dec0; dper=db2cc5552c2370649b900e423a34ebf5f021b31549e49955fee455b3d869d3a965ce23b3fe8267f871fd7934ad77595680703eaebfffbd9851d4ebec62a8fdfa; ll=7fd06e815b796be3df069dec7836c3df; ua=dpuser_8925286360; ctu=e48dc820dbb5c36c649b9e4a6c19b95a65373169ae1d9b39314e0b594106edab; _lxsdk_cuid=1775bfce8c7c8-0527415135ca71-13e3563-1fa400-1775bfce8c7c8; _lxsdk=1775bfce8c7c8-0527415135ca71-13e3563-1fa400-1775bfce8c7c8; _hc.v=ed1851f5-757b-c45f-5d1e-ed7da6818c80.1612156038; Hm_lpvt_602b80cf8079ae6591966cc70a3940e7=1612156038; _lxsdk_s=1775bfce8c8-d-00c-edb%7C%7C143`
    ));

    // await page.setRequestInterception(true);
    // page.on('request', (request) => {
    //     if (request.resourceType() === 'image') {
    //         if (request.url().includes('img.meituan.net')) {
    //             request.abort();
    //         }
    //         else {


    //             request.continue();

    //         }
    //     }
    //     else request.continue();
    // });

    // await page.evaluateOnNewDocument(() => {
    //     Object.defineProperty(navigator, 'webdriver', {
    //         get: () => undefined
    //     })
    // }
    // )

    // await scrapeDianpingID(page, 'H2Q2A123LD7896JD', '武汉欢乐谷', '2019-06-01', 1, false, false)
    // await scrapeDianpingID(page, 'l4twNneJonrrRkFe', '黄鹤楼', '2019-06-01', 1, false, true)
    // await scrapeDianpingID(page, 'G5JIcZK8I0eTG56c', '武汉海昌极地海洋公园', '2019-06-01', 1)
    // await scrapeDianpingID(page, 'G72ThBsbTbQ6dckr', '东湖生态旅游风景区', '2019-06-01', 1)
    // await scrapeDianpingID(page, 'H7MaUL9AZzhfQzb2', '汉口江滩', '2019-06-01', 1)
    // await scrapeDianpingID(page, 'l3s5SqnLMa4dQHKt', '万达电影乐园', '2019-06-01', 1)
    // await scrapeDianpingID(page, 'l5hVlMSgFeXBSh7m', '中山公园', '2019-06-01', 1)
    // await scrapeDianpingID(page, 'G9JFLlejfHnYj0Ad', '武汉长江大桥', '2019-06-01', 1)
    // await scrapeDianpingID(page, 'GadvNzKDoVMzYdXr', '户部巷', '2019-06-01', 1)
    // await scrapeDianpingID(page, 'k3qnFDINnEoc0fTM', '中央文化区楚河汉街', '2019-06-01', 1)
    // await scrapeDianpingID(page, 'iumGREeKWtY3XakP', '知音号', '2019-06-01', 1)
    // await scrapeDianpingID(page, 'jUnafIn0y3IurrsI', '武汉木兰草原风景区', '2019-06-01', 1)
    // await scrapeDianpingID(page, 'EQWTzDm5b6Wq1unx', '昙华林', '2019-06-01', 1)
    // await scrapeDianpingID(page, 'l2rRqM0irigmO59c', '古德寺', '2019-06-01', 1)
    // await scrapeDianpingID(page, 'H6fnkEpFEJnPKCGa', '江汉路步行街', '2019-06-01', 1)


    // await scrapeDianpingID(page, 'k8A6XzEeOdNmFxao', '木兰天池风景区', '2019-06-01', 1)
    // await scrapeDianpingID(page, 'H8NTFE0xyhxFAUW5', '汉秀剧场', '2019-06-01', 1)
    // await scrapeDianpingID(page, 'l640mii2kGDjloaq', '归元禅寺', '2019-06-01', 1)
    // await scrapeDianpingID(page, 'H8rQEyKg4NWh4Ahh', '世界城光谷步行街', '2019-06-01', 1)
    // await scrapeDianpingID(page, 'k1KNud9nOzUvAEJG', '马鞍山森林公园', '2019-06-01', 1)
    // await scrapeDianpingID(page, 'k3o3J8FthqKg88cG', '晴川阁', '2019-06-01', 1)
    // await scrapeDianpingID(page, 'G7R5NvLdGdfyxh6W', '解放公园', '2019-06-01', 1)
    // await scrapeDianpingID(page, 'j55g97VxOglbFpxN', '东湖磨山景区', '2019-06-01', 1)
    // await scrapeDianpingID(page, 'l30hJGbkR8ozeCzZ', '锦里沟风景区', '2019-06-01', 1)
    // await scrapeDianpingID(page, 'k9Q3KOY7HhKkzqpm', '平和打包厂旧址', '2019-06-01', 1)
    // await scrapeDianpingID(page, 'k2Sz5c9iGIoB9Slw', '东湖绿道', '2019-06-01', 1)
    // await scrapeDianpingID(page, 'k9bFCvvMao9oONiE', '东湖落雁景区', '2019-06-01', 1)
    // await scrapeDianpingID(page, 'EklVGGlETTojvhM0', '黎黄陂路', '2019-06-01', 1)
    // await scrapeDianpingID(page, 'l2WveSurYIPdfDSH', '武汉两江游览', '2019-06-01', 1)
    // await scrapeDianpingID(page, 'H3giacbM7CvLKlD2', '汉阳造文化创意产业园', '2019-06-01', 1)

    // await scrapeDianpingID(page, 'G4hrsxRxxzsAKi6o', '光谷广场', '2019-06-01', 1)
    // await scrapeDianpingID(page, 'l6sJK4FiykGlWSi1', '武汉大学樱园', '2019-06-01', 1)
    // await scrapeDianpingID(page, 'l2sQLWFHC4msHcni', '江汉关博物馆  ', '2019-06-01', 1)
    // await scrapeDianpingID(page, 'G2o24UGaa9kYwfMw', '木兰云雾山', '2019-06-01', 1)
    // await scrapeDianpingID(page, 'l5hzJYkfijTGCpnK', '木兰清凉寨旅游风景区', '2019-06-01', 1)
    // await scrapeDianpingID(page, 'l8r3YVoSkHgYqVHN', '沙湖公园', '2019-06-01', 1)
    // await scrapeDianpingID(page, 'l1kyMWuY2RYl0KHP', '光谷德国风情街', '2019-06-01', 1)
    // await scrapeDianpingID(page, 'kaYiy1cMkWhbuS3f', '意大利风情街', '2019-06-01', 1)
    // await scrapeDianpingID(page, 'EdThcl28xyAvSh8e', '盘龙城国家考古遗址公园', '2019-06-01', 1)
    await scrapeDianpingID(page, 'k9U7srosHqHEeAAW', '东湖听涛景区', '2019-06-01', 1)
    await scrapeDianpingID(page, 'G7q9cg3kdIaJbAn7', '后官湖国家湿地公园', '2019-06-01', 1)
    await scrapeDianpingID(page, 'FZSJJ4k6xUeQLWha', '武汉紫薇都市田园', '2019-06-01', 1)
    await scrapeDianpingID(page, 'k3ksYMy4VmGIvYZ7', '武昌江滩', '2019-06-01', 1)
    await scrapeDianpingID(page, 'l9zmX0zybNGWIP9Y', '万国公园', '2019-06-01', 1)
    await scrapeDianpingID(page, 'EnfNDnhAJHbD81XU', '东湖磨山欢乐丛林', '2019-06-01', 1)



    // await parseUserPage(page, `http://www.dianping.com/member/1281028058`);
    // await scrapeDianpingUserInDB();

    await browser.close();
    await (await mongo.client).close();
    return 0;
}

/**
 * 
 * @param {*} dianping_id 
 * @param {*} dianping_name 
 * @param {string} time_limit 截止时间字符串
 * @param {*} page_index 
 */
async function scrapeDianpingID(page, dianping_id, dianping_name, time_limit, page_index = 1, overwrite = false, picture_supply = false) {
    while (
        await parseCommentListPage(page,
            `http://www.dianping.com/shop/${dianping_id}/review_all/p${page_index}?queryType=sortType&queryVal=latest`,
            dianping_id,
            dianping_name,
            time_limit,
            overwrite,
            picture_supply
        )
    ) {
        page_index++;
    }
}


async function pageGoto(page, url) {
    // 访问超时循环
    while (true) {
        try {
            await page.goto(url, { timeout: 45000 });
            break;
        } catch (error) {
            console.log('time out error occur')
            continue;
        }
    }
}

/**
 * @param {import('puppeteer').Page} page 
 * @param {string} url
 * @param {string} dianping_id 大众点评的景点ID
 * @param {string} dianping_name 大众点评的景点名称
 * 
 * @returns {Boolean} 是否继续爬取
 */
async function parseCommentListPage(page, url, dianping_id, dianping_name, time_limit, overwrite = false, only_picture_supply = false) {
    await pageGoto(page, url);

    // 获取评论列表的各个评论元素
    let reviewList = await page.$$('.reviews-items > ul > li');

    // 获取失败，需要验证
    while (reviewList.length == 0) {
        console.log(`当前页面：${url}`);
        await askQuestion('手动打开谷歌浏览器进行验证，回车继续');
        await pageGoto(page, url);
        reviewList = await page.$$('.reviews-items > ul > li');
    }

    // 滑动至底部，加载图片
    // 直接获取绑定图片，不需要加载图片
    // await page.evaluate(scrollToBottom);

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

                // 展开长文本
                let truncatedWordsElement = reviewElement.querySelector('.review-truncated-words');
                if (truncatedWordsElement) {

                    // 折叠省略版评论
                    truncatedWordsElement.classList.add('Hide');

                    // 展开全部评论，删除收起按钮
                    let wordsClassList = reviewElement.querySelector('.review-words').classList;
                    if (wordsClassList.contains('Hide')) {
                        wordsClassList.remove('Hide');
                    }
                    reviewElement.querySelector('.less-words').remove();

                }

                // 用户链接、名称、ID
                resultObject['user_name'] = reviewElement.querySelector('.dper-info a').innerText;
                // 匿名用户处理
                let userUrlSuffix = reviewElement.querySelector(':scope > a').getAttribute('href');
                if (userUrlSuffix) {
                    resultObject['user_url'] = 'http://www.dianping.com' + reviewElement.querySelector(':scope > a').getAttribute('href');
                    resultObject['user_id'] = resultObject['user_url'].match(/member\/(\d+)/)[1];
                }

                // 遍历Class获取评分
                for (const className of reviewElement.querySelector('.review-rank span').classList) {
                    if (className.includes('sml-str')) {
                        let intString = className.replace('sml-str', '');
                        resultObject['rank'] = parseInt(intString);
                    }
                }

                // 获取所有图片的详细地址和缩略地址
                resultObject['image_list'] = [];
                // let reviewImageElement = reviewElement.querySelector('.review-pictures');
                // if (reviewImageElement) {
                //     reviewImageElement.scrollIntoView();
                // }
                let reviewImageElementList = reviewElement.querySelectorAll('.review-pictures li');
                for (const reviewImageElement of reviewImageElementList) {
                    let imageResult = {};
                    imageResult['url'] = reviewImageElement.querySelector('a').href;
                    // 不要获取图片懒加载的src，直接获取绑定的相关属性
                    imageResult['src'] = reviewImageElement.querySelector('img').getAttribute('data-lazyload');
                    imageResult['big'] = reviewImageElement.querySelector('img').getAttribute('data-big');
                    resultObject['image_list'].push(imageResult);
                }

                // 获取所有表情，记录并替换
                resultObject['emoji_image_map'] = {};
                let reviewEmojiElementList = reviewElement.querySelectorAll('.emoji-img');
                for (const reviewEmojiElement of reviewEmojiElementList) {
                    if (reviewEmojiElement.src in resultObject['emoji_image_map']) {
                        resultObject['emoji_image_map'][reviewEmojiElement.src] += 1;
                    } else {
                        resultObject['emoji_image_map'][reviewEmojiElement.src] = 1;
                    }
                    let textNode = document.createTextNode('，');
                    reviewEmojiElement.parentNode.replaceChild(textNode, reviewEmojiElement);
                }

                // 获取发布时间、评论链接、ID
                resultObject['time'] = reviewElement.querySelector('.time').innerText;
                resultObject['url'] = reviewElement.querySelector('.actions').querySelectorAll('a')[1].href;
                resultObject['id'] = resultObject['url'].match(/review\/(\d+)/)[1]

                // 处理空格、换行
                let reviewWordsElement = reviewElement.querySelector('.review-words');
                for (let childNode of reviewWordsElement.childNodes) {
                    // 判断是否为文本节点
                    if (childNode.nodeType == Node.TEXT_NODE) {
                        // 如果是第一个节点，去左边空格、换行
                        if (childNode == reviewWordsElement.firstChild) {
                            childNode.textContent = childNode.textContent.trimLeft();
                        }
                        // 如果是最后一个节点，去右边空格、换行。
                        // 实际中发现，最后一个节点可能是空的文本节点，由此需要考虑倒数第二个
                        if (childNode == reviewWordsElement.lastChild ||
                            childNode == reviewWordsElement.childNodes[reviewWordsElement.childNodes.length - 2]) {
                            childNode.textContent = childNode.textContent.trimRight();
                        }
                        // 替换换行为句号，空格为逗号
                        childNode.textContent = childNode.textContent.replaceAll(/ *\n+ */g, '。');
                        childNode.textContent = childNode.textContent.replaceAll(/ +/g, '，');
                    }
                }

                return resultObject;
            });

        // 仅对已有评论的大图的补充
        if (only_picture_supply) {
            let existQueryResult = await (await mongo.comment).findOne({ id: resultObject['id'] });
            if (!existQueryResult) {
                continue;
            }
            // 更新大图
            let updateMongoResult = await (await mongo.comment).updateOne(
                { id: resultObject['id'] },
                {
                    $set: {
                        'image_list': resultObject['image_list']
                    }
                },
                { upsert: true });
            continue;

        }

        // 判断是否已经存在
        if (!overwrite) {
            let existQueryResult = await (await mongo.comment).findOne(
                { id: resultObject['id'] },
                {
                    projection: {
                        'id': 1,
                        // 'image_list': 1
                    }
                }
            );
            if (existQueryResult) {
                // 更新大图
                let updateMongoResult = await (await mongo.comment).updateOne(
                    { id: resultObject['id'] },
                    {
                        $set: {
                            'image_list': resultObject['image_list']
                        }
                    },
                    { upsert: true });
                continue;
            }
        }

        // 截图文字图片
        let reviewWordsElement = await reviewItem.$('.review-words');
        let screenshotResult = await reviewWordsElement.screenshot({
            path: `Screenshot/${resultObject['id']}.png`,
        });

        // 请求OCR服务
        const formData = new FormData();
        formData.append('img', fs.createReadStream(`Screenshot/${resultObject['id']}.png`));
        const res = await axios.post('http://localhost:8890/', formData, {
            // You need to use `getHeaders()` in Node.js because Axios doesn't
            // automatically set the multipart form boundary in Node.
            headers: formData.getHeaders()
        });
        resultObject['text'] = res.data;

        // 记录爬取时间戳
        resultObject['scrape_timestamp'] = dayjs().valueOf()
        resultObject['scrape_date'] = dayjs().format('YYYY-MM-DD HH:mm:ss');

        // 解析时间
        if (resultObject['time'].includes('更新于')) {
            [resultObject['first_time'], resultObject['time']] = resultObject['time'].split('更新于');
            resultObject['first_time'] = resultObject['first_time'].trim();
        }
        else {
            resultObject['timestamp'] = dayjs(resultObject['time'], 'YYYY-MM-DD HH:mm').valueOf();
        }

        // 添加景点属性
        resultObject['dianping_id'] = dianping_id;
        resultObject['dianping_name'] = dianping_name;

        // 根据时间判断是否需要继续爬取
        if (resultObject['time'] < time_limit) {
            return false;
        }

        // 打印、存入数据库
        console.log(resultObject);
        let updateMongoResult = await (await mongo.comment).updateOne(
            { id: resultObject['id'] },
            { $set: resultObject },
            { upsert: true });

    }

    return true;
}

/**
 * 解析单独的评论页面
 * @param {import('puppeteer').Page} page 
 * @param {String} url 
 */
async function parseCommentPage(page, url) {
    await page.goto(url);
    let reviewItem = await page.$('.review-content');
    // TODO: 解析单评论抽离
    await reviewItem.evaluate();
}

/**
 * 爬取数据库中所有评论的用户信息
 */
async function scrapeDianpingUserInDB() {
    // 获取点评数据库中的用户列表并爬取
    let userUrlList = await commentUserList();

    // 获取所有已经爬取的用户列表
    let userListQueryResult = await (await mongo.user).find({}, { projection: { url: 1 } }).toArray();
    let userExistList = userListQueryResult.map(user => user['url']);
    for (const userUrl of userUrlList) {

        // 判断用户是否已存在数据库中
        // let userQueryResult = await (await mongo.user).findOne({ url: userUrl });
        // if (!userQueryResult) {

        // }

        // 遍历已经爬取的用户列表，判断是否已爬取
        // let hasUser = false;
        // for (userQuery of userListQueryResult) {
        //     if (userQuery['url'] == userUrl) {
        //         hasUser = true;
        //         break;
        //     }
        // }
        // if (hasUser) {
        //     continue;
        // }

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
    await page.goto(url);

    // 获取失败，需要验证
    while ((await page.title()) == '验证中心') {
        console.log(`当前页面：${url}`);
        await askQuestion('手动打开谷歌浏览器进行验证，回车继续');
        await page.goto(url);
    }


    let resultObject = await page.evaluate(
        async () => {
            let resultObject = {};

            // 名称
            resultObject['name'] = document.querySelector('h2.name').innerText;

            // 是否为VIP
            if (document.querySelector('.icon-vip')) {
                resultObject['is_vip'] = true;
            }
            else {
                resultObject['is_vip'] = false;
            }

            // 等级
            let rankElemnt = document.querySelector('.user-info .user-rank-rst')
            for (const className of rankElemnt.classList) {
                if (className.includes('urr-rank')) {
                    resultObject['rank'] = parseInt(className.replace('urr-rank', ''))
                }
            }

            // 性别
            if (document.querySelector('.woman')) {
                resultObject['gender'] = 'woman';
            }
            else if (document.querySelector('.man')) {
                resultObject['gender'] = 'man';
            }
            else {
                resultObject['gender'] = 'unknown';
            }

            // 城市
            resultObject['city'] = document.querySelector('.user-groun').innerText;

            // 注册时间
            resultObject['register_time'] = document.querySelectorAll('.user-time p')[1].innerText.replace('注册时间：', '');

            let attentionElementList = document.querySelectorAll('.user_atten li strong');
            for (let attentionElement of attentionElementList) {
                attentionElement.style.width = 'fit-content';
                attentionElement.style.lineHeight = 1;

                // 只包含一个矢量元素，则在最后面添加“个”字，提高OCR识别成功率。
                // 其实这里应该用子节点数量，而不是子元素数量。因为有的数字不会用矢量加密，而是直接是文本节点
                // 但是这样也没啥问题，可以就行
                // if (attentionElement.childElementCount < 2) {
                //     attentionElement.append('个')
                // }

                // 还是全部都加“个”更好。有的两个数字还是会被识别错
                attentionElement.append('个')
            }

            return resultObject;
        }
    );

    // 原始链接、ID
    resultObject['url'] = url;
    resultObject['id'] = resultObject['url'].match(/member\/(\d+)/)[1];

    // 记录爬取时间戳
    resultObject['scrape_timestamp'] = dayjs().valueOf()
    resultObject['scrape_date'] = dayjs().format('YYYY-MM-DD HH:mm:ss');

    // 解析注册时间
    resultObject['register_timestamp'] = dayjs(resultObject['register_time'], 'YYYY-MM-DD').valueOf();

    // 关注、粉丝、获赞OCR
    let attentionList = await scrapeAttentionInfo(page);
    resultObject['attention'] = attentionList[0];
    resultObject['fan'] = attentionList[1];
    resultObject['like'] = attentionList[2];

    // 打印、存入数据库
    console.log(resultObject);
    let updateMongoResult = await (await mongo.user).updateOne(
        { id: resultObject['id'] },
        { $set: resultObject },
        { upsert: true });

}

/**
 * 关注、粉丝、获赞OCR
 * @param {import('puppeteer').Page} page 
 */
async function scrapeAttentionInfo(page) {
    let resultList = [];
    let attentionElementList = await page.$$('.user_atten li strong');

    for (const attentionElement of attentionElementList) {
        let attentionScreenshot = await attentionElement.screenshot(
            { path: 'attention_test.png' }
        );
        // 请求OCR服务
        let formData = new FormData();
        formData.append('img', attentionScreenshot,
            // 必须添加文件名，才能被Flask框架识别为文件
            { contentType: 'image/png', filename: 'attention.png' }
        );
        let res = await axios.post('http://localhost:8890/rec', formData, {
            headers: formData.getHeaders()
        });
        resultList.push(res.data);
    }

    return resultList;
}


async function commentUserList() {
    // TODO: 匿名用户排除
    let commentUserResult = await (await mongo.comment)
        .find(
            {},
            { projection: { user_url: 1 } })
        .toArray();
    let userUrlList = [];
    for (let comment of commentUserResult) {
        userUrlList.push(comment['user_url']);
    }
    return userUrlList;
}


/**
 * 
 * @param {CommentObject} commentObject 
 */
async function insertOrUpdateComment(commentObject) {
    await (await mongo.comment).updateOne({ id: commentObject['id'] }, commentObject, { upsert: true });
}


/**
 * 浏览器窗口滚动至底部并延时两秒返回Resolved的Promise
 */
async function scrollToBottom() {
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    window.scrollTo({ left: 0, top: document.body.scrollHeight, behavior: 'smooth' });
    await sleep(2000);
}



/**
 * 
 * @param {HTMLLIElement} reviewElement 
 */
function parseReviewElement(reviewElement) {

}

/**
 * 将字符串解析为puppeteer输入格式
 * @param {*} cookieString 
 * @param {*} domain 
 */
function parseCookie(cookieString, domain = 'http://www.dianping.com') {
    let cookieObject = cookie.parse(cookieString);
    let cookieKeyValueList = Array();
    for (const key in cookieObject) {
        if (cookieObject.hasOwnProperty(key)) {
            const element = cookieObject[key];
            cookieKeyValueList.push({
                name: key,
                value: element,
                url: domain
            })
        }
    }
    return cookieKeyValueList;
}

/**
 * 异步获取输入
 * @param {string} query 
 */
function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}

/**
 * 使用ElementHandle类进行数据获取
 */
function elementHandleDemo() {
    // await reviewItem.$('a')
    //     .then(r => r.getProperty('href'))
    //     .then(r => r.jsonValue());
    // let userUrl = await (await reviewItem.$('a')).getProperty('href');
    // userUrl = await userUrl.jsonValue();
    // console.log(userUrl);
}


// 执行主异步函数
main()