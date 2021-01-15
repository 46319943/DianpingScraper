const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

let url = 'mongodb://admin:admin123@101.132.152.93:27017'

let dianping = MongoClient.connect(url).then(client => client.db('dianping'))

module.exports = {
    news: dianping,
    comment: dianping.then(db => db.collection('comment')),
    huanlegu: dianping.then(db => db.collection('huanlegu')),
    user: dianping.then(db => db.collection('user')),
    ObjectID,
    ID: (id) => new ObjectID(id),
}