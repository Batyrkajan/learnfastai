const { MongoClient } = require("mongodb");

// Initialize MongoDB client (you'll need to set MONGODB_URI in Netlify environment variables)
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  const client = await MongoClient.connect(process.env.MONGODB_URI);
  const db = client.db("learnfast");
  cachedDb = db;
  return db;
}

exports.handler = async (event, context) => {
  // Only allow POST for submissions and GET for retrieving feedback
  if (event.httpMethod !== "POST" && event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const db = await connectToDatabase();
    const collection = db.collection("feedback");

    if (event.httpMethod === "GET") {
      // Retrieve feedback
      const feedback = await collection
        .find({})
        .sort({ timestamp: -1 })
        .toArray();
      return {
        statusCode: 200,
        body: JSON.stringify(feedback),
      };
    } else {
      // Handle POST request
      const feedback = JSON.parse(event.body);

      // Validate feedback data
      if (!feedback.type || !feedback.title || !feedback.content) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Missing required fields" }),
        };
      }

      // Add timestamp and ID
      const newFeedback = {
        ...feedback,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      };

      // Save to database
      await collection.insertOne(newFeedback);

      return {
        statusCode: 200,
        body: JSON.stringify(newFeedback),
      };
    }
  } catch (error) {
    console.error("Database error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to process feedback" }),
    };
  }
};
