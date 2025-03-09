// Main JavaScript file for LearnFast AI
// This file is minimal for MVP but can be expanded later for additional functionality

document.addEventListener("DOMContentLoaded", function () {
  // Future functionality will be added here
  console.log("LearnFast AI website loaded successfully");

  // Chat functionality
  const userInput = document.getElementById("userInput");
  const sendButton = document.getElementById("sendButton");
  const chatMessages = document.getElementById("chatMessages");

  if (userInput && sendButton && chatMessages) {
    // Initialize chat with a more informative welcome message
    addBotMessage(
      "👋 Hi! I'm here to help you understand this module better. I can answer your questions about AI concepts, but please keep them concise (under 200 characters) due to our current API limitations. Feel free to ask multiple shorter questions if needed!"
    );

    // Handle Enter key press
    userInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }
});

// API configuration
const API_KEY = "ee487003fea944709cf5d57050275267";
const API_URL = "https://api.aimlapi.com/v1/chat/completions";

// Function to truncate text to fit within character limit while preserving meaning
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

// Function to extract key concepts from module content
function extractKeyPoints(moduleContent) {
  const keyPoints = [];
  if (moduleContent.includes("Definition of AI")) {
    keyPoints.push("AI is about creating systems that mimic human abilities");
  }
  if (moduleContent.includes("Key abilities")) {
    keyPoints.push(
      "Key abilities: learning, reasoning, problem-solving, perception, language"
    );
  }
  return keyPoints.join(". ");
}

async function sendMessage() {
  const userInput = document.getElementById("userInput");
  const message = userInput.value.trim();

  if (!message) return;

  // Clear input
  userInput.value = "";

  // Add user message to chat
  addMessageToChat("user", message);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    if (data.error) {
      addMessageToChat(
        "error",
        "Sorry, there was an error processing your request."
      );
      console.error(data.error);
      return;
    }

    // Add AI response to chat
    addMessageToChat("ai", data.choices[0].message.content);
  } catch (error) {
    addMessageToChat(
      "error",
      "Sorry, there was an error connecting to the server."
    );
    console.error(error);
  }
}

function addMessageToChat(type, content) {
  const chatMessages = document.getElementById("chatMessages");
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type}-message`;

  const icon = type === "user" ? "👤" : type === "ai" ? "🤖" : "⚠️";
  messageDiv.innerHTML = `<span class="message-icon">${icon}</span> ${content}`;

  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addUserMessage(message) {
  const messageDiv = document.createElement("div");
  messageDiv.className = "message user-message";
  messageDiv.textContent = message;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addBotMessage(message) {
  const messageDiv = document.createElement("div");
  messageDiv.className = "message bot-message";
  messageDiv.textContent = message;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
  const indicator = document.createElement("div");
  indicator.className = "typing-indicator";
  indicator.innerHTML = "AI is typing<span></span><span></span><span></span>";
  chatMessages.appendChild(indicator);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
  const indicator = document.querySelector(".typing-indicator");
  if (indicator) {
    indicator.remove();
  }
}
