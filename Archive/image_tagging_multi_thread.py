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
import threading
import logging

# 设置请求证书
# os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = r'C:\Users\PiaoYang\Downloads\infinite-matter-290700-0b21d5224367.json'
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = r'C:\Users\PiaoYang\Desktop\windy-furnace-333407-9af42cd910cb.json'
os.environ['HTTP_PROXY'] = 'http://127.0.0.1:7890'
os.environ['HTTPS_PROXY'] = 'http://127.0.0.1:7890'


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
    retry = 3
    while retry > 0:
        retry -= 1
        try:
            response = requests.get(uri)

            client = vision.ImageAnnotatorClient()

            content = response.content
            image = vision.Image(content=content)
            response = client.label_detection(image=image)
            labels = response.label_annotations

            if response.error.message:
                # raise Exception(
                #     '{}\nFor more info on error messages, check: '
                #     'https://cloud.google.com/apis/design/errors'.format(
                #         response.error.message))
                print(
                    '{}\nFor more info on error messages, check: '
                    'https://cloud.google.com/apis/design/errors'.format(
                        response.error.message)
                )
                continue
            break
        except requests.exceptions.ProxyError:
            logging.exception('请求错误')

    return labels


def get_dianping_imamge_src(url):
    headers = {
        'user-agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.89 Safari/537.36'}
    response = requests.get(url, headers=headers)
    selector = Selector(response)
    selector.css('.pic-wrap img').extract_first()

    pass


mongo_client = pymongo.MongoClient("mongodb://localhost:27017")
mongo_db = mongo_client["dianping"]
collection = mongo_db['comment']


def dianping_image_process(task_num=20):
    global mongo_client, mongo_db, collection

    mongo_client = motor.motor_asyncio.AsyncIOMotorClient("mongodb://admin:admin123@101.132.152.93:27017")

    comment_list = mongo_comment_dianping.find({'image_list': {'$exists': True}}, {'image_list': 1})
    comment_list = list(comment_list)
    task_thread_list = []
    for comment_task_input in numpy.array_split(numpy.array(comment_list), task_num):
        task_thread = threading.Thread(target=dianping_comment_list_process, args=(comment_task_input,))
        task_thread_list.append(task_thread)
        task_thread.start()

    for task_thread in task_thread_list:
        task_thread.join()


def dianping_comment_list_process(comment_list):
    for comment in comment_list:

        skip = False

        if len(comment['image_list']) == 0:
            skip = True

        for image_meta in comment['image_list']:

            if 'label_list' in image_meta:
                # print(f'文档{comment["_id"]}存在标签，跳过')
                skip = True
                break

            if image_meta['src'] == '':
                image_meta['label_list'] = []
                continue

            label_result = detect_labels_download_uri(image_meta['src'])
            label_list = [
                {
                    'description': label_object.description,
                    'score': label_object.score
                }
                for label_object in label_result
            ]
            image_meta['label_list'] = label_list

        if not skip:
            collection.update_one({'_id': comment['_id']}, {'$set': comment})
            print(f'处理文档：{comment["_id"]}，包含{len(comment["image_list"])}张图片')


def dianping_image_process_single(task_num=20):
    global mongo_client, mongo_db, collection

    mongo_client = motor.motor_asyncio.AsyncIOMotorClient("mongodb://admin:admin123@101.132.152.93:27017")

    comment_list = mongo_comment_dianping.find(
        {
            '$and': [
                {'image_list': {'$exists': True}},
                {'label_single': {'$exists': False}}
            ]
        }
        , {'image_list': 1, 'label_single': 1})
    comment_list = list(comment_list)
    task_thread_list = []
    for comment_task_input in numpy.array_split(numpy.array(comment_list), task_num):
        task_thread = threading.Thread(target=dianping_comment_list_process_single, args=(comment_task_input,))
        task_thread_list.append(task_thread)
        task_thread.start()

    for task_thread in task_thread_list:
        task_thread.join()


def dianping_comment_list_process_single(comment_list):
    '''
    只处理一个评论中的一张图片
    '''
    count = 0
    for comment in comment_list:
        count += 1

        # 注意在MongoDB查询的Projection中也需要设置显示该字段
        if 'label_single' in comment:
            continue

        if len(comment['image_list']) == 0:
            continue

        image_meta = numpy.random.choice(comment['image_list'], 1)[0]

        if image_meta['src'] == '':
            comment['label_single'] = []
        elif 'label_list' in image_meta:
            comment['label_single'] = image_meta['label_list']
        else:
            label_result = detect_labels_download_uri(image_meta['src'])
            label_list = [
                {
                    'description': label_object.description,
                    'score': label_object.score
                }
                for label_object in label_result
            ]
            comment['label_single'] = label_list

        collection.update_one({'_id': comment['_id']}, {'$set': comment})
        print(f'处理文档：{comment["_id"]}，{count}/{len(comment_list)}')


def dianping_image_process_origin(task_num=20):
    global mongo_client, mongo_db, collection

    mongo_client = motor.motor_asyncio.AsyncIOMotorClient("mongodb://localhost:27017")

    comment_list = mongo_comment_dianping.find(
        {
            '$and': [
                {'image_list': {'$exists': True}},
                # {'label_origin': {'$exists': False}},
                {'label_origin_url': {'$exists': False}},
                # {'dianping_name': '黄鹤楼'}
            ]
        }
        , {'image_list': 1, 'label_origin': 1, 'label_origin_url': 1})
    comment_list = list(comment_list)
    task_thread_list = []
    for comment_task_input in numpy.array_split(numpy.array(comment_list), task_num):
        task_thread = threading.Thread(target=dianping_comment_list_process_origin, args=(comment_task_input,))
        task_thread_list.append(task_thread)
        task_thread.start()

    for task_thread in task_thread_list:
        task_thread.join()

    print()


def dianping_comment_list_process_origin(comment_list):
    '''
    只处理一个评论中的一张图片
    '''
    count = 0
    for comment in comment_list:
        count += 1

        # 注意在MongoDB查询的Projection中也需要设置显示该字段
        if 'label_origin' in comment and 'label_origin_url' in comment:
            continue
            pass

        if len(comment['image_list']) == 0:
            continue

        # 随机从照片列表中取一张图片
        image_meta_index = numpy.random.choice(len(comment['image_list']), 1)[0]
        image_meta = comment['image_list'][image_meta_index]

        if 'big' not in image_meta:
            comment['label_origin'] = []
            comment['label_origin_url'] = ''
        elif image_meta['big'] == '':
            comment['label_origin'] = []
            comment['label_origin_url'] = ''
        elif 'label_origin' in image_meta:
            comment['label_origin'] = image_meta['label_origin']
            comment['label_origin_url'] = image_meta['big']
        else:
            label_result = detect_labels_download_uri(image_meta['big'])
            label_list = [
                {
                    'description': label_object.description,
                    'score': label_object.score
                }
                for label_object in label_result
            ]

            # 将标签结果存入图片元数据
            image_meta['label_origin'] = label_list

            # 同时将标签结果和对应原图URL存入评论
            comment['label_origin'] = label_list
            comment['label_origin_url'] = image_meta['big']

        collection.update_one({'_id': comment['_id']}, {'$set': comment})
        print(f'处理文档：{comment["_id"]}，{count}/{len(comment_list)}')


dianping_image_process_origin()

# detect_labels_download_uri(
#     'https://qcloud.dpfile.com/pc/ezbY-f822sra-d1niS_KXHD5YFNL-l0Rwc5oXxbchXHE6k5QSHnK8Z3Dl8GWJDoIUBBCaBtJvKU_sxCtKYAYUQ.jpg')
# detect_labels(
#     r'C:\Users\PiaoYang\Desktop\ezbY-f822sra-d1niS_KXHD5YFNL-l0Rwc5oXxbchXGaYBAPVE6jc5e4Mli570xPjoJrvItByyS4HHaWdXyO_I7F0UeCRQYMHlogzbt7GHgNNiIYVnHvzugZCuBITtvjski7YaLlHpkrQUr5euoQrg.jpg')
# detect_labels_download_uri(
#     'https://qcloud.dpfile.com/pc/rG04Yq3VbhiroCe_o8dWxuKIhA302nilxcuWzEqwBbW6JiQlbqQpUyyMGFQHT6mRjoJrvItByyS4HHaWdXyO_I7F0UeCRQYMHlogzbt7GHgNNiIYVnHvzugZCuBITtvjski7YaLlHpkrQUr5euoQrg.jpg')
# detect_labels(
#     r'C:\Users\PiaoYang\Desktop\rG04Yq3VbhiroCe_o8dWxuKIhA302nilxcuWzEqwBbXj3BCsJw3apoGOxNj8GjSqjoJrvItByyS4HHaWdXyO_I7F0UeCRQYMHlogzbt7GHgNNiIYVnHvzugZCuBITtvjski7YaLlHpkrQUr5euoQrg.jpg')
