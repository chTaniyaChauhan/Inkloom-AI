
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());


// Health check
app.get('/api/health', (req, res) => {
    console.log('Health check endpoint hit');
  res.json({
    success: true,
    message: 'Inkloom AI API is working!'
  });
});

// Common delay function
const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};


function fallbackAnalysis(guidelines, content) {
  const issues = [];

  // Check for unsupported guarantee claims
  const avoidsGuarantees =
    /never promise guaranteed results|no guaranteed results|avoid guarantees/i.test(guidelines);

  if (
    avoidsGuarantees &&
    /guarantee|guaranteed|100%\s*success/i.test(content)
  ) {
    const match = content.match(
      /[^.!?]*(?:guarantee|guaranteed|100%\s*success)[^.!?]*/i
    );

    issues.push({
      category: "Unsupported Claim",
      severity: "High",
      originalText: match ? match[0].trim() : "Guarantee claim",
      problem:
        "The content makes a guarantee that conflicts with the brand guidelines.",
      suggestion:
        "Remove the guarantee and use a realistic, verifiable statement.",
      suggestedText:
        "Our product is designed to help customers achieve their goals."
    });
  }

  // Check repeated sentences
  const sentences = content
    .split(/[.!?]+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);

  const seen = new Set();

  for (const sentence of sentences) {
    const normalized = sentence.toLowerCase();

    if (seen.has(normalized)) {
      issues.push({
        category: "Repetition",
        severity: "Low",
        originalText: sentence,
        problem: "This sentence is repeated in the content.",
        suggestion: "Remove the unnecessary repeated sentence.",
        suggestedText: ""
      });
    }

    seen.add(normalized);
  }

  return {
  "summary": "Short summary of the analysis",
  "issues": [
    {
      "category": "Unsupported Claim",
      "severity": "High",
      "originalText": "Exact problematic text",
      "problem": "Why this is an issue",
      "suggestion": "Explain how to improve it",
      "suggestedText": "Write the exact replacement text here"
    }
  ],
  "revisedContent": "Complete improved version of the content"
}
}


// Main AI content analysis route

app.post("/api/check", async (req, res) => {
  try {
    const { content, guidelines } = req.body;

    if (!content || !guidelines) {
      return res.status(400).json({
        success: false,
        message: "Both content and guidelines are required."
      });
    }

    const { GoogleGenAI } = await import("@google/genai");

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const prompt = `
You are Inkloom AI, a brand governance assistant.

Analyze the content using the brand guidelines.

BRAND GUIDELINES:
${guidelines}

CONTENT:
${content}

Identify:
1. Spelling and grammar mistakes.
2. Brand tone and terminology issues.
3. Unsupported or incorrect claims.
4. Repeated or unnecessary content.

Return ONLY valid JSON in this exact structure:

{
  "summary": "Short summary of the analysis",
  "issues": [
    {
      "category": "Brand Tone",
      "severity": "High",
      "originalText": "Exact problematic text",
      "problem": "Why this is an issue",
      "suggestion": "How to improve it",
      "suggestedText": "Write the exact corrected replacement text"
    }
  ],
  "revisedContent": "Complete improved version of the content"
}

Rules:
- Severity must be High, Medium, or Low.
- Each issue must be a separate object.
- Every issue MUST include suggestedText.
- suggestedText must contain the actual replacement text, not an explanation.
- originalText must exactly match the problematic text in the original content.
- For repeated content, suggestedText should be an empty string if the text should simply be removed.
- Do not invent issues.
- If no issues are found, return an empty issues array.
- Follow the provided brand guidelines.
`;

    let response;
    let success = false;

    // Gemini retry system
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Gemini attempt: ${attempt}`);

        response = await ai.models.generateContent({
          model: "gemini-3.5-flash-lite",
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });

        success = true;
        break;

      } catch (error) {
        if (error.status !== 503 || attempt === 3) {
          throw error;
        }

        const waitTime = attempt * 2000;

        console.log(`Gemini busy. Waiting ${waitTime}ms`);

        await delay(waitTime);
      }
    }

    if (!success) {
      throw new Error("Gemini is temporarily unavailable.");
    }

    const analysis = JSON.parse(response.text);

    return res.json({
      success: true,
      source: "gemini",
      analysis
    });

  } catch (error) {
    console.error("Content Analysis Error:", error);

    
if (error.status === 503) {
  return res.status(503).json({
    success: false,
    source: "gemini",
    message: "Our AI service is currently busy. Please try again after some time."
  });
}


    return res.status(500).json({
      success: false,
      message: "Something went wrong during content analysis."
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});