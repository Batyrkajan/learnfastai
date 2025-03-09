require("dotenv").config();
const OpenAI = require("openai");
const fs = require("fs").promises;
const path = require("path");
const marked = require("marked");

class ContentGenerator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.config = require("../config/topics-config.json");
  }

  async initialize() {
    try {
      this.moduleTemplate = await fs.readFile(
        path.join(__dirname, "../templates/module-template.md"),
        "utf-8"
      );
    } catch (error) {
      console.error("Error loading templates:", error);
      throw error;
    }
  }

  async generateModule(topicName, moduleTitle) {
    const topic = this.config.topics.find((t) => t.name === topicName);
    if (!topic) {
      throw new Error(`Topic ${topicName} not found in configuration`);
    }

    const module = topic.modules.find((m) => m.title === moduleTitle);
    if (!module) {
      throw new Error(`Module ${moduleTitle} not found in topic ${topicName}`);
    }

    // Enhanced prompt for better content generation
    const systemPrompt = `You are an expert mentor and teacher in ${
      topic.displayName
    }, committed to helping students master the most crucial concepts using the 80/20 principle.

Your teaching philosophy:
1. Focus on the vital 20% of concepts that enable understanding 80% of the field
2. Explain complex ideas in simple, clear language
3. Connect concepts to real-world applications
4. Address common misconceptions proactively
5. Provide "aha!" moments that make concepts click
6. Build confidence through quick wins and clear progress

For this module on "${moduleTitle}":
- Prerequisites: ${module.prerequisites.join(", ") || "None"}
- Key Topics: ${module.keyTopics.join(", ")}
- Target Time: ${module.estimatedTime}
- Difficulty Level: ${module.difficulty}

Create content that:
1. Immediately shows why these specific concepts matter
2. Connects to both previous and upcoming modules
3. Includes only the most impactful examples and exercises
4. Anticipates and addresses common stumbling points
5. Provides clear indicators of mastery

Remember: Your goal is to make your student unstoppable in this field by teaching the most crucial fundamentals exceptionally well.`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Using the provided template, create engaging, focused content for ${moduleTitle}. 
          Remember to maintain a personal, mentoring tone while ensuring all information is accurate and essential.
          
          Template:
          ${this.moduleTemplate}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    const generatedContent = response.choices[0].message.content;

    // Save the markdown content
    const markdownPath = path.join(
      __dirname,
      "../../topics",
      topicName,
      "modules",
      `${this.slugify(moduleTitle)}.md`
    );
    await this.ensureDirectoryExists(path.dirname(markdownPath));
    await fs.writeFile(markdownPath, generatedContent);

    // Convert to HTML and save
    const htmlContent = await this.convertToHtml(
      generatedContent,
      topic,
      module
    );
    const htmlPath = path.join(
      __dirname,
      "../../topics",
      topicName,
      "modules",
      `${this.slugify(moduleTitle)}.html`
    );
    await fs.writeFile(htmlPath, htmlContent);

    return {
      markdown: markdownPath,
      html: htmlPath,
    };
  }

  async convertToHtml(markdown, topic, module) {
    // Convert markdown to HTML
    const contentHtml = marked(markdown);

    // Create full HTML document with template
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${module.title} - ${topic.displayName} | LearnFast</title>
    <link rel="stylesheet" href="../../../css/style.css" />
  </head>
  <body>
    <header>
      <div class="logo">
        <a href="../../../index.html">LearnFast</a>
      </div>
      <nav>
        <a href="../../${topic.name}.html">Back to ${topic.displayName}</a>
      </nav>
    </header>

    <main>
      <section class="module-content">
        ${contentHtml}
      </section>

      <section class="chat-container">
        <div class="chat-header">
          <h3>Ask Your Teacher</h3>
          <div class="api-notice">
            <p>💡 Stuck or curious? Ask me anything about this module!</p>
            <p>📝 Keep questions brief (under 200 characters) for better responses.</p>
          </div>
        </div>
        <div class="chat-messages" id="chatMessages"></div>
        <div class="chat-input">
          <input 
            type="text" 
            id="userInput" 
            maxlength="200" 
            placeholder="Ask your question here..."
          />
          <button id="sendButton">Ask</button>
        </div>
      </section>
    </main>

    <footer>
      <p>&copy; 2024 LearnFast. All rights reserved.</p>
    </footer>

    <script src="../../../js/script.js"></script>
  </body>
</html>`;
  }

  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
  }

  async ensureDirectoryExists(directory) {
    try {
      await fs.mkdir(directory, { recursive: true });
    } catch (error) {
      if (error.code !== "EEXIST") {
        throw error;
      }
    }
  }
}

// CLI interface
async function main() {
  try {
    const generator = new ContentGenerator();
    await generator.initialize();

    const [, , topic, moduleTitle] = process.argv;

    if (!topic || !moduleTitle) {
      console.error("Usage: node generate-content.js <topic> <moduleTitle>");
      process.exit(1);
    }

    console.log(`Generating content for ${moduleTitle} in ${topic}...`);
    const result = await generator.generateModule(topic, moduleTitle);
    console.log("Content generated successfully!");
    console.log("Files created:");
    console.log(`Markdown: ${result.markdown}`);
    console.log(`HTML: ${result.html}`);
  } catch (error) {
    console.error("Error generating content:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ContentGenerator;
