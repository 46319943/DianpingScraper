import os
import io
# Imports the Google Cloud client library
from google.cloud import vision
import shutil
import requests
import pymongo
from scrapy.selector import Selector
import numpy
import asyncio
import motor.motor_asyncio

# 设置请求证书
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = r'C:\Users\PiaoYang\Downloads\infinite-matter-290700-0b21d5224367.json'
os.environ['HTTP_PROXY'] = 'http://127.0.0.1:10809'
os.environ['HTTPS_PROXY'] = 'http://127.0.0.1:10809'


def detect_labels(path):
    client = vision.ImageAnnotatorClient()

    with io.open(path, 'rb') as image_file:
        content = image_file.read()

    image = vision.Image(content=content)

    response = client.label_detection(image=image)
    labels = response.label_annotations
    print('Labels:')

    for label in labels:
        print(label.description)

    if response.error.message:
        raise Exception(
            '{}\nFor more info on error messages, check: '
            'https://cloud.google.com/apis/design/errors'.format(
                response.error.message))


def detect_labels_uri(uri):
    client = vision.ImageAnnotatorClient()
    image = vision.Image()
    image.source.image_uri = uri

    response = client.label_detection(image=image)
    labels = response.label_annotations
    print('Labels:')

    for label in labels:
        print(label.description)

    if response.error.message:
        raise Exception(
            '{}\nFor more info on error messages, check: '
            'https://cloud.google.com/apis/design/errors'.format(
                response.error.message))


def detect_labels_download_uri(uri):
    response = requests.get(uri)

    client = vision.ImageAnnotatorClient()
    image = vision.Image(content=response.content)
    response = client.label_detection(image=image)
    labels = response.label_annotations
    print('Labels:')

    if response.error.message:
        raise Exception(
            '{}\nFor more info on error messages, check: '
            'https://cloud.google.com/apis/design/errors'.format(
                response.error.message))

    return labels


def get_dianping_imamge_src(url):
    headers = {
        'user-agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.89 Safari/537.36'}
    response = requests.get(url, headers=headers)
    selector = Selector(response)
    selector.css('.pic-wrap img').extract_first()

    pass


# mongo_client = pymongo.MongoClient("mongodb://admin:admin123@101.132.152.93:27017")

mongo_client = None
mongo_dianping_db = None
mongo_comment_dianping = None


async def dianping_image_process(task_num=20):
    global mongo_client, mongo_dianping_db, mongo_comment_dianping

    mongo_client = motor.motor_asyncio.AsyncIOMotorClient("mongodb://admin:admin123@101.132.152.93:27017")
    mongo_dianping_db = mongo_client["dianping"]
    mongo_comment_dianping = mongo_dianping_db['comment']

    comment_list_cursor = mongo_comment_dianping.find({'image_list': {'$exists': True}}, {'image_list': 1})
    comment_list = await comment_list_cursor.to_list(length=None)
    task_list = []
    for comment_task_input in numpy.random.choice(comment_list, task_num):
        task_list.append(dianping_comment_list_process(comment_task_input))
    await asyncio.gather(*task_list)


async def dianping_comment_list_process(comment_list):
    for comment in comment_list:
        for image_meta in comment['image_list']:
            label_result = detect_labels_download_uri(image_meta['src'])
            label_list = [
                {
                    'description': label_object.description,
                    'score': label_object.score
                }
                for label_object in label_result
            ]
            image_meta['label_list'] = label_list
        await mongo_comment_dianping.update_one({'_id': comment['_id']},
                                                {'$set': comment}
                                                )


asyncio.run(dianping_image_process())

# detect_labels_download_uri(
#     'https://qcloud.dpfile.com/pc/ezbY-f822sra-d1niS_KXHD5YFNL-l0Rwc5oXxbchXHE6k5QSHnK8Z3Dl8GWJDoIUBBCaBtJvKU_sxCtKYAYUQ.jpg')
# detect_labels(
#     r'C:\Users\PiaoYang\Desktop\ezbY-f822sra-d1niS_KXHD5YFNL-l0Rwc5oXxbchXGaYBAPVE6jc5e4Mli570xPjoJrvItByyS4HHaWdXyO_I7F0UeCRQYMHlogzbt7GHgNNiIYVnHvzugZCuBITtvjski7YaLlHpkrQUr5euoQrg.jpg')
# detect_labels_download_uri(
#     'https://qcloud.dpfile.com/pc/rG04Yq3VbhiroCe_o8dWxuKIhA302nilxcuWzEqwBbW6JiQlbqQpUyyMGFQHT6mRjoJrvItByyS4HHaWdXyO_I7F0UeCRQYMHlogzbt7GHgNNiIYVnHvzugZCuBITtvjski7YaLlHpkrQUr5euoQrg.jpg')
# detect_labels(
#     r'C:\Users\PiaoYang\Desktop\rG04Yq3VbhiroCe_o8dWxuKIhA302nilxcuWzEqwBbXj3BCsJw3apoGOxNj8GjSqjoJrvItByyS4HHaWdXyO_I7F0UeCRQYMHlogzbt7GHgNNiIYVnHvzugZCuBITtvjski7YaLlHpkrQUr5euoQrg.jpg')
