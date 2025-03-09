const topics = [
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
];

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300", // Cache for 5 minutes
      },
      body: JSON.stringify(topics),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch topics" }),
    };
  }
};
