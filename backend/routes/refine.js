const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/', async (req, res) => {
  const { refinementPrompt, currentSIR } = req.body;

  // Basic validation
  if (!refinementPrompt || !currentSIR) {
    return res.status(400).json({ message: 'Invalid refinement request' });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash'
    });

    const result = await model.generateContent(`
You are an AI system that modifies website structures.

RULES:
- Modify ONLY the part mentioned in the user request
- Do NOT remove existing sections unless requested
- Return the FULL updated website structure
- Return ONLY valid JSON
- No explanations, no markdown

Current Website JSON:
${JSON.stringify(currentSIR, null, 2)}

User Change Request:
${refinementPrompt}
`);

    // Gemini returns text output
    const text = result.response.text();

    // Parse JSON safely
    const updatedSIR = JSON.parse(text);

    res.json({ sir: updatedSIR });

  } catch (error) {
    console.error('Gemini refinement error:', error.message);

    // Safe fallback → return original SIR unchanged
    res.json({ sir: currentSIR });
  }
});

module.exports = router;
