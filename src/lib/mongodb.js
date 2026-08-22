import { MongoClient } from 'mongodb';
import { attachDatabasePool } from '@vercel/functions';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MONGODB_URI to .env.local');
}

const options = {
  appName: "devrel.vercel.integration",
  maxIdleTimeMS: 5000
};
const client = new MongoClient(process.env.MONGODB_URI, options);
   
// Attach the client to ensure proper cleanup on function suspension
attachDatabasePool(client);

// Export a module-scoped MongoClient to ensure the client can be shared across functions.
export default client;
