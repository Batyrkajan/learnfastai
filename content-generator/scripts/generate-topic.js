const OpenAI = require("openai");
const fs = require("fs").promises;
const path = require("path");
const ContentGenerator = require("./generate-content");

class TopicGenerator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.contentGenerator = new ContentGenerator();
  }

  async generateTopicStructure(topic) {
    try {
      const prompt = `Create a learning path for ${topic} following the 80/20 principle.
      Break down the topic into 4-6 modules that cover the most important concepts.
      For each module, provide:
      1. Module title
      2. Brief description
      3. Key learning objectives
      Format the response as a JSON array of module objects.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: "You are an expert curriculum designer." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      return JSON.parse(completion.choices[0].message.content);
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
      for (const module of modules) {
        console.log(`Generating content for module: ${module.title}`);
        await this.contentGenerator.generateModuleContent(topic, module.title);
      }

      console.log("Creating topic index page...");
      await this.createTopicIndex(topic, modules);

      return {
        topic,
        moduleCount: modules.length,
        modules: modules.map((m) => m.title),
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
