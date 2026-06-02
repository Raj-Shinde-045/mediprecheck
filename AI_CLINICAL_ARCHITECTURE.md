# 🧠 MediPreCheck AI Clinical Engine

This document details the architecture, prompting strategies, and clinical constraints used by the MediPreCheck AI Engine (powered by Groq / LLaMA-3). 

Because this application operates in a healthcare context, the AI's behavior is strictly constrained using explicit prompt engineering to ensure safety, empathy, and clinical relevance.

---

## 1. Dynamic Question Generation (The Kiosk Interview)
The AI does not run a static script. It acts as an intelligent, dynamic triage nurse.

### Layman Translation (5th-Grade Reading Level)
**Constraint:** Patients are not doctors. If asked if they have "diaphoresis" or "syncope", they will guess, ruining the data quality.
**AI Behavior:** The AI is strictly prompted to translate all medical concepts into a 5th-grade reading level. It will silently process clinical data in the background, but the actual question displayed on the kiosk will use simple, empathetic language (e.g., "Are you sweating more than usual?" instead of "Are you experiencing diaphoresis?").

### Demographic & Vital Sign Context
**Constraint:** A 20-year-old male with chest pain is treated very differently than an 80-year-old female with chest pain. 
**AI Behavior:** Before the AI generates a single question, it is explicitly fed the patient's Age, Sex, and raw Vitals (BP, Heart Rate, Temp, O2). The AI uses this foundational context to instantly adjust its risk algorithms. For example, if a patient has a high heart rate (tachycardia) recorded at the front desk, the Kiosk AI will immediately escalate its questioning toward cardiovascular issues.

### The "Funnel" Questioning Technique
*   **Question 1 (Broad):** The AI is forbidden from asking Yes/No questions on the first prompt. Its goal is to narrow down the chief complaint. It provides 3-4 specific symptom options based on the initial category (e.g., if ENT: 'Ear pain', 'Sore throat', 'Sinus pressure').
*   **Questions 2+ (Narrowing):** Once the primary symptom is established, the AI pivots to rule out immediate life-threatening conditions (red flags) and gauge severity.

---

## 2. The Clinical Summary (Junior Doctor Verdict)
When the patient finishes the triage, the AI switches personas from an "Empathetic Nurse" to a "Junior Doctor presenting to an Attending Physician."

**AI Behavior:** It synthesizes the patient's demographic data, raw vitals, and their answers from the Kiosk into a highly dense, professional medical summary. 
**Goal:** To allow the doctor to understand the entire patient context in less than 15 seconds before the patient speaks a single word.

---

## 3. Differential Diagnosis (DDx)
The AI is instructed to act as a diagnostic assistant, not a definitive authority. 

**AI Behavior:** Based on the clinical summary, it generates an array of up to 3 possible conditions. 
*   It assigns a **Confidence Percentage** to each condition.
*   It provides a **Clinical Rationale** explaining exactly *why* it suspects this condition based on the patient's specific answers and vitals.
*   *Safety Mechanism:* The AI does not show this to the patient. It is strictly a "second opinion" tool for the reviewing doctor.

---

## 4. The AI Time Machine (Symptom Progression)
One of the most unique features of MediPreCheck is the predictive "Time Machine."

**AI Behavior:** The AI analyzes the highest-confidence diagnosis and projects the natural physiological progression of the illness over the next 4 days, assuming **no medical intervention occurs**.
**Goal:** This provides the doctor with immediate talking points regarding the urgency of treatment and patient compliance (e.g., *"If you don't start these antibiotics today, by Day 3 you will likely develop a severe fever."*).

---

## 5. Dietary & Lifestyle Engine
Because doctors are often pressed for time, they rarely have the opportunity to write out detailed nutritional advice for standard complaints.

**AI Behavior:** The AI generates a customized, immediate action plan based on the final diagnosis, split into two strict lists:
1.  **Recommended to Consume:** Specific foods, liquids, or habits to aid recovery.
2.  **Recommended to Avoid:** Specific triggers that will exacerbate the condition.

This allows the doctor to instantly recite or print holistic care advice alongside pharmacological prescriptions.
