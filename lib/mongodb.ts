import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error(
    "Please add MONGODB_URI to .env.local (see .env.local.example)",
  );
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClient(): Promise<MongoClient> {
  if (global._mongoClientPromise) {
    return global._mongoClientPromise;
  }
  global._mongoClientPromise = new MongoClient(uri).connect();
  return global._mongoClientPromise;
}

/** Use in API routes / server code: const db = await getDb(); db.collection('goals')... */
export async function getDb(dbName = "nextstep"): Promise<Db> {
  const client = await getClient();
  return client.db(dbName);
}

export { getClient };
