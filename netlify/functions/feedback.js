// Load environment variables in development
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const { MongoClient } = require("mongodb");

// Simple in-memory rate limiting
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 5; // 5 requests per minute

// Initialize MongoDB client
let cachedDb = null;
let client = null;

async function connectToDatabase() {
  try {
    if (cachedDb) {
      return cachedDb;
    }

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not set");
    }

    client = await MongoClient.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    cachedDb = client.db("learnfast");
    return cachedDb;
  } catch (error) {
    console.error("Database connection error:", error);
    throw new Error("Failed to connect to database");
  }
}

// Cleanup function for MongoDB connection
async function closeConnection() {
  if (client) {
    await client.close();
    cachedDb = null;
    client = null;
  }
}

// Rate limiting function
function checkRateLimit(ip) {
  const now = Date.now();
  const userRequests = rateLimit.get(ip) || [];

  // Remove old requests
  const recentRequests = userRequests.filter(
    (time) => now - time < RATE_LIMIT_WINDOW
  );

  if (recentRequests.length >= MAX_REQUESTS) {
    return false;
  }

  recentRequests.push(now);
  rateLimit.set(ip, recentRequests);
  return true;
}

// Sanitize feedback data
function sanitizeFeedback(feedback) {
  return {
    type: String(feedback.type).slice(0, 50),
    title: String(feedback.title).slice(0, 200),
    content: String(feedback.content).slice(0, 1000),
  };
}

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  // Add CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };

  // Handle OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers,
      body: "",
    };
  }

  if (event.httpMethod !== "POST" && event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const db = await connectToDatabase();
    const collection = db.collection("feedback");

    if (event.httpMethod === "GET") {
      const feedback = await collection
        .find({})
        .sort({ timestamp: -1 })
        .limit(100)
        .toArray();

      return {
        statusCode: 200,
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(feedback),
      };
    } else {
      let feedback;
      try {
        feedback = JSON.parse(event.body);
      } catch (error) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "Invalid JSON payload" }),
        };
      }

      if (!feedback.type || !feedback.title || !feedback.content) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "Missing required fields" }),
        };
      }

      const newFeedback = {
        ...feedback,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      };

      await collection.insertOne(newFeedback);

      return {
        statusCode: 200,
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newFeedback),
      };
    }
  } catch (error) {
    console.error("Operation error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "An unexpected error occurred" }),
    };
  } finally {
    // Cleanup database connection if needed
    if (process.env.NODE_ENV !== "production") {
      await closeConnection();
    }
  }
};
