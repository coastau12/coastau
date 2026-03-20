import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const data = await kv.get('coast_players') || [];
            return res.status(200).json({ players: data });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch data' });
        }
    }

    if (req.method === 'POST') {
        try {
            const { players } = req.body;
            await kv.set('coast_players', players);
            return res.status(200).json({ success: true });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to save data' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}