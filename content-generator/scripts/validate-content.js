const fs = require("fs").promises;
const path = require("path");

class ContentValidator {
  constructor() {
    this.requiredSections = [
      "# ", // Title
      "## 🎯 The 20% That Matters Most",
      "## 🗺️ Your Learning Path",
      "## 🎓 Core Concepts",
      '## 💡 "Aha!" Moments',
      "## 🔄 Quick Practice",
      "## 🎯 Knowledge Check",
      "## 🌟 Real-World Application",
      "## 🚀 Next Steps",
    ];

    this.rules = [
      {
        name: "Minimum length",
        check: (content) => content.length >= 100,
        message: "Content should be at least 100 characters long",
      },
      {
        name: "Has headings",
        check: (content) => content.includes("#"),
        message: "Content should include at least one heading",
      },
    ];
  }

  async validateContent(filePath) {
    const content = await fs.readFile(filePath, "utf-8");
    const issues = [];

    // Check for required sections
    for (const section of this.requiredSections) {
      if (!content.includes(section)) {
        issues.push(`Missing required section: ${section}`);
      }
    }

    // Check content length
    const contentLength = content.split(" ").length;
    if (contentLength < 500) {
      issues.push("Content is too short (less than 500 words)");
    }
    if (contentLength > 2500) {
      issues.push("Content is too long (more than 2500 words)");
    }

    // Check for interactive elements
    if (!content.includes("Exercise") || !content.includes("Question")) {
      issues.push("Missing interactive elements (exercises or questions)");
    }

    // Check for real-world examples
    if (
      !content.includes("Example") ||
      !content.toLowerCase().includes("real-world")
    ) {
      issues.push("Missing real-world examples");
    }

    // Check for proper formatting
    if (
      content.includes("TODO") ||
      (content.includes("[") && content.includes("]"))
    ) {
      issues.push("Contains placeholder content or unfilled template sections");
    }

    // Check for educational best practices
    const bestPractices = {
      "learning objectives":
        content.toLowerCase().includes("you will learn") ||
        content.toLowerCase().includes("you'll learn"),
      "practical examples":
        content.includes("Example") || content.includes("example"),
      "knowledge check":
        content.includes("Question") || content.includes("quiz"),
      "next steps":
        content.toLowerCase().includes("next") &&
        content.toLowerCase().includes("step"),
    };

    for (const [practice, exists] of Object.entries(bestPractices)) {
      if (!exists) {
        issues.push(`Missing educational best practice: ${practice}`);
      }
    }

    return {
      valid: issues.length === 0,
      issues,
      filePath,
    };
  }

  generateReport(validationResults) {
    let report = "# Content Validation Report\n\n";

    for (const result of validationResults) {
      report += `## ${path.basename(result.filePath)}\n`;
      if (result.valid) {
        report += "✅ Content meets all requirements\n\n";
      } else {
        report += "❌ Issues found:\n";
        result.issues.forEach((issue) => {
          report += `- ${issue}\n`;
        });
        report += "\n";
      }
    }

    return report;
  }
}

// CLI interface
async function main() {
  try {
    const validator = new ContentValidator();
    const [, , filePath] = process.argv;

    if (!filePath) {
      console.error("Usage: node validate-content.js <filePath>");
      process.exit(1);
    }

    const result = await validator.validateContent(filePath);

    if (result.valid) {
      console.log("✅ Content validation passed!");
    } else {
      console.log("❌ Content validation failed:");
      result.issues.forEach((issue) => {
        console.log(`- ${issue}`);
      });
      process.exit(1);
    }
  } catch (error) {
    console.error("Error validating content:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ContentValidator;
