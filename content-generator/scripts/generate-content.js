require("dotenv").config();
const fetch = require("node-fetch");
const fs = require("fs").promises;
const path = require("path");
const { marked } = require("marked");

class ContentGenerator {
  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY;
    this.apiEndpoint = "https://api.deepseek.com/v1/chat/completions";
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
    try {
      // Create topic directory if it doesn't exist
      const topicDir = path.join(__dirname, "../../topics", topicName);
      const modulesDir = path.join(topicDir, "modules");
      await this.ensureDirectoryExists(modulesDir);

      // Generate the content
      const outputFile = await this.generateModuleContent(
        topicName,
        moduleTitle
      );

      return {
        html: outputFile,
        markdown: outputFile.replace(".html", ".md"),
      };
    } catch (error) {
      console.error("Error in generateModule:", error);
      throw error;
    }
  }

  generateModuleContent(module) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${module.title}</title>
    <link rel="stylesheet" href="../../../css/style.css">
</head>
<body>
    <header>
        <div class="logo">
            <a href="../../../index.html">LearnFast AI</a>
        </div>
        <nav>
            <a href="../index.html">Back to Topic</a>
        </nav>
    </header>

    <main class="module-content">
        <h1>${module.title}</h1>

        <section class="content-section">
            <h2>🎯 The 20% That Matters Most</h2>
            <p>Key concepts that will give you 80% of the understanding.</p>
            <!-- Content will be filled by the AI -->
        </section>

        <section class="content-section">
            <h2>🗺️ Your Learning Path</h2>
            <p>A clear roadmap for this module.</p>
            <!-- Content will be filled by the AI -->
        </section>

        <section class="content-section">
            <h2>🎓 Core Concepts</h2>
            <!-- Content will be filled by the AI -->
        </section>

        <section class="content-section">
            <h2>💡 "Aha!" Moments</h2>
            <p>Key insights that make everything click.</p>
            <!-- Content will be filled by the AI -->
        </section>

        <section class="content-section">
            <h2>🔄 Quick Practice</h2>
            <p>Hands-on exercises to reinforce your learning.</p>
            <!-- Content will be filled by the AI -->
        </section>

        <section class="content-section">
            <h2>🎯 Knowledge Check</h2>
            <p>Test your understanding.</p>
            <!-- Content will be filled by the AI -->
        </section>

        <section class="content-section">
            <h2>🌟 Real-World Application</h2>
            <p>See how these concepts are used in practice.</p>
            <!-- Content will be filled by the AI -->
        </section>

        <section class="content-section">
            <h2>🚀 Next Steps</h2>
            <p>Where to go from here.</p>
            <!-- Content will be filled by the AI -->
        </section>

        <!-- AI Chat Assistant -->
        <section class="chat-container">
            <div class="chat-header">
                <h3>🤖 AI Learning Assistant</h3>
            </div>
            <div class="chat-messages" id="chatMessages">
                <!-- Messages will appear here -->
            </div>
            <div class="chat-input">
                <input type="text" id="userInput" placeholder="Ask a question about this module...">
                <button onclick="sendMessage()">Send</button>
            </div>
        </section>

        <!-- Navigation -->
        <div class="module-navigation">
            <a href="#" class="nav-button prev-module" id="prevModule">← Previous Module</a>
            <a href="#" class="nav-button next-module" id="nextModule">Next Module →</a>
        </div>
    </main>

    <footer>
        <p>&copy; 2024 LearnFast AI. All rights reserved.</p>
    </footer>

    <script>
        // Module navigation
        const modules = [
            'python-basics-and-syntax.html',
            'control-flow-and-functions.html',
            'data-structures.html',
            'file-handling-and-modules.html',
            'error-handling-and-debugging.html',
            'object-oriented-programming-oop.html'
        ];

        const currentModule = window.location.pathname.split('/').pop();
        const currentIndex = modules.indexOf(currentModule);

        const prevButton = document.getElementById('prevModule');
        const nextButton = document.getElementById('nextModule');

        if (currentIndex > 0) {
            prevButton.href = modules[currentIndex - 1];
        } else {
            prevButton.style.display = 'none';
        }

        if (currentIndex < modules.length - 1) {
            nextButton.href = modules[currentIndex + 1];
        } else {
            nextButton.style.display = 'none';
        }

        // Chat functionality
        function sendMessage() {
            const input = document.getElementById('userInput');
            const message = input.value.trim();
            if (!message) return;

            // Add user message
            addMessage('user', message);
            input.value = '';

            // Simulate AI response
            setTimeout(() => {
                addMessage('bot', 'I understand you have a question about ' + message + '. Let me help you with that...');
            }, 1000);
        }

        function addMessage(type, content) {
            const messages = document.getElementById('chatMessages');
            const messageDiv = document.createElement('div');
            messageDiv.className = type + '-message message';
            messageDiv.textContent = content;
            messages.appendChild(messageDiv);
            messages.scrollTop = messages.scrollHeight;
        }

        // Initialize with a welcome message
        addMessage('bot', 'Hi! I\'m your AI learning assistant. Feel free to ask any questions about this module!');
    </script>
</body>
</html>`;
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
      const prompt = `Create educational content about ${moduleName} for the topic ${topic}.
      IMPORTANT: Return ONLY clean HTML without any markdown, code blocks, or \`\`\`html markers.
      
      The content should be structured as a detailed study guide with the following sections:

      1. Module Header (brief description)
      2. Study Guide with multiple concept cards, where each card includes:
         - Definition
         - The 20% You Need to Know (key points)
         - Why It Matters
         - Simple Takeaway
      3. Machine Learning section (if relevant) with:
         - Basic definition
         - How it works
         - Types of ML
         - Real-world examples
      4. Why This Is Enough section
      5. Interactive questions
      6. Module summary

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
        </div>

        [Include ML-specific sections if relevant]
        
        <div class="why-enough">
          <h3>Why This Is Enough for Now</h3>
          <p>[Explanation using 80/20 principle]</p>
        </div>

        <div class="interactive-questions">
          <h3>Check Your Understanding</h3>
          <div class="questions">[Questions]</div>
        </div>

        <div class="module-summary">
          <h3>Wrapping Up</h3>
          [Summary points]
        </div>
      </section>

      IMPORTANT: Do not include any markdown code block markers (\`\`\`html) in your response. Return only the clean HTML content.`;

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
                "You are an expert educational content creator. Return ONLY clean HTML without any markdown, code blocks, or ```html markers. Your response should contain pure HTML content that can be directly inserted into a webpage.",
            },
            { role: "user", content: prompt },
          ],
          model: "deepseek-chat",
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const completion = await response.json();
      const aiContent = completion.choices[0].message.content
        .replace(/\`\`\`html|\`\`\`/g, "")
        .trim();

      // Get the topic configuration
      const topicConfig = this.config.topics.find((t) => t.name === topic);
      const moduleConfig = topicConfig.modules.find(
        (m) => m.title === moduleName
      );

      // Get the list of modules for navigation
      const moduleFiles = topicConfig.modules.map(
        (m) => this.sanitizeFilename(m.title) + ".html"
      );
      const currentModuleIndex = moduleFiles.indexOf(
        this.sanitizeFilename(moduleName) + ".html"
      );

      const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${moduleName} - ${topicConfig.displayName} | LearnFast AI</title>
    <link rel="stylesheet" href="../../../css/style.css">
</head>
<body>
    <header>
        <div class="logo">
            <a href="../../../index.html" style="text-decoration: none; color: inherit">LearnFast AI</a>
        </div>
        <nav>
            <a href="../../${topic}.html">Back to ${topicConfig.displayName}</a>
        </nav>
    </header>

    <main>
        ${aiContent}

        <!-- Chat Interface -->
        <section class="chat-container">
            <div class="chat-header">
                <h3>Ask Questions About This Module</h3>
                <div class="api-notice">
                    <p>📝 Note: We're using a free AI service that has a character limit. Please keep your questions brief and concise (under 200 characters). For longer discussions, consider breaking your question into smaller parts.</p>
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
            ${
              currentModuleIndex < moduleFiles.length - 1
                ? `<h3>Ready to Continue?</h3>
               <p>Great job completing this section! Ready to learn more?</p>
               <a href="${
                 moduleFiles[currentModuleIndex + 1]
               }" class="next-button">Next Topic: ${
                    topicConfig.modules[currentModuleIndex + 1].title
                  } →</a>`
                : "<h3>Congratulations!</h3><p>You've completed all modules in this topic!</p>"
            }
        </div>
    </main>

    <footer>
        <p>&copy; 2024 LearnFast AI. All rights reserved.</p>
    </footer>

    <script>
        // Chat functionality
        function sendMessage() {
            const input = document.getElementById('userInput');
            const message = input.value.trim();
            if (!message) return;

            // Add user message
            addMessage('user', message);
            input.value = '';

            // Simulate AI response
            setTimeout(() => {
                addMessage('bot', 'I understand you have a question about ' + message + '. Let me help you with that...');
            }, 1000);
        }

        function addMessage(type, content) {
            const messages = document.getElementById('chatMessages');
            const messageDiv = document.createElement('div');
            messageDiv.className = type + '-message message';
            messageDiv.textContent = content;
            messages.appendChild(messageDiv);
            messages.scrollTop = messages.scrollHeight;
        }

        // Initialize with a welcome message
        addMessage('bot', 'Hi! I\\'m your AI learning assistant. Feel free to ask any questions about this module!');
    </script>
</body>
</html>`;

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
      await fs.writeFile(outputFile, template);

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
