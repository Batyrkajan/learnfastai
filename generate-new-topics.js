require("dotenv").config();
const { exec } = require("child_process");
const fs = require("fs").promises;
const path = require("path");
const ContentGenerator = require("./content-generator/scripts/generate-content");

// Define the topics and their modules
const topics = [
  {
    name: "ai-fundamentals",
    displayName: "AI Fundamentals",
    modules: [
      "Introduction to AI",
      "Machine Learning Basics",
      "Neural Networks",
      "AI Ethics and Implications",
    ],
  },
  {
    name: "data-science",
    displayName: "Data Science",
    modules: [
      "Introduction to Data Science",
      "Data Analysis and Visualization",
      "Statistical Methods",
      "Machine Learning for Data Science",
      "Big Data Technologies",
    ],
  },
  {
    name: "math",
    displayName: "Mathematics for AI",
    modules: [
      "Linear Algebra Fundamentals",
      "Calculus for Machine Learning",
      "Probability and Statistics",
      "Optimization Methods",
    ],
  },
  {
    name: "python-for-ai",
    displayName: "Python for AI",
    modules: [
      "Python Basics and Syntax",
      "Data Structures and Algorithms",
      "NumPy and Pandas",
      "Machine Learning Libraries",
      "Deep Learning with TensorFlow",
    ],
  },
  {
    name: "business-analytics",
    displayName: "Business Analytics",
    modules: [
      "Introduction to Business Analytics",
      "Data-Driven Decision Making",
      "Predictive Analytics",
      "Data Visualization for Business",
      "Business Intelligence Tools",
    ],
  },
];

// Function to create topic index HTML
async function createTopicIndex(topic) {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${topic.displayName} | LearnFast AI</title>
  <link rel="stylesheet" href="../css/style.css">
</head>
<body>
  <header>
    <div class="logo">
      <a href="../index.html" style="text-decoration: none; color: inherit">LearnFast AI</a>
    </div>
    <nav>
      <a href="../index.html">Back to Topics</a>
    </nav>
  </header>

  <main>
    <section class="topic-header">
      <h1>${topic.displayName}</h1>
      <p class="topic-description">Master the essential concepts and skills in ${
        topic.displayName
      }.</p>
    </section>

    <section class="modules-list">
      <h2>Learning Modules</h2>
      <div class="modules-grid">
        ${topic.modules
          .map((module, index) => {
            const slug = module.toLowerCase().replace(/\s+/g, "-");
            return `
        <div class="module-card">
          <h3>${module}</h3>
          <p class="module-description">Learn the core concepts of ${module}.</p>
          <a href="${topic.name}/modules/${slug}.html" class="module-link">Start Learning</a>
        </div>`;
          })
          .join("")}
      </div>
    </section>
  </main>

  <footer>
    <p>&copy; 2024 LearnFast AI. All rights reserved.</p>
  </footer>

  <script src="../js/script.js"></script>
</body>
</html>`;

  const filePath = path.join(__dirname, "topics", `${topic.name}.html`);
  await fs.writeFile(filePath, htmlContent);
  console.log(`Created topic index: ${filePath}`);
}

// Function to ensure directory exists
async function ensureDirectoryExists(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    if (error.code !== "EEXIST") {
      throw error;
    }
  }
}

// Main function to generate all topics and modules
async function generateAllTopics() {
  try {
    const generator = new ContentGenerator();
    await generator.initialize();

    for (const topic of topics) {
      // Create topic directory
      const topicDir = path.join(__dirname, "topics", topic.name);
      const modulesDir = path.join(topicDir, "modules");
      await ensureDirectoryExists(modulesDir);

      // Create topic index
      await createTopicIndex(topic);

      // Generate modules
      for (const moduleName of topic.modules) {
        console.log(`Generating content for ${moduleName} in ${topic.name}...`);
        try {
          const result = await generator.generateModule(topic.name, moduleName);
          console.log(`Generated module: ${result.html}`);
        } catch (error) {
          console.error(`Error generating module ${moduleName}:`, error);
        }
      }
    }

    console.log("All topics and modules generated successfully!");
  } catch (error) {
    console.error("Error generating topics:", error);
  }
}

// Run the generator
generateAllTopics();
