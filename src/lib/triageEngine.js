// Dynamic Graph-Based Decision Tree for Triage
// Each node has a question, and routes to a different nodeID based on the answer.

const TRIAGE_GRAPH = {
  // --- RESPIRATORY (COUGH) ---
  cough_1: {
    question: "Presence of productive cough (purulent sputum or hemoptysis)?",
    yes: "cough_2_severe",
    no: "cough_2_mild"
  },
  cough_2_severe: {
    question: "Concomitant high-grade fever or rigors?",
    yes: "cough_3_pneumonia",
    no: "cough_3_chronic"
  },
  cough_2_mild: {
    question: "Duration of cough exceeding 3 weeks?",
    yes: "cough_3_chronic",
    no: "cough_3_viral"
  },
  cough_3_pneumonia: { question: "Reports of severe dyspnea or pleuritic chest pain?", yes: null, no: null },
  cough_3_chronic: { question: "History of asthma, COPD, or chronic smoking?", yes: null, no: null },
  cough_3_viral: { question: "Presence of pharyngitis or rhinorrhea?", yes: null, no: null },

  // --- NEUROLOGICAL (HEADACHE) ---
  headache_1: {
    question: "Is there sudden, severe onset (thunderclap headache)?",
    yes: "headache_2_redflag",
    no: "headache_2_routine"
  },
  headache_2_redflag: {
    question: "Presence of focal neurological deficits (numbness, weakness, aphasia)?",
    yes: "headache_3_stroke",
    no: "headache_3_aneurysm"
  },
  headache_2_routine: {
    question: "Associated with photophobia, phonophobia, or severe nausea?",
    yes: "headache_3_migraine",
    no: "headache_3_tension"
  },
  headache_3_stroke: { question: "Onset of neurological symptoms within the last 3 hours?", yes: null, no: null },
  headache_3_aneurysm: { question: "Presence of acute vision loss or diplopia?", yes: null, no: null },
  headache_3_migraine: { question: "Documented history of chronic migraines?", yes: null, no: null },
  headache_3_tension: { question: "Pain described as bilateral, band-like tension?", yes: null, no: null },

  // --- GASTROINTESTINAL (STOMACH PAIN) ---
  stomach_1: {
    question: "Pain acutely localized to the right lower quadrant (RLQ)?",
    yes: "stomach_2_appendicitis",
    no: "stomach_2_general"
  },
  stomach_2_appendicitis: {
    question: "Associated with fever and acute emesis?",
    yes: "stomach_3_severe",
    no: "stomach_3_moderate"
  },
  stomach_2_general: {
    question: "Presence of frequent diarrhea or loose stools?",
    yes: "stomach_3_bug",
    no: "stomach_3_reflux"
  },
  stomach_3_severe: { question: "Inability to tolerate oral fluids?", yes: null, no: null },
  stomach_3_moderate: { question: "Presence of rebound tenderness upon palpation?", yes: null, no: null },
  stomach_3_bug: { question: "Visible hematemesis or hematochezia (blood in stool)?", yes: null, no: null },
  stomach_3_reflux: { question: "Pain exacerbated postprandially or when supine?", yes: null, no: null },

  // --- CARDIOVASCULAR (CHEST PAIN) ---
  chest_1: {
    question: "Pain described as crushing, squeezing, or radiating to jaw/left arm?",
    yes: "chest_2_heart",
    no: "chest_2_muscular"
  },
  chest_2_heart: {
    question: "Associated diaphoresis, extreme dyspnea, or nausea?",
    yes: "chest_3_severe",
    no: "chest_3_moderate"
  },
  chest_2_muscular: {
    question: "Pain exacerbated by deep inspiration or localized palpation?",
    yes: "chest_3_pleuritic",
    no: "chest_3_other"
  },
  chest_3_severe: { question: "Known history of coronary artery disease or hypertension?", yes: null, no: null },
  chest_3_moderate: { question: "Onset of pain directly correlated with physical exertion?", yes: null, no: null },
  chest_3_pleuritic: { question: "Recent history of severe cough or upper respiratory infection?", yes: null, no: null },
  chest_3_other: { question: "Presence of severe gastroesophageal reflux?", yes: null, no: null },

  // --- FEVER / SYSTEMIC ---
  fever_1: {
    question: "Documented temperature exceeding 102°F (38.9°C)?",
    yes: "fever_2_severe",
    no: "fever_2_mild"
  },
  fever_2_severe: {
    question: "Presence of nuchal rigidity (stiff neck) or altered mental status?",
    yes: "fever_3_meningitis",
    no: "fever_3_infection"
  },
  fever_2_mild: {
    question: "Accompanied by localized symptoms (e.g., dysuria, severe pharyngitis)?",
    yes: "fever_3_infection",
    no: "fever_3_viral"
  },
  fever_3_meningitis: { question: "Presence of a non-blanching petechial rash?", yes: null, no: null },
  fever_3_infection: { question: "Duration of fever exceeding 72 hours?", yes: null, no: null },
  fever_3_viral: { question: "Recent exposure to individuals with similar febrile illness?", yes: null, no: null },

  // --- MUSCULOSKELETAL (MSK) ---
  msk_1: {
    question: "History of acute trauma, fall, or specific mechanism of injury?",
    yes: "msk_2_trauma",
    no: "msk_2_chronic"
  },
  msk_2_trauma: {
    question: "Inability to bear weight or visible structural deformity?",
    yes: "msk_3_fracture",
    no: "msk_3_sprain"
  },
  msk_2_chronic: {
    question: "Presence of joint erythema, significant swelling, or localized warmth?",
    yes: "msk_3_arthritis",
    no: "msk_3_strain"
  },
  msk_3_fracture: { question: "Presence of focal bony point tenderness?", yes: null, no: null },
  msk_3_sprain: { question: "Presence of significant ecchymosis (bruising) over the joint?", yes: null, no: null },
  msk_3_arthritis: { question: "Involvement of multiple joints symmetrically?", yes: null, no: null },
  msk_3_strain: { question: "Pain exacerbated by specific active or passive range of motion?", yes: null, no: null },

  // --- ENT (EAR, NOSE, THROAT, EYE) ---
  ent_1: {
    question: "Presence of acute vision loss, severe ocular pain, or airway compromise?",
    yes: "ent_2_redflag",
    no: "ent_2_routine"
  },
  ent_2_redflag: {
    question: "History of recent ocular trauma, chemical exposure, or anaphylaxis?",
    yes: "ent_3_trauma",
    no: "ent_3_infection"
  },
  ent_2_routine: {
    question: "Presence of purulent otic/ocular discharge or severe facial pressure?",
    yes: "ent_3_infection",
    no: "ent_3_mild"
  },
  ent_3_trauma: { question: "Visible hyphema or penetrating foreign body?", yes: null, no: null },
  ent_3_infection: { question: "Concomitant high-grade fever or significant periorbital edema?", yes: null, no: null },
  ent_3_mild: { question: "Symptoms primarily consistent with allergic rhinitis (sneezing, clear rhinorrhea)?", yes: null, no: null },

  // --- GENITOURINARY (GU) ---
  gu_1: {
    question: "Presence of severe dysuria, gross hematuria, or acute flank pain?",
    yes: "gu_2_severe",
    no: "gu_2_mild"
  },
  gu_2_severe: {
    question: "Associated with high-grade fever, rigors, or intractable emesis?",
    yes: "gu_3_pyelonephritis",
    no: "gu_3_stone"
  },
  gu_2_mild: {
    question: "Presence of increased urinary frequency, urgency, or hesitancy?",
    yes: "gu_3_uti",
    no: "gu_3_other"
  },
  gu_3_pyelonephritis: { question: "Presence of severe costovertebral angle (CVA) tenderness?", yes: null, no: null },
  gu_3_stone: { question: "Pain described as severe, colicky, and radiating to the groin?", yes: null, no: null },
  gu_3_uti: { question: "Presence of malodorous or cloudy urine?", yes: null, no: null },
  gu_3_other: { question: "Presence of abnormal urethral or vaginal discharge?", yes: null, no: null },

  // --- DERMATOLOGICAL (SKIN) ---
  skin_1: {
    question: "Rash characterized by rapid spread, blistering, or mucosal involvement?",
    yes: "skin_2_redflag",
    no: "skin_2_routine"
  },
  skin_2_redflag: {
    question: "Associated with facial edema, wheezing, or significant dysphagia?",
    yes: "skin_3_anaphylaxis",
    no: "skin_3_infection"
  },
  skin_2_routine: {
    question: "Rash is intensely pruritic (itchy) or localized to a specific dermatome?",
    yes: "skin_3_local",
    no: "skin_3_viral"
  },
  skin_3_anaphylaxis: { question: "Known history of severe allergies or recent exposure to new allergen?", yes: null, no: null },
  skin_3_infection: { question: "Presence of concomitant fever, localized extreme pain, or necrotic tissue?", yes: null, no: null },
  skin_3_local: { question: "Recent exposure to new topical agents, plants, or insect bites?", yes: null, no: null },
  skin_3_viral: { question: "Rash described as diffuse, maculopapular, and non-blanching?", yes: null, no: null },

  // --- DEFAULT / GENERAL ---
  default_1: {
    question: "Acute onset of symptoms within the preceding 24 hours?",
    yes: "default_2_acute",
    no: "default_2_chronic"
  },
  default_2_acute: {
    question: "Patient reports pain severity > 7/10?",
    yes: "default_3_severe",
    no: "default_3_moderate"
  },
  default_2_chronic: {
    question: "Recurrence of previously documented identical symptoms?",
    yes: "default_3_recurring",
    no: "default_3_new"
  },
  default_3_severe: { question: "Symptoms causing significant impairment of activities of daily living (ADLs)?", yes: null, no: null },
  default_3_moderate: { question: "Currently taking prescription pharmacotherapy for this condition?", yes: null, no: null },
  default_3_recurring: { question: "Prior medical consultation sought for this specific complaint?", yes: null, no: null },
  default_3_new: { question: "Progressive exacerbation of symptoms over time?", yes: null, no: null },
};

// Map categories to their starting nodes
const CATEGORY_START_NODES = {
  headache: "headache_1",
  cough: "cough_1",
  stomach: "stomach_1",
  chest: "chest_1",
  fever: "fever_1",
  msk: "msk_1",
  ent: "ent_1",
  gu: "gu_1",
  skin: "skin_1",
  default: "default_1"
};

// Engine state tracking
export async function generateNextQuestion(history) {
  // Simulate rapid network delay for realistic "Analyzing" feel
  await new Promise(res => setTimeout(res, 500));

  // The very first history item is always the receptionist's initial intake form
  // It contains { category, age, sex, node: starting_node }
  const intake = history[0];
  
  // Find the last actual question asked
  const lastInteraction = history[history.length - 1];

  // If this is the very first question generation
  if (history.length === 1) {
    const startNodeId = CATEGORY_START_NODES[intake.category] || CATEGORY_START_NODES.default;
    return {
      nodeId: startNodeId,
      question: TRIAGE_GRAPH[startNodeId].question,
      options: ["Yes", "No", "Not sure"]
    };
  }

  // Determine the next node based on the previous answer
  const previousNodeId = lastInteraction.nodeId;
  const previousNode = TRIAGE_GRAPH[previousNodeId];
  
  if (!previousNode) return concludeTriage();

  let nextNodeId = null;
  if (lastInteraction.answer === 'Yes') {
    nextNodeId = previousNode.yes;
  } else if (lastInteraction.answer === 'No') {
    nextNodeId = previousNode.no;
  } else {
    // If 'Not sure', default to the 'No' path to be conservative, or 'Yes' if red flag. 
    // For simplicity, we'll route to 'No'
    nextNodeId = previousNode.no;
  }

  // If we hit a leaf node (no next node), or we've asked 4 questions, conclude.
  if (!nextNodeId || history.length > 4) {
    return concludeTriage();
  }

  const nextNode = TRIAGE_GRAPH[nextNodeId];
  return {
    nodeId: nextNodeId,
    question: nextNode.question,
    options: ["Yes", "No", "Not sure"]
  };
}

function concludeTriage() {
  return {
    nodeId: "end",
    question: "Triage complete. The summary has been sent to the doctor's queue.",
    options: ["Finish Triage"]
  };
}

export async function generateSummary(history) {
  // Fast generation of summary
  await new Promise(res => setTimeout(res, 300));

  const intake = history[0];
  const qna = history.slice(1).filter(item => item.nodeId !== 'end');

  return {
    patientDetails: `${intake.age} year-old ${intake.sex}`,
    chiefComplaint: intake.category.toUpperCase(),
    analysis: qna
  };
}
