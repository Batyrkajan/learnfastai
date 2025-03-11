const express = require("express");
const path = require("path");
const TopicGenerator = require("./scripts/generate-topic");
const ContentValidator = require("./scripts/validate-content");
const fs = require("fs").promises;
const { MongoClient } = require("mongodb");
const fetch = require("node-fetch");
const { OpenAI } = require("openai");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/learnfast";
const client = new MongoClient(uri);

app.use(express.json());

// Serve static files from root directory
app.use(express.static(path.join(__dirname, "..")));

// API endpoints and other middleware
app.use("/topics", express.static(path.join(__dirname, "..", "topics")));
app.use("/css", express.static(path.join(__dirname, "..", "css")));
app.use("/js", express.static(path.join(__dirname, "..", "js")));

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Initialize services
let generator = null;
let validator = null;
let generatorInitialized = false;

async function initializeServices() {
  try {
    generator = new TopicGenerator();
    validator = new ContentValidator();
    await generator.initialize();
    generatorInitialized = true;
    console.log("Topic generator initialized successfully");
  } catch (error) {
    console.error("Failed to initialize services:", error);
    // Continue running the server even if initialization fails
  }
}

// Initialize services
initializeServices();

// Store feedback in a JSON file
const FEEDBACK_FILE = path.join(__dirname, "data", "feedback.json");

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.join(__dirname, "data");
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    if (error.code !== "EEXIST") {
      console.error("Error creating data directory:", error);
      throw error;
    }
  }
}

// Initialize feedback storage
async function initializeFeedback() {
  try {
    await ensureDataDir();
    try {
      await fs.access(FEEDBACK_FILE);
    } catch {
      await fs.writeFile(FEEDBACK_FILE, JSON.stringify([]));
      console.log("Feedback storage initialized");
    }
  } catch (error) {
    console.error("Error initializing feedback storage:", error);
  }
}

// Initialize feedback storage on startup
initializeFeedback();

// API Routes
app.get("/api/topics", (req, res) => {
  if (!generatorInitialized) {
    return res
      .status(503)
      .json({ error: "Topic generator not yet initialized" });
  }
  try {
    const topics = generator.generator.config.topics;
    res.json(topics);
  } catch (error) {
    console.error("Error fetching topics:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/generate", async (req, res) => {
  if (!generatorInitialized) {
    return res
      .status(503)
      .json({ error: "Topic generator not yet initialized" });
  }
  try {
    const { topic } = req.body;
    const results = await generator.generateTopic(topic);
    res.json(results);
  } catch (error) {
    console.error("Error generating topic:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/validate", async (req, res) => {
  try {
    const { topic } = req.body;
    const topicDir = path.join(__dirname, "../topics", topic);

    // Get all markdown files in the topic directory
    const files = await fs.readdir(path.join(topicDir, "modules"));
    const markdownFiles = files.filter((f) => f.endsWith(".md"));

    const validationResults = [];
    for (const file of markdownFiles) {
      const result = await validator.validateContent(
        path.join(topicDir, "modules", file)
      );
      validationResults.push(result);
    }

    const report = validator.generateReport(validationResults);
    res.json({ report, results: validationResults });
  } catch (error) {
    console.error("Error validating content:", error);
    res.status(500).json({ error: error.message });
  }
});

// Feedback endpoints
app.post("/api/feedback", async (req, res) => {
  try {
    const { type, title, content } = req.body;
    if (!type || !title || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const feedback = {
      id: Date.now().toString(),
      type,
      title,
      content,
      timestamp: new Date().toISOString(),
    };

    const feedbackData = JSON.parse(await fs.readFile(FEEDBACK_FILE, "utf8"));
    feedbackData.push(feedback);
    await fs.writeFile(FEEDBACK_FILE, JSON.stringify(feedbackData, null, 2));

    res.json(feedback);
  } catch (err) {
    console.error("Error saving feedback:", err);
    res.status(500).json({ error: "Failed to save feedback" });
  }
});

app.get("/api/feedback", async (req, res) => {
  try {
    const feedbackData = JSON.parse(await fs.readFile(FEEDBACK_FILE, "utf8"));
    res.json(feedbackData.reverse()); // Return most recent feedback first
  } catch (err) {
    console.error("Error fetching feedback:", err);
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  console.log("\n=== New Chat Request ===");
  console.log("Time:", new Date().toISOString());

  try {
    const { message, context } = req.body;
    console.log("Request body:", JSON.stringify({ message, context }, null, 2));

    if (!message) {
      console.log("Error: Message is required");
      return res.status(400).json({ error: "Message is required" });
    }

    // Check for chat API key
    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error("DEEPSEEK_API_KEY environment variable is not set");
    }

    // Construct prompt with context
    const systemMessage =
      "You are a knowledgeable AI tutor. Provide clear, direct answers using the context provided. Don't mention that you're an AI or use phrases like 'I understand' or 'Let me help you'. Just give the answer directly.";

    const userPrompt = `Question: ${message}
${
  context
    ? `\nContext:\nModule: "${context.moduleTitle}"\nKey Concepts: ${context.concepts}`
    : ""
}`;

    console.log("\nPreparing API request...");

    // Create a single OpenAI client instance
    if (!app.locals.openaiClient) {
      app.locals.openaiClient = new OpenAI({
        baseURL: "https://api.deepseek.com",
        apiKey: process.env.DEEPSEEK_API_KEY,
        defaultHeaders: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
      });
    }

    console.log("\nSending request to API with configuration:", {
      baseURL: "https://api.deepseek.com",
      model: "deepseek-chat",
      hasApiKey: !!process.env.DEEPSEEK_API_KEY,
    });

    const completion = await app.locals.openaiClient.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: systemMessage,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      stream: false,
    });

    console.log(
      "\nAPI Response received:",
      JSON.stringify(completion, null, 2)
    );

    if (!completion.choices?.[0]?.message?.content) {
      console.log("Error: Invalid response format");
      throw new Error("Invalid response format from API");
    }

    const response = completion.choices[0].message.content.trim();
    console.log("\nProcessed response:", response);

    res.json({ response });
    console.log("\n=== Request Completed Successfully ===\n");
  } catch (error) {
    console.error("\nChat Error:");
    console.error("Name:", error.name);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    if (error.response) {
      console.error("API Error Response:", error.response.data);
    }

    console.log("\n=== Request Failed ===\n");

    const errorMessage = error.message.includes("API")
      ? error.message
      : "Failed to process chat request. Please try again.";

    res.status(500).json({ error: errorMessage });
  }
});

// Batch topic generation endpoint
app.post("/api/generate-batch", async (req, res) => {
  if (!generatorInitialized) {
    return res
      .status(503)
      .json({ error: "Topic generator not yet initialized" });
  }

  const topics = [
    "AI-Fundamentals",
    "Data-Science",
    "Math",
    "Python-for-AI",
    "Business-Analytics",
  ];

  try {
    const results = [];
    for (const topic of topics) {
      console.log(`Generating content for topic: ${topic}`);
      try {
        const result = await generator.generateTopic(topic);
        results.push({
          topic,
          status: "success",
          data: result,
        });
      } catch (error) {
        console.error(`Error generating topic ${topic}:`, error);
        results.push({
          topic,
          status: "error",
          error: error.message,
        });
      }
    }

    res.json({
      totalTopics: topics.length,
      results,
    });
  } catch (error) {
    console.error("Error in batch generation:", error);
    res.status(500).json({ error: error.message });
  }
});

// Initialize and start server
async function startServer() {
  try {
    await ensureDataDir();
    await initializeFeedback();
    await client.connect();
    console.log("Connected to MongoDB");

    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
