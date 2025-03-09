const ContentGenerator = require("./generate-content");
const ContentValidator = require("./validate-content");
const fs = require("fs").promises;
const path = require("path");

class TopicGenerator {
  constructor() {
    this.generator = new ContentGenerator();
    this.validator = new ContentValidator();
  }

  async initialize() {
    await this.generator.initialize();
  }

  async generateTopic(topicName) {
    console.log(`🚀 Generating content for topic: ${topicName}`);

    const topic = this.generator.config.topics.find(
      (t) => t.name === topicName
    );
    if (!topic) {
      throw new Error(`Topic ${topicName} not found in configuration`);
    }

    const results = {
      topic: topic.displayName,
      modules: [],
      validationReport: "",
    };

    // Create topic directory if it doesn't exist
    const topicDir = path.join(__dirname, "../../topics", topicName);
    await this.generator.ensureDirectoryExists(topicDir);

    // Generate topic index page
    await this.generateTopicIndex(topic);

    // Generate each module
    for (const module of topic.modules) {
      console.log(`\n📝 Generating module: ${module.title}`);

      try {
        const moduleResult = await this.generator.generateModule(
          topicName,
          module.title
        );
        console.log(`✅ Generated ${module.title}`);

        // Validate content
        console.log(`🔍 Validating ${module.title}`);
        const validationResult = await this.validator.validateContent(
          moduleResult.markdown
        );

        results.modules.push({
          title: module.title,
          files: moduleResult,
          validation: validationResult,
        });
      } catch (error) {
        console.error(`❌ Error generating ${module.title}:`, error);
        results.modules.push({
          title: module.title,
          error: error.message,
        });
      }
    }

    // Generate validation report
    results.validationReport = this.validator.generateReport(
      results.modules.map((m) => m.validation).filter(Boolean)
    );

    // Save generation report
    const reportPath = path.join(topicDir, "generation-report.md");
    await this.saveGenerationReport(reportPath, results);

    return results;
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
