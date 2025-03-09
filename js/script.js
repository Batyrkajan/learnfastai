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
  const sendButton = document.getElementById("sendButton");

  if (!userInput || !userInput.value.trim()) return;

  // Disable input and button while processing
  userInput.disabled = true;
  sendButton.disabled = true;

  // Add user message to chat
  const userMessage = userInput.value.trim();
  addUserMessage(userMessage);

  // Show typing indicator
  showTypingIndicator();

  try {
    const requestBody = {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an AI tutor helping with AI fundamentals. Focus on clear, concise explanations.",
        },
        {
          role: "user",
          content:
            userMessage.length > 200
              ? truncateText(userMessage, 200)
              : userMessage,
        },
      ],
    };

    // Make API call
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(
        `API request failed with status ${response.status}: ${responseText}`
      );
    }

    const data = JSON.parse(responseText);

    // Remove typing indicator
    hideTypingIndicator();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error(
        "Unexpected API response format: " + JSON.stringify(data)
      );
    }

    // Add bot response to chat
    const message = data.choices[0].message.content;
    addBotMessage(message);
  } catch (error) {
    console.error("Error:", error);
    hideTypingIndicator();
    if (error.message.includes("Free-tier limit")) {
      addBotMessage(
        "I apologize for the limitation. Please try asking your question in a shorter way."
      );
    } else {
      addBotMessage(
        "I apologize, but I'm having trouble connecting right now. Please try again."
      );
    }
  }

  // Re-enable input and button
  userInput.value = "";
  userInput.disabled = false;
  sendButton.disabled = false;
  userInput.focus();
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
