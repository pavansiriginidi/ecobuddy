const { MongoClient } = require("mongodb");

let client;
let collectionsPromise;
let indexesPromise;

const getMongoUri = () => process.env.MONGO_URI || "";
const getDatabaseName = () => process.env.MONGO_DB_NAME || "ecobuddy";

async function connectMongo() {
  const uri = getMongoUri();

  if (!uri) {
    throw new Error("MONGO_URI is not set. Add a MongoDB connection string to api/.env.");
  }

  if (!client) {
    client = new MongoClient(uri, {
      maxPoolSize: 5,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      socketTimeoutMS: 20000,
    });
  }

  await client.connect();

  const db = client.db(getDatabaseName());
  const users = db.collection("users");
  const orders = db.collection("orders");
  const payments = db.collection("payments");
  const suggestions = db.collection("suggestions");

  if (!indexesPromise) {
    indexesPromise = Promise.all([
      users.createIndex({ username: 1 }, { unique: true }),
      orders.createIndex({ username: 1 }),
      orders.createIndex({ customerName: 1 }),
      payments.createIndex({ transactionId: 1 }, { unique: true, sparse: true }),
      payments.createIndex({ username: 1 }),
      suggestions.createIndex({ timestamp: -1 }),
    ]).catch((error) => {
      indexesPromise = null;
      throw error;
    });
  }

  await indexesPromise;

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