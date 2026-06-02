# ⚕️ MediPreCheck

**An ultra-fast, AI-powered patient triage and queue management system designed to eliminate waiting room bottlenecks and supercharge clinic efficiency.**

![MediPreCheck Banner](public/vite.svg)

MediPreCheck acts as a tireless "Junior Doctor" sitting in your waiting room. By the time a patient walks into the doctor's office, the system has already conducted a full clinical interview, generated a beautiful triage summary, and predicted the next 4 days of symptom progression using cutting-edge AI.

---

## ✨ Key Features

### 🧑‍⚕️ For the Patient (The Kiosk)
*   **Simple Intake:** Reception quickly enters vitals (BP, HR, Temp, O2) and assigns a doctor.
*   **Conversational AI Triage:** The patient chats with a friendly AI nurse that translates complex medical concepts into 5th-grade reading level questions.
*   **Dynamic Questioning:** The AI dynamically adjusts its follow-up questions based on the patient's chief complaint to zero in on red-flag symptoms.

### 🩺 For the Doctor (The Dashboard)
*   **Live Queue Sync:** A real-time, synchronized queue that organizes patients by status (Waiting, In-Consult, On-Hold, Completed) and by Date.
*   **Automated Triage Summaries:** No more manual history-taking. The AI provides a flawless clinical summary, a structured Differential Diagnosis (DDx), and flags critical warnings.
*   **AI Time Machine:** A unique predictive model that forecasts the patient's condition over the next 4 days if left untreated.
*   **Dietary & Lifestyle Engine:** Automatically generated lists of "Foods to Consume" and "Foods to Avoid" tailored perfectly to the patient's specific ailment.

### 🏢 For the Clinic (Command Center)
*   **Multi-Tenant Architecture:** Built from the ground up for scale. Every clinic gets an isolated Firebase data bucket, ensuring zero overlap between different medical practices.
*   **Dynamic Doctor Roster:** Manage clinic doctors easily, with custom avatars and profile pictures that sync instantly across the Kiosk and Doctor portals.

---

## 🛠️ Technology Stack

*   **Frontend Framework:** React 18 (Vite)
*   **Styling:** Tailwind CSS + custom Glassmorphism aesthetics
*   **Animations:** Framer Motion
*   **Database & Auth:** Firebase Realtime Database & Firebase Authentication
*   **AI Inference:** Groq SDK (powered by `llama-3.3-70b-versatile`)
*   **Icons:** Lucide React

---

## 🚀 Getting Started

### 1. Prerequisites
You will need Node.js installed, along with API keys for Firebase and Groq.

### 2. Installation
Clone the repository and install the dependencies:
```bash
git clone https://github.com/your-username/mediprecheck.git
cd mediprecheck
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and add your keys:
```env
# Groq AI Key
VITE_GROQ_API_KEY=your_groq_api_key_here

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Run the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:5173` to view the app!

---

## 🔒 Security Notice
*Note: Currently, the Groq API calls are executed directly from the browser for prototyping speed (`dangerouslyAllowBrowser: true`). Before deploying to a public production environment, it is highly recommended to move the Groq API call into a secure backend (such as a Node.js server or Firebase Cloud Function) to protect your API key.*
