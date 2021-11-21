import os

os.environ['CUDA_VISIBLE_DEVICES'] = '0'

from mongodb import collection
from logger_manager import logger
from slab_nlp.sentiment import PaddleSkepSentiment

sentimentor = None


def calculate_text_sentiment(item):
    '''
    计算所有文本整体情感
    :param item:
    :return:
    '''
    global sentimentor
    if sentimentor is None:
        sentimentor = PaddleSkepSentiment()

    text = item['text']
    sentiment_score = sentimentor.sentiment_text(text)
    item['text_sentiment_score'] = sentiment_score

    return item


def process_item(item):
    '''
    处理单个条目
    '''
    item = calculate_text_sentiment(item)

    return item


def iter_item(query=None):
    '''
    遍历所有条目
    '''
    fetch_field = []
    obsolete_field = []
    projection_field = {
        **{field: True for field in fetch_field},
        **{field: False for field in obsolete_field}
    }

    if query is None:
        query = {}

    query_result_list = list(collection.find(
        query,
        projection_field
    ))
    for item in query_result_list:
        item = process_item(item)
        collection.update_one(
            {'id': item['id']},
            {
                "$set": dict(item),
                '$unset': {field: '' for field in obsolete_field}
            },
            upsert=True
        )
        logger.info('process item ' + item['id'])


if __name__ == '__main__':
    iter_item(
        {'text_sentiment_score': {'$exists': False}}
    )
