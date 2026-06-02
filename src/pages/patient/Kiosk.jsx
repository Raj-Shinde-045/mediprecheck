import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loader2, CheckCircle2, Bot, ClipboardList, Activity } from 'lucide-react';
import { generateNextQuestion, generateSummary } from '../../lib/triageEngine';
import { generateToken, submitPatientTriage } from '../../lib/db';
import { db } from '../../lib/firebase';
import { ref, get } from 'firebase/database';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export function Kiosk() {
  const chatEndRef = useRef(null);
  
  const [token, setToken] = useState('');
  const [history, setHistory] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { currentUser } = useAuth();
  
  // Receptionist Intake State
  const [doctorId, setDoctorId] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('Male');
  const [allergies, setAllergies] = useState('None');
  const [medications, setMedications] = useState('None');
  
  // Vitals
  const [bp, setBp] = useState('');
  const [hr, setHr] = useState('');
  const [temp, setTemp] = useState('');
  const [o2, setO2] = useState('');

  const [category, setCategory] = useState('');

  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    async function loadDoctors() {
      if (!currentUser) return;
      const docsRef = ref(db, `clinics/${currentUser.uid}/doctorsList`);
      const snapshot = await get(docsRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const docsList = Object.keys(data).map(key => ({ id: key, name: data[key].name }));
        setDoctors(docsList);
        if (docsList.length > 0) setDoctorId(docsList[0].id);
      }
    }
    loadDoctors();
  }, [currentUser]);

  const categories = [
    { id: 'chest', label: 'Cardiology / Chest Pain (URGENT)' },
    { id: 'headache', label: 'Neurology / Headache' },
    { id: 'cough', label: 'Respiratory / Breathing' },
    { id: 'stomach', label: 'Gastrointestinal / Abdominal' },
    { id: 'fever', label: 'Systemic Infection / Fever' },
    { id: 'msk', label: 'Orthopedics / Joint Pain' },
    { id: 'trauma', label: 'Trauma / Acute Injury (URGENT)' },
    { id: 'ent', label: 'Ear, Nose, & Throat (ENT)' },
    { id: 'eye', label: 'Ophthalmology / Vision' },
    { id: 'gu', label: 'Genitourinary / Pelvic Pain' },
    { id: 'skin', label: 'Dermatology / Rash' },
    { id: 'psych', label: 'Psychiatric / Mental Health' },
    { id: 'default', label: 'Other / General Malaise' },
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, currentQuestion, isThinking]);

  const startTriage = async (e) => {
    e.preventDefault();
    if (!age || !category) return;

    const intakeData = { 
      category, age, sex, allergies, medications, 
      vitals: { 
        bp: bp || 'Not recorded', 
        hr: hr || 'Not recorded', 
        temp: temp || 'Not recorded', 
        o2: o2 || 'Not recorded' 
      } 
    };
    
    const initialHistory = [intakeData];
    setHistory(initialHistory);
    
    setIsThinking(true);
    const nextQ = await generateNextQuestion(initialHistory);
    setIsThinking(false);
    setCurrentQuestion(nextQ);
  };

  const handleAnswer = async (answer) => {
    if (answer === "Finish Triage") {
      setIsSubmitting(true);
      try {
        // 1. Generate Daily Token (DDMMYYYY-N)
        const newToken = await generateToken();
        setToken(newToken);

        // 2. Generate final summary
        const finalSummary = await generateSummary(history);

        // 3. Push to Firebase
        await submitPatientTriage(currentUser.uid, doctorId, newToken, {
          history,
          summary: finalSummary
        });

        setIsFinished(true);
      } catch (err) {
        console.error("Failed to submit to Firebase", err);
        alert("Network error: Could not submit to database.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
    
    const newHistory = [...history, { nodeId: currentQuestion.nodeId, question: currentQuestion.question, answer }];
    setHistory(newHistory);
    setCurrentQuestion(null);
    
    setIsThinking(true);
    const nextQ = await generateNextQuestion(newHistory);
    setIsThinking(false);
    setCurrentQuestion(nextQ);
  };

  if (isFinished) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex h-[80vh] items-center justify-center">
        <Card glass className="max-w-md text-center p-12 border-green-500/30 shadow-2xl">
          <CheckCircle2 className="w-28 h-28 text-green-500 mx-auto mb-8 drop-shadow-lg" />
          <h2 className="text-4xl font-black mb-4">Patient Registered</h2>
          <p className="text-muted-foreground">Assigned to: {doctors.find(d => d.id === doctorId)?.name}</p>
          <p className="text-xl text-muted-foreground mb-8 mt-4">
            Token Number: <span className="font-bold text-5xl text-primary block mt-4">{token}</span>
          </p>
          <Button onClick={() => window.location.reload()} className="w-full h-14 text-lg rounded-xl">
            Register Next Patient
          </Button>
        </Card>
      </motion.div>
    );
  }

  // --- RECEPTIONIST INTAKE STATE ---
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[90vh] py-12 px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
        
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-4xl z-10">
          <Card glass className="p-8 shadow-2xl border-white/10 backdrop-blur-2xl bg-background/80">
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/20 p-4 rounded-2xl">
                  <ClipboardList className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight">Reception Intake</h1>
                  <p className="text-muted-foreground text-lg">Record Vitals & Start Triage</p>
                </div>
              </div>
              <div className="text-right">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Assign Doctor</label>
                <select 
                  className="bg-background border border-primary/20 text-foreground text-lg rounded-lg px-4 py-2"
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                >
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>

            <form onSubmit={startTriage} className="space-y-8">
              
              {/* Demographics & History */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Age</label>
                  <Input type="number" placeholder="45" value={age} onChange={(e) => setAge(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Sex</label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={sex} onChange={(e) => setSex(e.target.value)}>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Known Allergies</label>
                  <Input type="text" value={allergies} onChange={(e) => setAllergies(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Current Meds</label>
                  <Input type="text" value={medications} onChange={(e) => setMedications(e.target.value)} />
                </div>
              </div>

              {/* Vitals Section */}
              <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Vital Signs</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Blood Pressure</label>
                    <Input type="text" placeholder="120/80" value={bp} onChange={(e) => setBp(e.target.value)} className="font-mono" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Heart Rate (bpm)</label>
                    <Input type="number" placeholder="75" value={hr} onChange={(e) => setHr(e.target.value)} className="font-mono" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Temp (°F)</label>
                    <Input type="number" step="0.1" placeholder="98.6" value={temp} onChange={(e) => setTemp(e.target.value)} className="font-mono" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">O2 Sat (%)</label>
                    <Input type="number" placeholder="99" value={o2} onChange={(e) => setO2(e.target.value)} className="font-mono" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Chief Complaint Category</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {categories.map(cat => (
                    <Button
                      key={cat.id}
                      type="button"
                      variant={category === cat.id ? 'primary' : 'outline'}
                      className={`h-auto py-3 text-sm justify-start px-4 flex-col items-start text-left ${category === cat.id ? 'shadow-lg shadow-primary/20 scale-[1.02]' : 'hover:bg-primary/10'}`}
                      onClick={() => setCategory(cat.id)}
                    >
                      {cat.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={!age || !category} 
                className="w-full h-16 text-xl mt-8 font-bold rounded-2xl shadow-xl hover:scale-[1.01] transition-transform"
              >
                Start AI Triage
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    );
  }

  // --- CHAT UI STATE ---
  return (
    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto mt-6">
      <div className="flex justify-between items-center mb-6 px-4">
        <div className="flex items-center gap-4">
          <div className="bg-primary/20 p-3 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.6)] animate-pulse border border-primary/30">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Triage Assessment</h1>
            <p className="text-muted-foreground text-sm">
              Asking questions for: <span className="font-bold text-primary">{category.toUpperCase()}</span>
            </p>
          </div>
        </div>
      </div>

      <Card glass className="overflow-hidden shadow-2xl border-white/10 flex flex-col h-[70vh]">
        <CardContent className="p-0 flex flex-col h-full relative">
          
          <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 bg-gradient-to-b from-transparent to-background/50">
            <AnimatePresence initial={false}>
              {history.map((item, i) => {
                if (i === 0) return null; // Skip showing intake data in chat
                return (
                  <motion.div key={`hist-${i}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="flex justify-start">
                      <div className="bg-muted/80 backdrop-blur-sm px-6 py-4 rounded-3xl rounded-tl-none max-w-[85%] text-lg border border-white/5">
                        {item.question}
                      </div>
                    </div>
                    {item.answer && (
                      <div className="flex justify-end">
                        <div className="bg-primary text-primary-foreground px-6 py-4 rounded-3xl rounded-tr-none max-w-[85%] text-lg shadow-lg font-medium">
                          {item.answer}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {currentQuestion && !isThinking && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                  <div className="bg-muted/80 backdrop-blur-sm px-6 py-4 rounded-3xl rounded-tl-none max-w-[85%] text-lg border border-primary/20 ring-1 ring-primary/10">
                    {currentQuestion.question}
                  </div>
                </motion.div>
              )}

              {isThinking && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="flex justify-start">
                  <div className="bg-muted/60 backdrop-blur-md px-6 py-5 rounded-3xl rounded-tl-none flex items-center space-x-2 h-14 border border-white/5 shadow-sm">
                    <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }} className="w-2.5 h-2.5 bg-primary/70 rounded-full" />
                    <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.15, ease: "easeInOut" }} className="w-2.5 h-2.5 bg-primary/70 rounded-full" />
                    <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.3, ease: "easeInOut" }} className="w-2.5 h-2.5 bg-primary/70 rounded-full" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          <div className="p-6 md:p-8 border-t border-white/10 bg-background/80 backdrop-blur-xl shrink-0 z-10">
            {currentQuestion && !isThinking && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentQuestion.options.map((opt) => (
                  <Button 
                    key={opt} 
                    disabled={isSubmitting}
                    variant={opt === 'Yes' || opt === 'Finish Triage' ? 'primary' : opt === 'No' ? 'destructive' : 'secondary'}
                    className={`h-16 text-xl rounded-2xl shadow-md transition-all hover:-translate-y-1 ${opt === 'Finish Triage' ? 'md:col-span-3 h-20 text-2xl font-bold bg-gradient-to-r from-primary to-blue-600' : ''}`}
                    onClick={() => handleAnswer(opt)}
                  >
                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : opt}
                  </Button>
                ))}
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
