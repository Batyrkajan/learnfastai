const fs = require("fs").promises;
const path = require("path");
const { marked } = require("marked");

class ContentValidator {
  constructor() {
    this.validationRules = [
      this.validateStructure,
      this.validateReadability,
      this.validateLinks,
      this.validate8020Principle,
    ];
  }

  async validateContent(filePath) {
    try {
      console.log(`Validating content in ${filePath}...`);
      const content = await fs.readFile(filePath, "utf8");

      const results = {
        filePath,
        passed: true,
        issues: [],
        suggestions: [],
      };

      for (const rule of this.validationRules) {
        const ruleResult = await rule.call(this, content);
        if (!ruleResult.passed) {
          results.passed = false;
          results.issues.push(...ruleResult.issues);
        }
        if (ruleResult.suggestions) {
          results.suggestions.push(...ruleResult.suggestions);
        }
      }

      return results;
    } catch (error) {
      console.error("Error validating content:", error);
      throw error;
    }
  }

  async validateStructure(content) {
    const result = {
      passed: true,
      issues: [],
      suggestions: [],
    };

    // Check for required HTML structure
    if (!content.includes("<!DOCTYPE html>")) {
      result.passed = false;
      result.issues.push("Missing DOCTYPE declaration");
    }

    const requiredTags = ["<html", "<head>", "<body>", "<title>", "<main>"];
    for (const tag of requiredTags) {
      if (!content.includes(tag)) {
        result.passed = false;
        result.issues.push(`Missing required tag: ${tag}`);
      }
    }

    // Check for semantic structure
    const semanticTags = [
      "<header>",
      "<nav>",
      "<section>",
      "<article>",
      "<footer>",
    ];
    const missingSemanticTags = semanticTags.filter(
      (tag) => !content.includes(tag)
    );
    if (missingSemanticTags.length > 0) {
      result.suggestions.push(
        `Consider adding semantic tags: ${missingSemanticTags.join(", ")}`
      );
    }

    return result;
  }

  async validateReadability(content) {
    const result = {
      passed: true,
      issues: [],
      suggestions: [],
    };

    // Remove HTML tags for text analysis
    const text = content.replace(/<[^>]*>/g, "");
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const words = text.split(/\s+/).filter((w) => w.trim().length > 0);

    // Check average sentence length
    const avgSentenceLength = words.length / sentences.length;
    if (avgSentenceLength > 25) {
      result.suggestions.push(
        "Consider breaking down long sentences for better readability"
      );
    }

    // Check for headings structure
    const headings = content.match(/<h[1-6][^>]*>.*?<\/h[1-6]>/g) || [];
    if (headings.length < 3) {
      result.suggestions.push(
        "Consider adding more headings to improve content structure"
      );
    }

    return result;
  }

  async validateLinks(content) {
    const result = {
      passed: true,
      issues: [],
      suggestions: [],
    };

    const links = content.match(/<a[^>]*href=["']([^"']*)["'][^>]*>/g) || [];

    for (const link of links) {
      const href = link.match(/href=["']([^"']*)["']/)[1];

      if (href.startsWith("#")) {
        // Check if internal anchor exists
        const anchor = href.substring(1);
        if (!content.includes(`id="${anchor}"`)) {
          result.issues.push(`Broken internal link: ${href}`);
          result.passed = false;
        }
      } else if (href.startsWith("http")) {
        result.suggestions.push(`Consider validating external link: ${href}`);
      }
    }

    return result;
  }

  async validate8020Principle(content) {
    const result = {
      passed: true,
      issues: [],
      suggestions: [],
    };

    // Check for key sections
    const requiredSections = [
      "introduction",
      "key concepts",
      "practical applications",
      "summary",
    ];

    const lowerContent = content.toLowerCase();
    const missingSections = requiredSections.filter(
      (section) => !lowerContent.includes(section)
    );

    if (missingSections.length > 0) {
      result.passed = false;
      result.issues.push(
        `Missing key sections for 80/20 principle: ${missingSections.join(
          ", "
        )}`
      );
    }

    // Check content balance
    const sections = content.split(/<h[1-6][^>]*>/).slice(1);
    if (sections.length > 0) {
      const avgSectionLength = content.length / sections.length;
      const longSections = sections.filter(
        (s) => s.length > avgSectionLength * 1.5
      );

      if (longSections.length > 0) {
        result.suggestions.push(
          "Some sections are significantly longer than others. Consider balancing content distribution."
        );
      }
    }

    return result;
  }
}

// Command line interface
if (require.main === module) {
  const [filePath] = process.argv.slice(2);
  if (!filePath) {
    console.error("Usage: node validate-content.js <file-path>");
    process.exit(1);
  }

  const validator = new ContentValidator();
  validator
    .validateContent(filePath)
    .then((results) => {
      console.log("\nValidation Results:");
      console.log("===================");
      console.log(`Status: ${results.passed ? "✅ Passed" : "❌ Failed"}`);

      if (results.issues.length > 0) {
        console.log("\nIssues:");
        results.issues.forEach((issue) => console.log(`- ${issue}`));
      }

      if (results.suggestions.length > 0) {
        console.log("\nSuggestions:");
        results.suggestions.forEach((suggestion) =>
          console.log(`- ${suggestion}`)
        );
      }

      process.exit(results.passed ? 0 : 1);
    })
    .catch(() => process.exit(1));
}

module.exports = ContentValidator;
