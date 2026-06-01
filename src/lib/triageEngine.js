import Groq from 'groq-sdk';

const apiKey = import.meta.env.VITE_GROQ_API_KEY;
// dangerouslyAllowBrowser is required for client-side execution in prototypes
const groq = apiKey ? new Groq({ apiKey, dangerouslyAllowBrowser: true }) : null;
const MODEL = "llama-3.3-70b-versatile";

export async function generateNextQuestion(history) {
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

  const systemPrompt = `You are an expert clinical triage AI. Your job is to ask ONE highly professional, clinical follow-up question to determine the severity and nature of the patient's chief complaint.
Patient Context: ${intake.age}yo ${intake.sex}. Complaint: ${intake.category.toUpperCase()}.
Vitals: BP ${intake.vitals.bp}, HR ${intake.vitals.hr}, Temp ${intake.vitals.temp}, O2 ${intake.vitals.o2}.
Allergies: ${intake.allergies}. Meds: ${intake.medications}.

Previous Questions:
${transcript}

Output ONLY a JSON object in this exact format:
{
  "question": "The professional medical question to ask",
  "options": ["Yes", "No", "Not sure"]
}
Limit options to exactly 3 short answers. Do not output any markdown or explanation, just the raw JSON object.`;

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
Transcript:
${transcript}

Analyze the transcript and generate a structured JSON output with the following format:
{
  "patientDetails": "${intake.age} year-old ${intake.sex}",
  "chiefComplaint": "${intake.category.toUpperCase()}",
  "analysis": [
    {"question": "Q1", "answer": "A1"}
  ],
  "verdict": "Provide a 2-3 sentence 'Junior Doctor Verdict'. State the top 3 differential diagnoses (DDx) based on the symptoms and vitals. Highlight any immediate red flags."
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
      verdict: "AI Error: Could not generate differential diagnosis due to API failure."
    };
  }
}
