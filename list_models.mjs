import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

async function run() {
  // We can't directly list models with the JS SDK easily without a specific fetch call
  // Let's do a direct fetch to the REST API
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.VITE_GEMINI_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  console.log(JSON.stringify(data.models.map(m => m.name), null, 2));
}

run();
