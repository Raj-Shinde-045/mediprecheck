import { db } from './firebase';
import { ref, set, get, child, serverTimestamp, runTransaction } from 'firebase/database';

// Safely generate the Daily Token: DDMMYYYY-N
export async function generateToken() {
  const date = new Date();
  const ddmmyyyy = `${String(date.getDate()).padStart(2, '0')}${String(date.getMonth() + 1).padStart(2, '0')}${date.getFullYear()}`;
  
  const counterRef = ref(db, `counters/${ddmmyyyy}`);
  let newCount = 1;
  
  await runTransaction(counterRef, (currentData) => {
    if (currentData === null) {
      newCount = 1;
      return 1;
    } else {
      newCount = currentData + 1;
      return currentData + 1;
    }
  });

  return `${ddmmyyyy}-${newCount}`;
}

// Push a completed patient to a specific doctor's queue
export async function submitPatientTriage(clinicId, doctorId, token, payload) {
  const queueRef = ref(db, `clinics/${clinicId}/doctors/${doctorId}/queue/${token}`);
  await set(queueRef, {
    ...payload,
    status: 'ready',
    timeWaiting: new Date().toLocaleTimeString(),
    createdAt: serverTimestamp()
  });
}
