const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;

let url = "mongodb://localhost:27017";
let client = MongoClient.connect(url);
let dianping = client.then((client) => client.db("dianping"));

module.exports = {
  client,
  news: dianping,
  comment: dianping.then((db) => db.collection("comment")),
  huanlegu: dianping.then((db) => db.collection("huanlegu")),
  user: dianping.then((db) => db.collection("user")),
  ObjectID,
  ID: (id) => new ObjectID(id),
};
