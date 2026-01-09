# MongoDB Setup and Troubleshooting Guide

This guide helps you set up MongoDB for the eCommerce backend and resolve common connection issues.

## Quick Start

1. **Check if MongoDB is running:**
   ```bash
   npm run db:check
   ```

2. **Start the server:**
   ```bash
   npm run dev
   ```

3. **Seed the database with sample data:**
   ```bash
   npm run db:seed
   ```

## MongoDB Installation

### Windows
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Install and start MongoDB service
3. Or use command: `mongod --dbpath C:\data\db`

### macOS
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux (Ubuntu/Debian)
```bash
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Docker
```bash
# Run MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# With persistent data
docker run -d -p 27017:27017 -v mongodb_data:/data/db --name mongodb mongo:latest
```

## Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce

# Other required variables...
PORT=5000
JWT_SECRET=your-secret-key
```

### Connection Options
The application uses these MongoDB connection settings:
- **Connection timeout**: 10 seconds
- **Socket timeout**: 45 seconds
- **Connection pooling**: 5-10 connections
- **Buffering disabled**: Prevents timeout issues

## Troubleshooting

### Error: "MongooseError: Operation products.find() buffering timed out"

**Cause**: This error occurs when:
1. MongoDB is not running
2. Connection is established but queries timeout
3. Network connectivity issues

**Solutions**:

1. **Check if MongoDB is running:**
   ```bash
   npm run db:check
   ```

2. **Verify MongoDB service:**
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   
   # Check if port 27017 is open
   netstat -an | grep 27017
   ```

3. **Check MongoDB logs:**
   ```bash
   # Default log locations:
   # Windows: C:\Program Files\MongoDB\Server\6.0\log\mongod.log
   # macOS: /opt/homebrew/var/log/mongodb/mongo.log
   # Linux: /var/log/mongodb/mongod.log
   ```

### Error: "MongoServerSelectionError"

**Cause**: Cannot connect to MongoDB server

**Solutions**:
1. Ensure MongoDB is running on port 27017
2. Check firewall settings
3. Verify the MONGODB_URI is correct
4. For remote connections, check network connectivity

### Error: "Authentication failed"

**Cause**: MongoDB requires authentication but credentials are wrong

**Solutions**:
1. Update MONGODB_URI with credentials:
   ```
   mongodb://username:password@localhost:27017/ecommerce
   ```
2. Or disable authentication for local development

### Database is Empty

**Solution**: Seed the database with sample data:
```bash
npm run db:seed
```

This creates:
- Admin user: `admin@example.com` / `admin123`
- Regular user: `user@example.com` / `user123`
- 8 sample products across different categories

## Health Check

The application provides a health check endpoint that shows database status:

```bash
curl http://localhost:5000/api/health
```

Response includes:
- Server status
- Database connection state
- MongoDB host/port information

## Scripts

- `npm run db:check` - Test database connection
- `npm run db:seed` - Populate with sample data
- `npm run db:status` - Show current connection status
- `npm run dev` - Start development server with auto-restart

## Connection Flow

The application now follows this improved connection flow:

1. **Server starts** → Attempts MongoDB connection
2. **Connection successful** → Sets up API routes
3. **Connection failed** → Shows helpful error messages and exits
4. **Before each request** → Checks if database is still connected
5. **Connection lost** → Returns 503 Service Unavailable

This prevents the timeout errors you were experiencing by ensuring queries only run when the database is properly connected.

## Production Considerations

1. **Use MongoDB Atlas** or a managed MongoDB service
2. **Set up monitoring** for connection health
3. **Configure replica sets** for high availability
4. **Enable authentication** and use strong passwords
5. **Set up backup strategies**

## Need Help?

If you're still experiencing issues:
1. Run `npm run db:check` for detailed diagnostics
2. Check the server logs for specific error messages
3. Ensure your MongoDB version is compatible (4.4+)
4. Try connecting with a MongoDB client (MongoDB Compass, Studio 3T)
