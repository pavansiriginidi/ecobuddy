const { MongoClient } = require('mongodb');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_DB_NAME || (uri.split('/').pop() || 'test');

async function inspect() {
  console.log('Using MONGO_URI:', uri);
  console.log('Using MONGO_DB_NAME:', dbName);

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  const collections = await db.listCollections().toArray();
  console.log('Collections found:', collections.map((c) => c.name));

  const names = ['users', 'orders', 'payments', 'suggestions'];
  for (const name of names) {
    try {
      const col = db.collection(name);
      const count = await col.countDocuments();
      const sample = await col.find({}).limit(5).toArray();
      console.log(`\nCollection: ${name}`);
      console.log('  count:', count);
      console.log('  sample:', sample.slice(0, 3));
    } catch (e) {
      console.log(`\nCollection: ${name} - error or does not exist:`, e.message);
    }
  }

  await client.close();
}

inspect().catch((err) => {
  console.error('Inspect failed:', err.message);
  process.exit(1);
});
