Phase 1: MVP Website Development Plan (Simple Content Website)

Core Goal: Create a very simple, free website that clearly presents the "AI Fundamentals" learning roadmap, study guides, and concept explanations to users for validation and feedback.  We will skip signup/authentication for this initial MVP to keep it fast and free to access.

Phase Breakdown:

Step 1: Define Website Structure and Pages

For simplicity and clarity, we'll create a multi-page website with the following structure:

Homepage:

Purpose: Landing page that introduces LearnFast AI, explains the 80/20 learning concept, and lists available learning topics.
URL: / (root domain)
Topic Page (Example: "AI Fundamentals"):

Purpose: Dedicated page for each learning topic. Displays the roadmap (modules) for that topic.
URL Structure: /topics/ai-fundamentals (or /topics/[topic-name])
Module Page (Example: "Module 1: Introduction to Artificial Intelligence"):

Purpose: Dedicated page for each module within a topic. Displays the 80/20 Study Guide (key concepts and explanations) for that module.
URL Structure: /topics/ai-fundamentals/modules/module-1 (or /topics/[topic-name]/modules/[module-number])
Visual Website Structure (Simplified Sitemap):

[Homepage] ("/")
    └── [Topic Page: AI Fundamentals] ("/topics/ai-fundamentals")
          └── [Module Page: Module 1] ("/topics/ai-fundamentals/modules/module-1")
          └── [Module Page: Module 2] ("/topics/ai-fundamentals/modules/module-2")
          └── [Module Page: Module 3] ("/topics/ai-fundamentals/modules/module-3")
          └── ... (Module Pages for all modules in "AI Fundamentals")
Step 2: Design Website Interface (Page by Page) - UI/UX Guidance for Simplicity

We'll focus on a clean, text-focused design for readability and ease of use.  Think of it like a well-organized online document.

2.1 Homepage Design (/)

Sections:

Header:
Website Title: "LearnFast AI" (or your chosen name) - prominent, top-left.
Simple Navigation (Top-Right - optional for MVP): A basic link to "Available Topics" or similar (if you have multiple topics later). For now, may not be needed if you only have "AI Fundamentals".
Hero Section (Main Introduction):
Headline: Catchy, value-driven headline. Example: "Learn AI Fundamentals 80% Faster" or "Master Complex Topics with AI-Powered 80/20 Learning"
Sub-headline (Brief Explanation): 1-2 sentences explaining the core value proposition: "Focus on the essential 20% of knowledge to gain 80% understanding, guided by AI-curated study paths."
Call to Action Button (Prominent): "Explore AI Fundamentals Roadmap" or "Get Started - AI Fundamentals" - Links to the "AI Fundamentals" Topic Page (/topics/ai-fundamentals).
"What is 80/20 Learning?" Section (Brief Explanation - optional for MVP):
Short paragraph explaining the 80/20 principle in the context of learning. (You can reuse/adapt your concise description).
"Available Topics" Section (List - Initially just "AI Fundamentals"):
Clear heading: "Explore Learning Topics" or "Available Courses"
List of available topics: For MVP, just list "AI Fundamentals" with a brief description and a "Learn More" button that links to the "AI Fundamentals" Topic Page.
UI/UX Principles for Homepage:

Clean and Simple Layout: Avoid clutter. Use white space effectively.
Clear Visual Hierarchy: Headline should be largest, sub-headline smaller, body text smaller. Use headings and subheadings to structure content.
Benefit-Driven Language: Focus on the value proposition and benefits to the user (faster learning, efficiency, understanding complex topics).
Mobile-Responsive Design: Ensure the homepage (and entire website) looks good on both desktop and mobile devices. (Many no-code website builders handle this automatically).
2.2 Topic Page Design (e.g., /topics/ai-fundamentals)

Sections:

Topic Header:
Topic Title: "AI Fundamentals" - prominent heading.
Brief Topic Description (Optional): A short paragraph summarizing what "AI Fundamentals" covers and who it's for. (You can reuse/adapt part of your longer description).
Roadmap Section (Main Content):
Clear Heading: "Learning Roadmap: AI Fundamentals" or "Modules"
Numbered List of Modules: Display the numbered list of module titles you generated from ChatGPT.
Module Descriptions (Very Short - Optional for MVP): You could add a very brief (1-sentence) description under each module title, but for MVP simplicity, you might skip this initially and just list the titles.
Link to Module Page: Each module title should be a clickable link that leads to the corresponding Module Page (e.g., "Module 1: Introduction to AI" links to /topics/ai-fundamentals/modules/module-1).
UI/UX Principles for Topic Page:

Clear Roadmap Presentation: Make the roadmap easy to scan and understand the learning progression.
Logical Module Ordering: Ensure the modules are listed in the correct learning sequence.
Easy Navigation to Modules: Module titles should be clearly clickable links.
Consistent Design with Homepage: Maintain a consistent look and feel with the homepage for brand recognition.
2.3 Module Page Design (e.g., /topics/ai-fundamentals/modules/module-1)

Sections:

Module Header:
Module Title: "Module 1: Introduction to Artificial Intelligence - What is AI?" - prominent heading.
Topic Name (Breadcrumb Navigation - Optional for MVP): You could include a small link above the module title to go back to the Topic Page (e.g., "&lt;- Back to AI Fundamentals Roadmap"). For MVP, you might just rely on browser back button.
80/20 Study Guide Section (Main Content):
Clear Heading: "80/20 Study Guide - Key Concepts" or "Essential Concepts"
Bulleted List of Key Concepts: Display the bulleted list of Key Concepts you generated for this module.
Essential Concept Explanations (Under Each Key Concept): Under each key concept bullet point, display the corresponding concise explanation you generated. Use slightly smaller text or different formatting to visually distinguish explanations from key concept titles.
UI/UX Principles for Module Page:

Focus on Readability: Prioritize text readability. Use clear fonts, good font sizes, and sufficient line spacing.
Clear Hierarchy of Information: Module Title (largest), Key Concepts (medium), Explanations (smaller).
Concise and Focused Content: Keep the page focused on the 80/20 study guide for this specific module. Avoid adding extra elements that could distract from the core content in the MVP.
Step 3:  Implement Core Website Features with AI Coding Assistant

Now you'll use Cursor AI (or your chosen tool) to implement the website based on the design plan above. Here's a breakdown of implementation tasks.  You'll need to guide your AI coding assistant step-by-step.

(Task 3.1) Project Setup:

Instruction to AI: "Create a new basic HTML and CSS website project. Set up the basic file structure with index.html for the homepage, and folders for CSS (style.css) and potentially JavaScript (script.js - though JS might be minimal for this MVP)."
AI Assistant Task: AI should create the basic project file structure.
Your Verification: Check that the basic files and folders are created correctly.
(Task 3.2) Homepage (index.html) Structure and Content:

Instruction to AI: "In index.html, create the basic HTML structure for the homepage as designed in Step 2.1. Include a header, hero section, 'What is 80/20 Learning?' section (optional - just a placeholder paragraph for now), and an 'Available Topics' section. For the 'Available Topics' section, for now, just hardcode a link to 'AI Fundamentals' topic page (we'll create that page next). Use semantic HTML tags like <header>, <main>, <section>, <h1>, <h2>, <p>, <a>."
AI Assistant Task: AI should generate the HTML for the homepage structure.
Your Verification: Review the generated HTML. Is the structure correct? Are semantic tags used appropriately? Is the content placeholder text added correctly?
(Task 3.3)  Style Homepage (style.css):

Instruction to AI: "In style.css, add basic CSS styles to make the homepage look clean and readable. Use a simple font family (like Arial or sans-serif). Style the header, hero section, headings, paragraphs, and buttons for a clean and professional look. Ensure basic mobile responsiveness (e.g., use viewport meta tag and some basic CSS for smaller screens)."
AI Assistant Task: AI should generate CSS styles for the homepage elements.
Your Verification: Open index.html in a browser. Does the homepage look reasonably clean and readable? Is it somewhat responsive on different screen sizes (you can use browser developer tools to test responsiveness)?
(Task 3.4) Create "AI Fundamentals" Topic Page (/topics/ai-fundamentals.html - or similar filename):

Instruction to AI: "Create a new HTML file named ai-fundamentals.html in a topics folder. In this file, create the HTML structure for the Topic Page as designed in Step 2.2. Include a topic header and a 'Roadmap' section. For the roadmap, hardcode a numbered list of module titles (copy these from your 'AI Fundamentals' content document). Make each module title a link, but for now, just make the links point to placeholder URLs (e.g., #module1, #module2 - we'll create module pages later)."
AI Assistant Task: AI should generate the HTML for the topic page structure.
Your Verification: Review the generated HTML for topic page. Is the structure correct? Are module titles listed? Are placeholder links created?
(Task 3.5) Style Topic Page (style.css - continue in same CSS file):

Instruction to AI: "In style.css, add CSS styles to make the 'AI Fundamentals' topic page look clean and readable, consistent with the homepage style. Style the topic header and roadmap section. Ensure basic mobile responsiveness."
AI Assistant Task: AI should generate CSS styles for the topic page elements.
Your Verification: Open ai-fundamentals.html in a browser. Does it look clean and readable? Does it generally match the homepage style? Is it reasonably responsive?
(Task 3.6) Create Module Pages (/topics/ai-fundamentals/modules/module-1.html, /module-2.html, etc. - or similar filenames):

Instruction to AI (Repeat for each module in your Roadmap - Module 1, Module 2, etc.): "Create a new HTML file named module-1.html in a topics/modules folder. In this file, create the HTML structure for the Module Page as designed in Step 2.3. Include a module header and an '80/20 Study Guide' section. For the study guide, hardcode the bulleted list of key concepts and their explanations for 'Module 1: Introduction to AI' (copy this content from your 'AI Fundamentals' content document). Use semantic HTML for structure (headings, lists, paragraphs)." Repeat this for module-2.html, module-3.html, etc., using the content for each module.
AI Assistant Task: AI should generate HTML for each module page, with hardcoded content.
Your Verification: Review the generated HTML for each module page. Is the structure correct? Is the module content (study guide, explanations) added?
(Task 3.7) Style Module Pages (style.css - continue in same CSS file):

Instruction to AI: "In style.css, add CSS styles to make the module pages look clean and readable, consistent with the homepage and topic page styles. Style the module header and study guide section. Ensure basic mobile responsiveness."
AI Assistant Task: AI should generate CSS styles for the module page elements.
Your Verification: Open each module page HTML file in a browser. Do they look clean and readable? Do they generally match the overall website style? Are they reasonably responsive?
(Task 3.8) Link Pages Together (Navigation):

Instruction to AI: "In index.html (homepage), update the 'AI Fundamentals' link to correctly point to topics/ai-fundamentals.html. In topics/ai-fundamentals.html (topic page), update the module title links to correctly point to the respective module pages (e.g., 'Module 1' link should point to topics/ai-fundamentals/modules/module-1.html)."
AI Assistant Task: AI should update the HTML links to connect the pages.
Your Verification: Test all links on the homepage and topic page in a browser. Do they navigate to the correct pages?
Step 4: Basic Testing and Review

Open all HTML files in your browser: Homepage (index.html), Topic Page (ai-fundamentals.html), and all Module Pages (module-1.html, etc.).
Check for Readability and Clarity: Is the text easy to read? Is the information presented clearly?
Test Navigation: Can you easily navigate between the homepage, topic page, and module pages using the links?
Basic Responsiveness Check: Resize your browser window to simulate different screen sizes. Does the layout adapt reasonably well on smaller screens? (It doesn't need to be perfect responsiveness for MVP, just reasonably functional).
Content Accuracy: Quickly double-check that the content on the website matches the content in your "AI_Fundamentals_MVP_Content.docx" document.
