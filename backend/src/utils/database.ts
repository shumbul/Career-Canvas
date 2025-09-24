import { MongoClient, Db } from 'mongodb';

let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
    if (cachedDb) {
        return cachedDb;
    }

    const connectionString = process.env.MONGODB_CONNECTION_STRING;
    const databaseName = process.env.MONGODB_DATABASE_NAME;

    if (!connectionString) {
        throw new Error('MongoDB connection string not found in environment variables');
    }

    try {
        const client = new MongoClient(connectionString);

        await client.connect();
        const db = client.db(databaseName);
        
        cachedDb = db;
        console.log('Connected to MongoDB successfully');
        return db;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}