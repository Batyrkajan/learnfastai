require("dotenv").config();
const OpenAI = require("openai");
const fs = require("fs").promises;
const path = require("path");
const { marked } = require("marked");

class ContentGenerator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.config = {
      topics: [
        {
          name: "ai-fundamentals",
          displayName: "AI Fundamentals",
          description: "Master the core concepts of Artificial Intelligence",
          modules: [
            {
              title: "Introduction to AI",
              difficulty: "Beginner",
              estimatedTime: "30 minutes",
              keyTopics: ["What is AI?", "Types of AI", "AI Applications"],
            },
            {
              title: "Machine Learning Basics",
              difficulty: "Intermediate",
              estimatedTime: "45 minutes",
              keyTopics: [
                "Types of ML",
                "Training Process",
                "Common Algorithms",
              ],
            },
          ],
        },
        {
          name: "python-for-ai",
          displayName: "Python for AI",
          description:
            "Learn Python programming specifically for AI development",
          modules: [
            {
              title: "Python Fundamentals",
              difficulty: "Beginner",
              estimatedTime: "1 hour",
              keyTopics: ["Variables", "Control Flow", "Functions"],
            },
            {
              title: "Data Structures",
              difficulty: "Intermediate",
              estimatedTime: "1 hour",
              keyTopics: ["Lists", "Dictionaries", "NumPy Arrays"],
            },
          ],
        },
      ],
    };
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
      throw new Error(`Topic ${topicName} not found`);
    }

    const module = topic.modules.find((m) => m.title === moduleTitle);
    if (!module) {
      throw new Error(`Module ${moduleTitle} not found in topic ${topicName}`);
    }

    const moduleSlug = this.slugify(moduleTitle);
    const modulesDir = path.join(
      __dirname,
      "../../topics",
      topicName,
      "modules"
    );
    await this.ensureDirectoryExists(modulesDir);

    // Generate markdown content (placeholder)
    const markdown = this.generateModuleContent(module);
    const markdownPath = path.join(modulesDir, `${moduleSlug}.md`);
    await fs.writeFile(markdownPath, markdown);

    // Convert markdown to HTML
    const html = this.convertToHtml(markdown, topic, module);
    const htmlPath = path.join(modulesDir, `${moduleSlug}.html`);
    await fs.writeFile(htmlPath, html);

    return {
      markdown: markdownPath,
      html: htmlPath,
    };
  }

  generateModuleContent(module) {
    return `# ${module.title}

## 🎯 The 20% That Matters Most
Key concepts that will give you 80% of the understanding.

## 🗺️ Your Learning Path
A clear roadmap for this module.

## 🎓 Core Concepts
The fundamental ideas you need to grasp.

## 💡 "Aha!" Moments
Key insights that make everything click.

## 🔄 Quick Practice
Hands-on exercises to reinforce your learning.

## 🎯 Knowledge Check
Test your understanding.

## 🌟 Real-World Application
See how these concepts are used in practice.

## 🚀 Next Steps
Where to go from here.`;
  }

  convertToHtml(markdown, topic, module) {
    const html = marked(markdown);
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${module.title} | ${topic.displayName} | LearnFast</title>
    <link rel="stylesheet" href="../../../css/style.css">
</head>
<body>
    <header>
        <div class="logo">
            <a href="../../../index.html">LearnFast</a>
        </div>
        <nav>
            <a href="../${topic.name}.html">Back to ${topic.displayName}</a>
        </nav>
    </header>

    <main class="module-content">
        ${html}
    </main>

    <footer>
        <p>&copy; 2024 LearnFast. All rights reserved.</p>
    </footer>
</body>
</html>`;
  }

  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async ensureDirectoryExists(dir) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      if (error.code !== "EEXIST") {
        throw error;
      }
    }
  }

  async generateModuleContent(topic, moduleName) {
    try {
      const prompt = `Create an educational module about ${moduleName} for the topic ${topic}.
      The content should follow the 80/20 principle, focusing on the most important concepts.
      Include:
      1. A clear introduction
      2. Key concepts with examples
      3. Practical applications
      4. A summary
      5. Next steps for learning
      Format the content in HTML with appropriate semantic tags and styling classes.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert educational content creator.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const content = completion.choices[0].message.content;
      const outputDir = path.join(
        __dirname,
        "..",
        "..",
        "topics",
        topic,
        "modules"
      );
      const outputFile = path.join(
        outputDir,
        `${this.sanitizeFilename(moduleName)}.html`
      );

      await fs.mkdir(outputDir, { recursive: true });
      await fs.writeFile(outputFile, content);

      console.log(`Generated content for ${moduleName} in ${outputFile}`);
      return outputFile;
    } catch (error) {
      console.error("Error generating content:", error);
      throw error;
    }
  }

  sanitizeFilename(filename) {
    return filename
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
}

// CLI interface
async function main() {
  try {
    const generator = new ContentGenerator();
    await generator.initialize();

    const [, , topic, moduleName] = process.argv;

    if (!topic || !moduleName) {
      console.error("Usage: node generate-content.js <topic> <module-name>");
      process.exit(1);
    }

    console.log(`Generating content for ${moduleName} in ${topic}...`);
    const result = await generator.generateModule(topic, moduleName);
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
