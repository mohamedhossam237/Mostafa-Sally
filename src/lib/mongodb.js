import { MongoClient } from 'mongodb';
import { attachDatabasePool } from '@vercel/functions';

// Use a fallback URI during static analysis/build time to prevent compilation crashes
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/sally_mostafa_wedding";

const options = {
  appName: "devrel.vercel.integration",
  maxIdleTimeMS: 5000
};

const client = new MongoClient(uri, options);
   
// Attach the client to ensure proper cleanup on function suspension
attachDatabasePool(client);

// Export a module-scoped MongoClient to ensure the client can be shared across functions.
export default client;
