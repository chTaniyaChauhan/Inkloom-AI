const express=require('express');
const cors=require('cors');
require('dotenv').config();

const app=express();

app.use(cors());
app.use(express.json());


app.get('/',(req,res)=>{
    res.send('Inkloom AI backend is running ');
});


app.get('/api/health',(req,res)=>{
    res.json({
        success:true,
        message:'Inkloom AI API is working!'
    });
});



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

Analyze the following content using the provided brand guidelines.

BRAND GUIDELINES:
${guidelines}

CONTENT:
${content}

Check for:
1. Spelling and grammar mistakes.
2. Brand tone and terminology issues.
3. Unsupported or incorrect claims.
4. Repeated or unnecessary content.

Return your analysis in clear, simple language.
For every issue, explain the problem and suggest an improvement.
If no issues are found, clearly say so.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt
    });

    return res.json({
      success: true,
      analysis: response.text
    });

  } catch (error) {
    console.error("Content Analysis Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to analyze content right now."
    });
  }
});



// Function to add a delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
app.post("/api/test-ai", async (req, res) => {

  const { GoogleGenAI } = await import("@google/genai");

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
  });

  let attempts = 0;
  const maxAttempts = 3;
  let baseDelay = 1000;

  while (attempts < maxAttempts) {

    try {

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: "Reply with: Hello Inkloom AI! Gemini is connected successfully."
      });

      return res.json({
        success: true,
        message: response.text
      });

    } catch (error) {

      attempts++;

      if (error.status === 503 && attempts < maxAttempts) {

        console.log(
          `Gemini busy. Retrying attempt ${attempts} after ${baseDelay}ms`
        );

        await delay(baseDelay);

        baseDelay *= 2;

        continue;
      }

      console.error("Gemini Error:", error.message);

      return res.status(error.status || 500).json({
        success: false,
        message: error.message
      });
    }
  }
});



app.listen(3000,()=>{
    console.log('Server is running on port 3000');
});