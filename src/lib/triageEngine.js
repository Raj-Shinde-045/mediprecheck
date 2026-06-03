import Groq from 'groq-sdk';

const apiKey = import.meta.env.VITE_GROQ_API_KEY;
// dangerouslyAllowBrowser is required for client-side execution in prototypes
const groq = apiKey ? new Groq({ apiKey, dangerouslyAllowBrowser: true }) : null;
const MODEL = "llama-3.3-70b-versatile";

export async function generateNextQuestion(history, language = "English") {
  if (!groq) throw new Error("Groq API key not found in .env.local");
  
  // Cap at 4 questions to save time, then finish
  if (history.length > 4) {
    return {
      nodeId: "end",
      question: "Triage complete. The summary and Junior Doctor Verdict have been sent to the doctor.",
      options: ["Finish Triage"]
    };
  }

  const intake = history[0];
  let transcript = "";
  for (let i = 1; i < history.length; i++) {
    transcript += `Q: ${history[i].question}\nA: ${history[i].answer}\n`;
  }

  const isFirstQuestion = history.length === 1;

  const systemPrompt = `You are an expert clinical triage AI. Your job is to ask ONE highly professional, clinical follow-up question to determine the severity and nature of the patient's chief complaint.
Patient Context: ${intake.age}yo ${intake.sex}. Complaint: ${intake.category.toUpperCase()}.
Vitals: BP ${intake.vitals.bp}, HR ${intake.vitals.hr}, Temp ${intake.vitals.temp}, O2 ${intake.vitals.o2}.

Previous Questions:
${transcript ? transcript : "None yet. This is the first question."}

Instructions:
1. Ask exactly ONE follow-up question.
2. ${isFirstQuestion 
  ? "CRITICAL: Because this is the VERY FIRST question, DO NOT ask Yes/No red-flag questions yet. Your goal is to narrow down the chief complaint. Ask a clarifying multiple-choice question to pinpoint the exact location, type, or primary nature of the symptom. Provide 3 to 4 specific symptom options based on the category."
  : "Now that the primary symptom is established, prioritize ruling out IMMEDIATE life-threatening conditions or gauging severity. You can use Yes/No or specific symptom descriptors."}
3. CRITICAL: The patient is NOT a doctor. You MUST translate all medical concepts into extremely simple, 5th-grade layman's terms. Do not use words like 'diaphoresis' (use 'sweating'), 'syncope' (use 'fainting'), or 'dyspnea' (use 'trouble breathing').
4. CRITICAL AVOIDANCE: Do NOT ask overly alarming or dramatic questions (e.g., "Do you feel like you might pass out?" or "Are you dying?"). Do not jump to extremely rare worst-case scenarios unless the patient's vitals or age strictly warrant it (e.g., do not ask a 20yo with neck pain if they are having a heart attack). Keep the tone calm, friendly, and conversational.
5. CRITICAL LANGUAGE: You MUST ask the question and provide the options in ${language}. If ${language} is not English, ensure accurate translation.

Output ONLY a JSON object in this exact format:
{
  "question": "The extremely simple, patient-friendly question to ask translated into ${language}",
  "options": ["Option 1 in ${language}", "Option 2 in ${language}", "Option 3 in ${language}"] // limit to 2-4 short options
}
Do not output any markdown or explanation, just the raw JSON object.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "system", content: systemPrompt }],
      model: MODEL,
      response_format: { type: "json_object" },
      temperature: 0.2, // Low temp for clinical consistency
    });

    const response = JSON.parse(chatCompletion.choices[0].message.content);
    return {
      nodeId: `ai_q_${history.length}`,
      question: response.question,
      options: response.options || ["Yes", "No", "Not sure"]
    };
  } catch (err) {
    console.error("Groq Error", err);
    return {
      nodeId: "error",
      question: "Error connecting to AI engine. Please finish triage manually.",
      options: ["Finish Triage"]
    };
  }
}

export async function generateSummary(history) {
  if (!groq) throw new Error("Groq API key not found");

  const intake = history[0];
  let transcript = "";
  let analysisArray = [];
  for (let i = 1; i < history.length; i++) {
    if (history[i].nodeId !== 'end') {
      transcript += `Q: ${history[i].question}\nA: ${history[i].answer}\n`;
      analysisArray.push({ question: history[i].question, answer: history[i].answer });
    }
  }

  const systemPrompt = `You are a Junior Doctor summarizing a triage encounter for the Attending Physician.
Patient Context: ${intake.age}yo ${intake.sex}. Chief Complaint: ${intake.category.toUpperCase()}.
Vitals: BP ${intake.vitals.bp}, HR ${intake.vitals.hr}, Temp ${intake.vitals.temp}, O2 ${intake.vitals.o2}.
Transcript (May be in another language):
${transcript}

CRITICAL REQUIREMENT:
The Attending Physician only reads English. You MUST translate the entire transcript into English and output the ENTIRE JSON response strictly in English.

Analyze the transcript and generate a structured JSON output with the following format:
{
  "patientDetails": "${intake.age} year-old ${intake.sex}",
  "chiefComplaint": "${intake.category.toUpperCase()}",
  "analysis": [
    {"question": "Q1 translated to English", "answer": "A1 translated to English"}
  ],
  "riskLevel": "Low", // Evaluate the transcript and vitals. Value MUST be one of: "Low", "Medium", "High", "Critical"
  "redFlags": ["List any specific alarming symptoms or abnormal vitals indicating a medical emergency IN ENGLISH", "Leave array empty if no red flags are present"],
  "verdict": "Provide a concise 2-3 sentence 'Junior Doctor Verdict' IN ENGLISH. State the top 3 differential diagnoses (DDx) based on the symptoms and vitals. Highlight any immediate red flags. CRITICAL INSTRUCTION: You MUST wrap ONLY the specific Differential Diagnoses in **double asterisks** so they stand out (e.g. **Pulmonary Embolism**, **Pneumonia**).",
  "dietaryAdvice": {
    "toEat": ["List 2-3 specific foods or dietary habits the patient SHOULD consume to aid recovery based on the suspected condition IN ENGLISH"],
    "toAvoid": ["List 2-3 specific foods or habits the patient SHOULD AVOID IN ENGLISH"]
  },
  "diseaseProgression": [
    { "day": 1, "prediction": "Prediction for Day 1 if left untreated IN ENGLISH..." },
    { "day": 2, "prediction": "Prediction for Day 2 if left untreated IN ENGLISH..." },
    { "day": 3, "prediction": "Prediction for Day 3 if left untreated IN ENGLISH..." },
    { "day": 4, "prediction": "Prediction for Day 4 if left untreated IN ENGLISH..." }
  ]
}
Output ONLY the raw JSON object.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "system", content: systemPrompt }],
      model: MODEL,
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const response = JSON.parse(chatCompletion.choices[0].message.content);
    return response;
  } catch (err) {
    console.error("Groq Summary Error", err);
    return {
      patientDetails: `${intake.age} year-old ${intake.sex}`,
      chiefComplaint: intake.category.toUpperCase(),
      analysis: analysisArray,
      riskLevel: "Unknown",
      redFlags: ["System Error - Needs Manual Triage"],
      verdict: "AI Error: Could not generate differential diagnosis due to API failure."
    };
  }
}
