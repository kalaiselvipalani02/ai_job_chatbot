const { GoogleGenerativeAI } = require("@google/generative-ai");

// ✅ Use the same key for both fetch and genAI
const GEMINI_API_KEY = "AIzaSyAAHqohWFxEHj0fz-8DyUwabJ5DJUnX5X0";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function listAndRun() {
  try {
    // ✅ List available models
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`
    );
    const data = await response.json();
    console.log("✅ Available models:");
    data.models.forEach((model) => console.log(`- ${model.name}`));

    // ✅ Now test with a valid model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // use latest
    const result = await model.generateContent(["Tell me about MERN Stack"]);
    const modelResponse = await result.response;
    const text = await modelResponse.text();
    console.log("\n✅ Gemini says:\n", text);
  } catch (err) {
    console.error("❌ Error:", err.message || err);
  }
}

listAndRun();
