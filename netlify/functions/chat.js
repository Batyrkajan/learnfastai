const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { message } = JSON.parse(event.body);

    // Validate message
    if (!message || message.length > 200) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Message is required and must be less than 200 characters",
        }),
      };
    }

    // Your AI service configuration here
    const response = await fetch("YOUR_AI_SERVICE_ENDPOINT", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AI_API_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "You are a helpful AI tutor assisting with questions about AI and programming.",
          },
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to process request" }),
    };
  }
};
