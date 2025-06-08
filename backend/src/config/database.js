const { MongoClient } = require("mongodb");

let client;
let db;

async function connectDB() {
  try {
    const uri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/event_scheduler";
    const dbName = process.env.MONGODB_DB_NAME || "event_scheduler";

    client = new MongoClient(uri, {
      useUnifiedTopology: true,
    });

    await client.connect();

    db = client.db(dbName);

    // Create indexes for better performance
    await createIndexes();

    console.log(`📋 Connected to database: ${dbName}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

async function createIndexes() {
  try {
    const eventsCollection = db.collection("events");

    // Index for date-based queries
    await eventsCollection.createIndex({ startTime: 1 });
    await eventsCollection.createIndex({ endTime: 1 });

    // Compound index for date range queries
    await eventsCollection.createIndex({
      startTime: 1,
      endTime: 1,
    });

    // Index for recurring events
    await eventsCollection.createIndex({ isRecurring: 1 });

    console.log("📊 Database indexes created successfully");
  } catch (error) {
    console.error("❌ Error creating indexes:", error);
    // Don't throw here as this is not critical for startup
  }
}

function getDB() {
  if (!db) {
    throw new Error("Database not connected. Call connectDB first.");
  }
  return db;
}

function getClient() {
  if (!client) {
    throw new Error("Database client not initialized. Call connectDB first.");
  }
  return client;
}

async function closeDB() {
  if (client) {
    await client.close();
    console.log("📋 Database connection closed");
  }
}

module.exports = {
  connectDB,
  getDB,
  getClient,
  closeDB,
};
