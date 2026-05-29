const { MongoClient } = require("mongodb");

let client;
let collectionsPromise;

const getMongoUri = () => process.env.MONGO_URI || "";
const getDatabaseName = () => process.env.MONGO_DB_NAME || "ecobuddy";

async function connectMongo() {
  const uri = getMongoUri();

  if (!uri) {
    throw new Error("MONGO_URI is not set. Add a MongoDB connection string to api/.env.");
  }

  if (!client) {
    client = new MongoClient(uri);
  }

  await client.connect();

  const db = client.db(getDatabaseName());
  const users = db.collection("users");
  const orders = db.collection("orders");
  const payments = db.collection("payments");
  const suggestions = db.collection("suggestions");

  await Promise.all([
    users.createIndex({ username: 1 }, { unique: true }),
    orders.createIndex({ username: 1 }),
    orders.createIndex({ customerName: 1 }),
    payments.createIndex({ transactionId: 1 }, { unique: true, sparse: true }),
    payments.createIndex({ username: 1 }),
    suggestions.createIndex({ timestamp: -1 }),
  ]);

  return { db, users, orders, payments, suggestions };
}

async function getCollections() {
  if (!collectionsPromise) {
    collectionsPromise = connectMongo().catch((error) => {
      collectionsPromise = null;
      throw error;
    });
  }

  return collectionsPromise;
}

module.exports = {
  getCollections,
};