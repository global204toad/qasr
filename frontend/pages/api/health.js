import connectToDatabase from '../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Test database connection
        const conn = await connectToDatabase();

        const dbStatus = {
            isConnected: conn.connection.readyState === 1,
            host: conn.connection.host,
            name: conn.connection.name,
            readyState: conn.connection.readyState,
            readyStateText: ['disconnected', 'connected', 'connecting', 'disconnecting'][conn.connection.readyState]
        };

        res.status(200).json({
            status: dbStatus.isConnected ? 'OK' : 'WARNING',
            message: 'Server is running',
            database: dbStatus,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        res.status(503).json({
            status: 'ERROR',
            message: 'Database connection failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
}
