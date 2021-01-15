import paddlehub as hub
import os
import paddle

# 显存不足，无法使用GPU版本
# os.environ["CUDA_VISIBLE_DEVICES"] = "0"

# Load ernie_skep_sentiment_analysis module.
module = hub.Module(name="ernie_skep_sentiment_analysis")
# module = hub.Module(name="senta_bilstm")

import pymongo

mongo_client = pymongo.MongoClient("mongodb://admin:admin123@101.132.152.93:27017")
mongo_dianping_db = mongo_client["dianping"]
mongo_comment_dianping = mongo_dianping_db['comment']


def sentiment_batch():
    comment_cache_list = []
    text_batch_size = 100
    for comment_cache in mongo_comment_dianping.find({}, {'text': 1}):
        comment_cache_list.append(comment_cache)

        if len(comment_cache_list) >= text_batch_size:
            sentiment_result_list = module.predict_sentiment([comment['text'] for comment in comment_cache_list],
                                                             use_gpu=False)

            for comment_index, comment in enumerate(comment_cache_list):
                comment['sentiment'] = sentiment_result_list[comment_index]['positive_probs'] - \
                                       sentiment_result_list[comment_index]['negative_probs']
                mongo_comment_dianping.update_one({'_id': comment['_id']}, {'$set': {comment}})

            comment_cache_list.clear()


def sentiment_single():
    for comment in mongo_comment_dianping.find({'sentiment': {'$exists': False}}, {'text': 1}):
        sentiment_result = module.predict_sentiment([comment['text']],
                                                    use_gpu=False)[0]
        comment['sentiment'] = sentiment_result['positive_probs'] - \
                               sentiment_result['negative_probs']
        mongo_comment_dianping.update_one({'_id': comment['_id']}, {'$set': comment})
        print(f'处理文档{comment["_id"]}，情感得分：{comment["sentiment"]}')


sentiment_single()
