import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const googleProvider = new GoogleAuthProvider();

  async function register(email, password, clinicName) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create clinic document in Realtime Database
    await set(ref(db, `clinics/${user.uid}`), {
      email,
      clinicName,
      role: 'clinic_staff',
      createdAt: new Date().toISOString()
    });

    return user;
  }

  async function signInWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if clinic record exists, if not create one
    const clinicRef = ref(db, `clinics/${user.uid}`);
    const snapshot = await get(clinicRef);
    
    if (!snapshot.exists()) {
      await set(clinicRef, {
        email: user.email,
        clinicName: user.displayName || 'Google Clinic',
        role: 'clinic_staff',
        createdAt: new Date().toISOString()
      });
    }
    
    return user;
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    register,
    signInWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
