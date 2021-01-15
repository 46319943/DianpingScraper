import requests
from fake_useragent import UserAgent
from requests.models import Response
from scrapy import Selector

ua = UserAgent()


def parseCookie(cookir_str: str):
    if '=' in cookir_str:
        cookies = {}
        for line in cookir_str.split(';'):
            key, value = line.strip().split('=', 1)
            cookies[key] = value
        return cookies


def request_to_text(r: Response):
    '''
    获取响应文本
    处理文本编码问题
    '''
    if r.encoding == 'ISO-8859-1':
        encodings = requests.utils.get_encodings_from_content(r.text)
        if encodings:
            encoding = encodings[0]
        else:
            encoding = r.apparent_encoding
        text = r.content.decode(
            encoding, 'replace')  # 如果设置为replace，则会用?取代非法字符；
    else:
        text = r.text
    return text


def main():
    session = requests.session()

    cookies = parseCookie(
        'cy=16; cye=wuhan; _lxsdk_cuid=1752f926175c8-0edb933f7896e1-b383f66-ff000-1752f926175c8; _lxsdk=1752f926175c8-0edb933f7896e1-b383f66-ff000-1752f926175c8; _hc.v=32e76b5a-4c47-0606-70bf-0d76e7f1360f.1602820924; s_ViewType=10; ctu=e48dc820dbb5c36c649b9e4a6c19b95ac18fc72b3e2ae6acd9ff0a488effdc8a; dplet=6fee0094d67494231daee707e6178acb; dper=54ec0dee28a740e375905d8b788db544e1efc593e0a362eabd3bbfbfc672069bf6ac270d22594623803e6d4fd2dcaf23426fd35a445719c6f4aa9627ced1a646ab1079ee041a338b9fbcbc24da8caaa9c77c2509651117ce75e438398608aaa5; ua=dpuser_8925286360; ll=7fd06e815b796be3df069dec7836c3df; Hm_lvt_602b80cf8079ae6591966cc70a3940e7=1603363891,1603372427,1603376068,1603515200; Hm_lpvt_602b80cf8079ae6591966cc70a3940e7=1603536464; _lxsdk_s=1755a381c42-168-25d-37%7C%7C177')
    requests.utils.add_dict_to_cookiejar(
        session.cookies, cookies)

    session.headers.update({'User-Agent': ua.chrome,
                            'Host': 'www.dianping.com'
                            })

    res = session.get(
        'http://www.dianping.com/shop/l4twNneJonrrRkFe/review_all/p4?queryType=sortType&queryVal=latest',
        headers={'Referer': 'http://www.dianping.com/shop/l4twNneJonrrRkFe/review_all/p4?queryType=sortType&queryVal=latest'}
    )

    text = request_to_text(res)
    selector = Selector(text=text)
    review_list = selector.xpath('*[@class="reviews-items"]//li').extract()


if __name__ == "__main__":
    main()
