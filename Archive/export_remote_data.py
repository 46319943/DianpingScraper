import pymongo
import json
import pandas


def export_to_file():
    mongo_client = pymongo.MongoClient("mongodb://admin:admin123@101.132.152.93:27017")
    mongo_dianping_db = mongo_client["dianping"]
    mongo_comment_dianping = mongo_dianping_db['comment']

    result_list = list(mongo_comment_dianping.find({}))

    df = pandas.DataFrame(result_list)
    df.to_csv('comment_df.csv', index=False)

    from bson import ObjectId

    class JSONEncoder(json.JSONEncoder):
        def default(self, o):
            if isinstance(o, ObjectId):
                return str(o)
            return json.JSONEncoder.default(self, o)

    with open('comment.json', 'w', encoding='UTF-8') as f:
        json.dump(result_list, f, cls=JSONEncoder, indent=2, ensure_ascii=False)


def export_to_local_mongo():
    comment_remote = pymongo.MongoClient("mongodb://admin:admin123@101.132.152.93:27017")["dianping"]['comment']
    comment_local = pymongo.MongoClient("mongodb://localhost:27017")["dianping"]['comment']

    count = 0
    for comment in comment_remote.find({}):
        comment_local.update_one({'_id': comment['_id']}, {'$set': comment}, True)
        count += 1
        if count % 500 == 0:
            print(count)


export_to_local_mongo()
