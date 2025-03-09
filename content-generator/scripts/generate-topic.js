const fs = require("fs").promises;
const path = require("path");
const ContentValidator = require("./validate-content");

class TopicGenerator {
  constructor() {
    this.generator = {
      config: {
        topics: [
          {
            id: "ai-fundamentals",
            title: "AI Fundamentals",
            description: "Learn the core concepts of AI and machine learning",
          },
          {
            id: "python-for-ai",
            title: "Python for AI",
            description: "Master Python programming for AI development",
          },
        ],
      },
    };
    this.validator = new ContentValidator();
  }

  async initialize() {
    // Placeholder for future initialization logic
    return Promise.resolve();
  }

  async generateTopic(topic) {
    // Placeholder for future topic generation logic
    return {
      success: true,
      topic: topic,
      message: "Topic generation is a placeholder for now",
    };
  }

  async generateTopicIndex(topic) {
    const indexPath = path.join(
      __dirname,
      "../../topics",
      `${topic.name}.html`
    );

    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${topic.displayName} | LearnFast</title>
    <link rel="stylesheet" href="../css/style.css" />
  </head>
  <body>
    <header>
      <div class="logo">
        <a href="../index.html">LearnFast</a>
      </div>
      <nav>
        <a href="../index.html#available-topics">Back to Topics</a>
      </nav>
    </header>

    <main>
      <section class="topic-header">
        <h1>${topic.displayName}</h1>
        <p class="topic-description">${topic.description}</p>
      </section>

      <section class="module-list">
        ${topic.modules
          .map(
            (module) => `
          <div class="module-card">
            <h3>${module.title}</h3>
            <p class="module-info">
              <span class="difficulty">${module.difficulty}</span>
              <span class="duration">${module.estimatedTime}</span>
            </p>
            <p class="module-topics">${module.keyTopics.join(" • ")}</p>
            <a href="${topic.name}/modules/${this.generator.slugify(
              module.title
            )}.html" 
               class="learn-more-button">Start Learning</a>
          </div>
        `
          )
          .join("\n")}
      </section>
    </main>

    <footer>
      <p>&copy; 2024 LearnFast. All rights reserved.</p>
    </footer>
  </body>
</html>`;

    await fs.writeFile(indexPath, html);
    console.log(`✅ Generated topic index page: ${indexPath}`);
  }

  async saveGenerationReport(reportPath, results) {
    let report = `# Content Generation Report\n\n`;
    report += `## Topic: ${results.topic}\n\n`;

    report += `### Modules Generated\n\n`;
    for (const module of results.modules) {
      report += `#### ${module.title}\n`;
      if (module.error) {
        report += `❌ Error: ${module.error}\n\n`;
      } else {
        report += `✅ Successfully generated\n`;
        report += `- Markdown: ${module.files.markdown}\n`;
        report += `- HTML: ${module.files.html}\n\n`;
      }
    }

    report += `\n### Validation Results\n\n`;
    report += results.validationReport;

    await fs.writeFile(reportPath, report);
    console.log(`📊 Generation report saved to: ${reportPath}`);
  }
}

// CLI interface
async function main() {
  try {
    const generator = new TopicGenerator();
    await generator.initialize();

    const [, , topicName] = process.argv;

    if (!topicName) {
      console.error("Usage: node generate-topic.js <topicName>");
      process.exit(1);
    }

    console.log(`Starting content generation for ${topicName}...`);
    const results = await generator.generateTopic(topicName);
    console.log("\n✨ Content generation completed!");
    console.log(`📝 Generated ${results.modules.length} modules`);
    console.log(
      `📊 Check the generation report in topics/${topicName}/generation-report.md`
    );
  } catch (error) {
    console.error("Error generating topic:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = TopicGenerator;
