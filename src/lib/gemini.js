import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey && apiKey !== 'your_api_key_here' ? new GoogleGenerativeAI(apiKey) : null;

// Helper to retry API calls on 503 (High Demand) or 429 (Rate Limit) errors
async function fetchWithRetry(model, prompt, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await model.generateContent(prompt);
    } catch (error) {
      const isRetryable = error.message?.includes('503') || error.message?.includes('429');
      if (isRetryable && i < retries - 1) {
        console.warn(`[Gemini API] Temporary error, retrying in 2 seconds... (Attempt ${i + 1}/${retries})`);
        await new Promise(res => setTimeout(res, 2000)); // Wait 2 seconds before retry
      } else {
        throw error;
      }
    }
  }
}

export async function generateNextQuestion(history, questionCount) {
  if (!genAI) {
    return new Promise(resolve => {
      setTimeout(() => {
        if (questionCount >= 4) {
          resolve({ question: "", options: ["Finish Triage"] });
        } else {
          resolve({
            question: "Do you also experience nausea or vomiting?",
            options: ["Yes", "No", "Not sure"]
          });
        }
      }, 1500);
    });
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });
    
    const prompt = `
You are an expert medical triage assistant. 
Based on the patient's answers so far, generate ONE logical simple YES/NO/NOT SURE question to help narrow down the diagnosis.

CRITICAL RULES:
1. You have a MAXIMUM of 5 questions. This is question number ${questionCount}.
2. ONLY set "isConclusion" to true if you are absolutely confident you have enough information, OR if questionCount is 5. Otherwise, set it to false so you can ask more questions.
3. Keep the question very simple and easy for a patient to understand.
4. Do NOT give a diagnosis to the patient. Just ask the question.

Patient History:
${history.map(h => `Q: ${h.question}\nA: ${h.answer}`).join('\n')}

Format your response strictly as JSON:
{
  "question": "The next simple question for the patient",
  "isConclusion": boolean
}
    `;

    const result = await fetchWithRetry(model, prompt);
    const response = await result.response;
    const text = response.text();
    console.log("Gemini Raw Response:", text); // For debugging in console
    
    const parsed = JSON.parse(text);
    
    // Force minimum 4 questions so it NEVER concludes early
    if (questionCount < 4) {
      parsed.isConclusion = false;
    }
    
    // Safety fallback: if it's past 5 questions or it concluded.
    if (questionCount >= 5 || parsed.isConclusion) {
      return { question: "Thank you for the details. I will send this to the doctor now.", options: ["Finish Triage"] };
    }

    return {
      question: parsed.question,
      options: ["Yes", "No", "Not sure"]
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { question: `Error connecting to triage AI: ${error.message}. Please finish the flow.`, options: ["Finish Triage"] };
  }
}

export async function generateSummary(history) {
  if (!genAI) {
    return "Mock Summary: Patient reports severe headache starting 3 days ago. Experiences nausea. No visual disturbances.";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
Summarize the following patient triage history for a doctor to review quickly.
Make it a concise, factual summary of the reported symptoms.

CRITICAL INSTRUCTION: DO NOT provide any diagnoses, likely causes, or medical advice. You are only a scribe. It is the doctor's job to diagnose. Only summarize exactly what the patient has explicitly reported.

History:
${history.map(h => `Q: ${h.question}\nA: ${h.answer}`).join('\n')}
    `;
    const result = await fetchWithRetry(model, prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes('429')) {
      return "⚠️ **Rate Limit Exceeded**\n\nThe free tier allows 5 requests per minute. Please wait 1 minute before generating another summary.";
    }
    return "Unable to generate summary at this time.";
  }
}
