import os
import io
from google.cloud import vision
import shutil
import requests
import pymongo
from scrapy.selector import Selector
import numpy
import threading
from logger_manager import logger

# 设置请求证书
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = r'C:\Users\PiaoYang\Desktop\windy-furnace-333407-9af42cd910cb.json'
os.environ['HTTP_PROXY'] = 'http://127.0.0.1:7890'
os.environ['HTTPS_PROXY'] = 'http://127.0.0.1:7890'

# 设置MongoDB。GoogleCloudVision的包不支持异步，就只能用多线程了
# 查了下其实是有异步的，但是当时查就没查到。算了，
mongo_client = pymongo.MongoClient("mongodb://localhost:27017")
mongo_db = mongo_client["dianping"]
collection = mongo_db['huanghelou']


def detect_labels_from_filepath(filepath):
    client = vision.ImageAnnotatorClient()
    with io.open(filepath, 'rb') as image_file:
        content = image_file.read()
    image = vision.Image(content=content)
    response = client.label_detection(image=image)
    return response


def detect_labels_from_url(url, retry=100):
    while retry > -1:
        retry -= 1
        try:
            image_response = requests.get(url)
            content = image_response.content

            image = vision.Image(content=content)
            client = vision.ImageAnnotatorClient()
            response = client.label_detection(image=image)
            labels = response.label_annotations

            if response.error.message:
                logger.debug(response.error.message)
                continue

            return labels
        except Exception or requests.exceptions.ProxyError as e:
            logger.exception(e)

    return


def item_list_process(item_list):
    for item in item_list:

        # 不存在图片则跳过
        if len(item['image_list']) == 0:
            continue

        for image in item['image_list']:
            # 如果标签信息已经被识别，跳过当前图片
            if 'label_list' in image:
                continue

            image_origin_url = image['origin']
            label_result = detect_labels_from_url(image_origin_url)

            label_list = [
                {
                    'description': label_object.description,
                    'score': label_object.score
                }
                for label_object in label_result
            ]
            image['label_list'] = label_list

        collection.update_one({'_id': item['_id']}, {'$set': item})
        logger.info(f'处理文档：{item["_id"]}，包含{len(item["image_list"])}张图片')


def image_tagging_process(task_num=20):
    item_list = collection.find({}, {'image_list': 1})
    item_list = list(item_list)

    task_thread_list = []
    for comment_task_input in numpy.array_split(item_list, task_num):
        task_thread = threading.Thread(target=item_list_process, args=(comment_task_input,))
        task_thread_list.append(task_thread)
        task_thread.start()

    for task_thread in task_thread_list:
        task_thread.join()


if __name__ == '__main__':
    image_tagging_process()
