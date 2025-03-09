const express = require("express");
const path = require("path");
const TopicGenerator = require("./scripts/generate-topic");
const ContentValidator = require("./scripts/validate-content");
const fs = require("fs").promises;

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "dashboard")));

const generator = new TopicGenerator();
const validator = new ContentValidator();

// Initialize the generator
let generatorInitialized = false;
generator
  .initialize()
  .then(() => {
    generatorInitialized = true;
    console.log("Topic generator initialized successfully");
  })
  .catch((error) => {
    console.error("Failed to initialize topic generator:", error);
  });

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
    const feedback = {
      ...req.body,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };

    // Validate feedback data
    if (!feedback.type || !feedback.title || !feedback.content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let feedbackData = [];
    try {
      const fileContent = await fs.readFile(FEEDBACK_FILE, "utf-8");
      feedbackData = JSON.parse(fileContent);
    } catch (error) {
      console.error("Error reading feedback file:", error);
      // Initialize with empty array if file doesn't exist or is corrupted
      await fs.writeFile(FEEDBACK_FILE, JSON.stringify([]));
    }

    feedbackData.unshift(feedback);
    await fs.writeFile(FEEDBACK_FILE, JSON.stringify(feedbackData, null, 2));

    res.json(feedback);
  } catch (error) {
    console.error("Error saving feedback:", error);
    res.status(500).json({ error: "Failed to save feedback" });
  }
});

app.get("/api/feedback", async (req, res) => {
  try {
    const fileContent = await fs.readFile(FEEDBACK_FILE, "utf-8");
    const feedbackData = JSON.parse(fileContent);
    res.json(feedbackData);
  } catch (error) {
    console.error("Error reading feedback:", error);
    res.status(500).json({ error: "Failed to load feedback" });
  }
});

// Start server
app.listen(port, () => {
  console.log(
    `Content generator dashboard running at http://localhost:${port}`
  );
});
