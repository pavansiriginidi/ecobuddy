const { MongoClient } = require("mongodb");
const { randomUUID } = require("crypto");

let client;
let collectionsPromise;
let indexesPromise;
let memoryCollections;

const getMongoUri = () => process.env.MONGO_URI || "";
const getDatabaseName = () => process.env.MONGO_DB_NAME || "ecobuddy";

const matchesQuery = (document, query = {}) => {
  const entries = Object.entries(query || {});
  if (entries.length === 0) return true;

  return entries.every(([key, value]) => {
    if (key === "$or" && Array.isArray(value)) {
      return value.some((branch) => matchesQuery(document, branch));
    }

    return document?.[key] === value;
  });
};

const createMemoryCursor = (documents) => ({
  sort(sortSpec = {}) {
    const [field, direction] = Object.entries(sortSpec)[0] || [];
    const sorted = [...documents].sort((left, right) => {
      if (!field) return 0;
      const leftValue = left?.[field];
      const rightValue = right?.[field];
      if (leftValue === rightValue) return 0;
      return (leftValue > rightValue ? 1 : -1) * (direction < 0 ? -1 : 1);
    });
    return createMemoryCursor(sorted);
  },
  toArray() {
    return Promise.resolve([...documents]);
  },
});

const createMemoryCollection = (name) => {
  const documents = [];

  return {
    async createIndex() {
      return `${name}_memory_index`;
    },
    async findOne(query = {}) {
      return documents.find((document) => matchesQuery(document, query)) || null;
    },
    find(query = {}) {
      return createMemoryCursor(documents.filter((document) => matchesQuery(document, query)));
    },
    async insertOne(document) {
      documents.push({ ...document });
      return { acknowledged: true, insertedId: document._id || randomUUID() };
    },
    async updateOne(filter = {}, update = {}) {
      const target = documents.find((document) => matchesQuery(document, filter));
      if (!target) {
        return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
      }

      if (update?.$set) {
        Object.assign(target, update.$set);
      }

      return { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
    },
    async deleteMany(query = {}) {
      const remaining = documents.filter((document) => !matchesQuery(document, query));
      const deletedCount = documents.length - remaining.length;
      documents.length = 0;
      documents.push(...remaining);
      return { acknowledged: true, deletedCount };
    },
    async countDocuments(query = {}) {
      return documents.filter((document) => matchesQuery(document, query)).length;
    },
  };
};

const createMemoryCollections = () => {
  if (!memoryCollections) {
    memoryCollections = {
      db: { databaseName: getDatabaseName() },
      users: createMemoryCollection("users"),
      orders: createMemoryCollection("orders"),
      payments: createMemoryCollection("payments"),
      suggestions: createMemoryCollection("suggestions"),
    };
  }

  return memoryCollections;
};

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

  return { db, users, orders, payments, suggestions, source: "mongo" };
}

async function getCollections() {
  if (!collectionsPromise) {
    collectionsPromise = connectMongo()
      .catch((error) => {
        console.warn("Falling back to in-memory database:", error.message);
        return { ...createMemoryCollections(), source: "memory" };
      })
      .catch((error) => {
        collectionsPromise = null;
        throw error;
      });
  }

  return collectionsPromise;
}

module.exports = {
  getCollections,
};