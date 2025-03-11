require("dotenv").config();
const fs = require("fs").promises;
const path = require("path");
const fetch = require("node-fetch");

const topics = [
  {
    name: "advanced-programming",
    displayName: "Advanced Programming",
    modules: [
      "Advanced Python for AI",
      "NumPy and Pandas Mastery",
      "Machine Learning with Scikit-learn",
      "Deep Learning with TensorFlow and PyTorch",
      "R Programming Fundamentals",
      "Advanced SQL and Database Management",
      "JavaScript for Data Visualization",
      "C++ for High-Performance AI",
    ],
  },
  {
    name: "cybersecurity",
    displayName: "Cybersecurity",
    modules: [
      "Data Security and Privacy",
      "Ethical Hacking Fundamentals",
      "Network Security Essentials",
      "AI Applications in Cybersecurity",
      "Security Auditing and Testing",
    ],
  },
  {
    name: "cloud-computing",
    displayName: "Cloud Computing",
    modules: [
      "AWS Fundamentals",
      "Google Cloud Platform Essentials",
      "Microsoft Azure Basics",
      "Serverless Computing",
      "DevOps Practices and Tools",
    ],
  },
  {
    name: "web-development",
    displayName: "Web Development",
    modules: [
      "Modern HTML and CSS",
      "JavaScript Fundamentals",
      "React Development",
      "Backend with Node.js",
      "RESTful API Design",
      "Full Stack Development",
    ],
  },
  {
    name: "project-management",
    displayName: "Project Management",
    modules: [
      "Agile Methodologies",
      "Scrum Framework",
      "Kanban System",
      "Project Management Tools",
      "Team Leadership",
    ],
  },
  {
    name: "soft-skills",
    displayName: "Professional Skills",
    modules: [
      "Effective Communication",
      "Problem-Solving Strategies",
      "Critical Thinking",
      "Team Collaboration",
      "Presentation Skills",
    ],
  },
  {
    name: "iot",
    displayName: "Internet of Things",
    modules: [
      "IoT Fundamentals",
      "IoT Protocols and Standards",
      "IoT Security",
      "Data Analytics for IoT",
      "Edge Computing",
    ],
  },
  {
    name: "blockchain",
    displayName: "Blockchain Technology",
    modules: [
      "Blockchain Fundamentals",
      "Cryptocurrency Basics",
      "Smart Contracts",
      "Decentralized Applications",
      "Blockchain Security",
    ],
  },
  {
    name: "quantum-computing",
    displayName: "Quantum Computing",
    modules: [
      "Quantum Computing Basics",
      "Quantum Algorithms",
      "Quantum Machine Learning",
      "Quantum Hardware",
      "Quantum Programming",
    ],
  },
];

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

  const filePath = path.join(
    __dirname,
    "..",
    "..",
    "topics",
    `${topic.name}.html`
  );
  await fs.writeFile(filePath, htmlContent);
  console.log(`Created topic index: ${filePath}`);
}

async function ensureDirectoryExists(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    if (error.code !== "EEXIST") {
      throw error;
    }
  }
}

async function generateModuleContent(topic, moduleName) {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error("DEEPSEEK_API_KEY environment variable is not set");
    }

    const slug = moduleName.toLowerCase().replace(/\s+/g, "-");
    const prompt = `Create educational content about ${moduleName} for the topic ${topic.displayName}.
    IMPORTANT: Return ONLY clean HTML without any markdown, code blocks, or \`\`\`html markers.
    
    The content should be structured as a detailed study guide with the following sections:

    1. Module Header (brief description)
    2. Study Guide with multiple concept cards, where each card includes:
       - Definition
       - The 20% You Need to Know (key points)
       - Why It Matters
       - Simple Takeaway
    3. Why This Is Enough section
    4. Interactive questions
    5. Module summary

    Return the content in this EXACT HTML structure (do not include any markdown or code block markers):

    <section class="module-header">
      <h1>Module: ${moduleName}</h1>
      <p class="module-description">[Brief description]</p>
    </section>

    <section class="study-guide">
      <h2>80/20 Study Guide - Key Concepts</h2>
      
      [Multiple concept cards following this structure:]
      <div class="concept-card">
        <h3>[Concept Title]</h3>
        <div class="concept-content">
          <p class="definition">[Definition]</p>
          
          <h4>The 20% You Need to Know:</h4>
          <ul class="key-points">[Key points]</ul>

          <div class="why-it-matters">
            <h4>Why It Matters:</h4>
            <p>[Explanation]</p>
          </div>

          <div class="simple-takeaway">
            <h4>Simple Takeaway:</h4>
            <p>[Simple explanation]</p>
          </div>
        </div>
      </div>`;

    console.log(`Generating content for ${moduleName}...`);

    const response = await fetch(
      "https://api.deepseek.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are an expert curriculum designer. Return ONLY valid HTML content.",
            },
            { role: "user", content: prompt },
          ],
          model: "deepseek-chat",
          temperature: 0.7,
          max_tokens: 2000,
        }),
      }
    );

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    content = content.replace(/```html|```/g, "");

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${moduleName} - ${topic.displayName} | LearnFast AI</title>
    <link rel="stylesheet" href="../../../css/style.css" />
  </head>
  <body>
    <header>
      <div class="logo">
        <a href="../../../index.html" style="text-decoration: none; color: inherit">LearnFast AI</a>
      </div>
      <nav>
        <a href="../../${topic.name}.html">Back to ${topic.displayName}</a>
      </nav>
    </header>

    <main>
      ${content}

      <!-- Chat Interface -->
      <section class="chat-container">
        <div class="chat-header">
          <h3>Ask Questions About This Module</h3>
          <div class="api-notice">
            <p>📝 Note: We're using a free AI service that has a character limit. Please keep your questions brief and concise (under 200 characters).</p>
          </div>
        </div>
        <div class="chat-messages" id="chatMessages">
          <!-- Messages will be added here dynamically -->
        </div>
        <div class="chat-input">
          <input type="text" id="userInput" placeholder="Ask a question about what you've learned... (max 200 characters)" aria-label="Your question" maxlength="200">
          <button id="sendButton" onclick="sendMessage()">Send</button>
        </div>
      </section>

      <!-- Navigation -->
      <div class="next-topic">
        <h3>Ready to Continue?</h3>
        <p>Great job completing this section! Ready to learn more?</p>
        <a href="#" class="next-button">Next Topic →</a>
      </div>
    </main>

    <footer>
      <p>&copy; 2024 LearnFast AI. All rights reserved.</p>
    </footer>

    <script src="../../../js/script.js"></script>
  </body>
</html>`;

    const outputDir = path.join(
      __dirname,
      "..",
      "..",
      "topics",
      topic.name,
      "modules"
    );
    const outputFile = path.join(outputDir, `${slug}.html`);
    await fs.writeFile(outputFile, htmlContent);

    console.log(`Generated content saved to: ${outputFile}`);
    return outputFile;
  } catch (error) {
    console.error(`Error generating content for ${moduleName}:`, error);
    throw error;
  }
}

async function generateTopics() {
  try {
    for (const topic of topics) {
      const topicDir = path.join(__dirname, "..", "..", "topics", topic.name);
      const modulesDir = path.join(topicDir, "modules");
      await ensureDirectoryExists(modulesDir);

      await createTopicIndex(topic);

      for (const moduleName of topic.modules) {
        try {
          await generateModuleContent(topic, moduleName);
        } catch (error) {
          console.error(`Error generating module ${moduleName}:`, error);
        }
      }
    }

    console.log("Topics and modules generated successfully!");
  } catch (error) {
    console.error("Error generating topics:", error);
  }
}

generateTopics();
