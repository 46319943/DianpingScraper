import pymongo
from logger_manager import logger

mongo_url = 'mongodb://localhost:27017'
db_name = 'dianping'
collection_name = 'huanghelou'

client = pymongo.MongoClient(
    mongo_url, socketTimeoutMS=5000
)
db = client[db_name]
collection = db[collection_name]


def insert_item(item, identify_column: str = '_id'):
    db_result = collection.update_one(
        {identify_column: item[identify_column]}, {"$set": dict(item)}, upsert=True
    )
    if db_result.matched_count != 0:
        logger.info('update item. ' + identify_column + ' :' + item[identify_column])
        logger.info(f'{db_result.matched_count} updated')

