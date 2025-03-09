const express = require("express");
const path = require("path");
const TopicGenerator = require("./scripts/generate-topic");
const ContentValidator = require("./scripts/validate-content");
const fs = require("fs").promises;
const { MongoClient } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/learnfast";
const client = new MongoClient(uri);

app.use(express.json());
app.use(express.static(path.join(__dirname, "dashboard")));

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
    const { type, title, details } = req.body;
    if (!type || !title || !details) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const feedback = {
      id: Date.now().toString(),
      type,
      title,
      details,
      timestamp: new Date().toISOString(),
    };

    const feedbackData = JSON.parse(await fs.readFile(FEEDBACK_FILE, "utf8"));
    feedbackData.push(feedback);
    await fs.writeFile(FEEDBACK_FILE, JSON.stringify(feedbackData, null, 2));

    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: "Failed to save feedback" });
  }
});

app.get("/api/feedback", async (req, res) => {
  try {
    const feedbackData = JSON.parse(await fs.readFile(FEEDBACK_FILE, "utf8"));
    res.json(feedbackData);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch feedback" });
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
