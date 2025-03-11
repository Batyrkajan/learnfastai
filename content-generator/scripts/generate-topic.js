require("dotenv").config();
const fetch = require("node-fetch");
const fs = require("fs").promises;
const path = require("path");
const ContentGenerator = require("./generate-content");
const OpenAI = require("openai");

class TopicGenerator {
  constructor() {
    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error("DEEPSEEK_API_KEY environment variable is not set");
    }
    console.log(
      "Deepseek API Key length:",
      process.env.DEEPSEEK_API_KEY.length
    );
    console.log(
      "Deepseek API Key starts with:",
      process.env.DEEPSEEK_API_KEY.substring(0, 5)
    );
    this.apiKey = process.env.DEEPSEEK_API_KEY;
    this.apiEndpoint = "https://api.deepseek.com/v1/chat/completions";
    this.contentGenerator = new ContentGenerator();
  }

  async initialize() {
    try {
      // Initialize the content generator
      await this.contentGenerator.initialize();
      return true;
    } catch (error) {
      console.error("Error initializing topic generator:", error);
      throw error;
    }
  }

  async generateTopicStructure(topic) {
    try {
      const topicPrompts = {
        "AI-Fundamentals":
          "Create a comprehensive learning path for AI Fundamentals that covers core concepts, machine learning basics, neural networks, and ethical considerations.",
        "Data-Science":
          "Design a learning path for Data Science covering data analysis, statistics, visualization, and machine learning with practical applications.",
        Math: "Create a learning path for essential mathematics in AI/ML, including linear algebra, calculus, probability, and statistics.",
        "Python-for-AI":
          "Design a learning path for Python programming specifically focused on AI development, including numpy, pandas, scikit-learn, and tensorflow basics.",
        "Business-Analytics":
          "Create a learning path for Business Analytics covering data-driven decision making, KPIs, visualization tools, and predictive analytics.",
      };

      const prompt = `${
        topicPrompts[topic] || `Create a learning path for ${topic}`
      } following the 80/20 principle.
      Break down the topic into 4-6 modules that cover the most important concepts.
      For each module, provide:
      1. Module title
      2. Brief description
      3. Key learning objectives
      Return ONLY a JSON array of module objects with the following structure, no markdown or code blocks:
      [
        {
          "title": "Module Title",
          "description": "Brief description of the module",
          "objectives": ["Objective 1", "Objective 2", "Objective 3"]
        }
      ]`;

      const response = await fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are an expert curriculum designer. Return ONLY valid JSON array of modules.",
            },
            { role: "user", content: prompt },
          ],
          model: "deepseek-chat",
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `API request failed: ${response.statusText} - ${errorText}`
        );
      }

      const completion = await response.json();
      let content = completion.choices[0].message.content;

      // Remove any markdown code block syntax if present
      content = content.replace(/```(json)?\n?|\n```/g, "");
      content = content.trim();

      try {
        const modules = JSON.parse(content);

        // Validate the response structure
        if (!Array.isArray(modules)) {
          throw new Error("Invalid API response: modules should be an array");
        }

        modules.forEach((module, index) => {
          if (
            !module.title ||
            !module.description ||
            !Array.isArray(module.objectives)
          ) {
            throw new Error(`Invalid module structure at index ${index}`);
          }
        });

        return modules;
      } catch (parseError) {
        console.error("Failed to parse API response:", content);
        throw new Error(`Failed to parse API response: ${parseError.message}`);
      }
    } catch (error) {
      console.error("Error generating topic structure:", error);
      throw error;
    }
  }

  async generateTopic(topic) {
    try {
      console.log(`Generating topic structure for ${topic}...`);
      const modules = await this.generateTopicStructure(topic);

      console.log("Creating topic directory...");
      const topicDir = path.join(__dirname, "..", "..", "topics", topic);
      await fs.mkdir(path.join(topicDir, "modules"), { recursive: true });

      console.log("Generating module content...");
      const generatedModules = [];
      for (const module of modules) {
        console.log(`Generating content for module: ${module.title}`);
        try {
          const outputFile = await this.contentGenerator.generateModuleContent(
            topic,
            module.title
          );
          generatedModules.push({
            title: module.title,
            file: outputFile,
            success: true,
          });
        } catch (error) {
          console.error(`Error generating module ${module.title}:`, error);
          generatedModules.push({
            title: module.title,
            error: error.message,
            success: false,
          });
        }
      }

      console.log("Creating topic index page...");
      await this.createTopicIndex(topic, modules);

      return {
        topic,
        moduleCount: modules.length,
        modules: generatedModules,
      };
    } catch (error) {
      console.error("Error generating topic:", error);
      throw error;
    }
  }

  async createTopicIndex(topic, modules) {
    const indexContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${topic} - LearnFast AI</title>
    <link rel="stylesheet" href="../../shared/css/style.css">
</head>
<body>
    <header>
        <nav>
            <a href="../../index.html">Home</a>
        </nav>
    </header>
    <main>
        <h1>${topic}</h1>
        <div class="module-grid">
            ${modules
              .map(
                (module, index) => `
                <div class="module-card">
                    <h2>${module.title}</h2>
                    <p>${module.description}</p>
                    <h3>Learning Objectives:</h3>
                    <ul>
                        ${module.objectives
                          .map((obj) => `<li>${obj}</li>`)
                          .join("")}
                    </ul>
                    <a href="modules/${this.contentGenerator.sanitizeFilename(
                      module.title
                    )}.html" class="module-link">
                        Start Module ${index + 1}
                    </a>
                </div>
            `
              )
              .join("")}
        </div>
    </main>
</body>
</html>`;

    const indexFile = path.join(
      __dirname,
      "..",
      "..",
      "topics",
      `${topic}.html`
    );
    await fs.writeFile(indexFile, indexContent);
  }
}

// Command line interface
if (require.main === module) {
  const [topic] = process.argv.slice(2);
  if (!topic) {
    console.error("Usage: node generate-topic.js <topic>");
    process.exit(1);
  }

  const generator = new TopicGenerator();
  generator
    .generateTopic(topic)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = TopicGenerator;
