// Main JavaScript file for LearnFast AI
document.addEventListener("DOMContentLoaded", function () {
  const userInput = document.getElementById("userInput");
  const sendButton = document.getElementById("sendButton");
  const chatMessages = document.getElementById("chatMessages");

  if (userInput && sendButton && chatMessages) {
    // Initialize chat with welcome message
    addMessageToChat(
      "ai",
      "👋 Hi! I'm here to help you understand this module better. I can answer your questions about AI concepts, but please keep them concise (under 200 characters) due to our current API limitations. Feel free to ask multiple shorter questions if needed!"
    );

    // Handle Enter key press
    userInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Handle button click
    sendButton.addEventListener("click", sendMessage);
  }
});

// Function to get module context
function getModuleContext() {
  const moduleTitle =
    document.querySelector("h1")?.textContent ||
    document.querySelector(".module-title")?.textContent ||
    "Current Module";

  const conceptElements = document.querySelectorAll(
    ".concept-card, .key-concept"
  );
  const concepts = Array.from(conceptElements)
    .map((el) => {
      const title = el.querySelector("h3, .concept-title")?.textContent || "";
      const content =
        el.querySelector(".content, .concept-content")?.textContent || "";
      return `${title} ${content}`.trim();
    })
    .filter((text) => text.length > 0)
    .join(". ");

  return {
    moduleTitle,
    concepts: concepts || "General concepts from the current module",
  };
}

async function sendMessage() {
  console.log("\n=== Starting Chat Request ===");
  console.log("Time:", new Date().toISOString());

  const userInput = document.getElementById("userInput");
  const message = userInput.value.trim();

  if (!message) {
    console.log("Error: Empty message");
    return;
  }

  console.log("User message:", message);

  // Clear input and disable
  userInput.value = "";
  userInput.disabled = true;
  const sendButton = document.getElementById("sendButton");
  if (sendButton) sendButton.disabled = true;

  // Add user message
  addMessageToChat("user", message);
  showTypingIndicator();

  try {
    const context = getModuleContext();
    console.log("\nContext gathered:", JSON.stringify(context, null, 2));

    console.log("\nSending request to server...");
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        context,
      }),
    });

    console.log("Server response status:", response.status);

    let errorMessage = "An error occurred. Please try again.";

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } else {
        const errorText = await response.text();
        console.error("\nServer error response:", errorText);
        errorMessage = `Server error (${response.status})`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("\nServer response data:", JSON.stringify(data, null, 2));

    hideTypingIndicator();

    if (data.error) {
      console.error("\nServer reported error:", data.error);
      throw new Error(data.error);
    }

    if (!data.response) {
      console.error("\nNo response in server data");
      throw new Error("No response received from server");
    }

    console.log("\nDisplaying AI response:", data.response);
    addMessageToChat("ai", data.response);
    console.log("\n=== Chat Request Completed Successfully ===\n");
  } catch (error) {
    console.error("\nChat Error:");
    console.error("Name:", error.name);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    console.log("\n=== Chat Request Failed ===\n");

    hideTypingIndicator();

    // Display a user-friendly error message
    const displayError =
      error.message.includes("API") || error.message.includes("Server")
        ? error.message
        : "Something went wrong. Please try again.";

    addMessageToChat("error", `Error: ${displayError}`);
  } finally {
    userInput.disabled = false;
    if (sendButton) sendButton.disabled = false;
    userInput.focus();
  }
}

function addMessageToChat(type, content) {
  const chatMessages = document.getElementById("chatMessages");
  if (!chatMessages) return;

  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type}-message`;

  const icon = type === "user" ? "👤" : type === "ai" ? "🤖" : "⚠️";
  messageDiv.innerHTML = `<span class="message-icon">${icon}</span> ${content}`;

  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
  const chatMessages = document.getElementById("chatMessages");
  if (!chatMessages) return;

  const indicator = document.createElement("div");
  indicator.className = "typing-indicator";
  indicator.innerHTML =
    "AI is typing<span>.</span><span>.</span><span>.</span>";
  chatMessages.appendChild(indicator);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
  const indicator = document.querySelector(".typing-indicator");
  if (indicator) {
    indicator.remove();
  }
}
