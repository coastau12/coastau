import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
    throw new Error('Please add your Mongo URI to Vercel Environment Variables');
}

if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

export default async function handler(req, res) {
    try {
        const connectedClient = await clientPromise;
        const db = connectedClient.db('coast_esports');
        const collection = db.collection('roster');

        if (req.method === 'GET') {
            const data = await collection.findOne({ _id: 'players_list' });
            return res.status(200).json({ players: data ? data.players : [] });
        }

        if (req.method === 'POST') {
            const { players } = req.body;
            await collection.updateOne(
                { _id: 'players_list' },
                { $set: { players: players } },
                { upsert: true }
            );
            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Database connection failed' });
    }
}