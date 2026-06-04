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
import { useSubscription } from '../../contexts/SubscriptionContext';
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
  const { isActive, isGrowth, isPro, loading: subLoading } = useSubscription();
  const [patientCount, setPatientCount] = useState(0);
  
  const [doctorId, setDoctorId] = useState('');
  const [isDocDropdownOpen, setIsDocDropdownOpen] = useState(false);
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('Male');
  const [sessionLanguage, setSessionLanguage] = useState('English');
  
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
        const docsList = Object.keys(data).map(key => ({ 
          id: key, 
          name: data[key].name,
          profilePic: data[key].profilePic || ''
        }));
        setDoctors(docsList);
        if (docsList.length > 0) setDoctorId(docsList[0].id);
      }
    }
    
    async function loadDefaultLanguage() {
      if (!currentUser) return;
      const settingsRef = ref(db, `clinics/${currentUser.uid}/settings/defaultLanguage`);
      const snapshot = await get(settingsRef);
      if (snapshot.exists()) {
        setSessionLanguage(snapshot.val());
      }
    }

    async function loadPatientCount() {
      if (!currentUser) return;
      const date = new Date();
      const yyyyMM = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const countRef = ref(db, `clinics/${currentUser.uid}/stats/${yyyyMM}/patientCount`);
      const snapshot = await get(countRef);
      if (snapshot.exists()) {
        setPatientCount(snapshot.val());
      } else {
        setPatientCount(0);
      }
    }

    loadDoctors();
    loadDefaultLanguage();
    loadPatientCount();
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
      category, age, sex, 
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
    const nextQ = await generateNextQuestion(initialHistory, sessionLanguage, isPro);
    setIsThinking(false);
    setCurrentQuestion(nextQ);
  };

  const handleAnswer = async (answer) => {
    if (answer === "Finish Triage") {
      setIsSubmitting(true);
      try {
        // 1. Generate Daily Token (DDMMYYYY-N) scoped to specific doctor
        const newToken = await generateToken(currentUser.uid, doctorId);
        setToken(newToken);

        // 2. Generate final summary
        const finalSummary = await generateSummary(history, isPro);

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
    const nextQ = await generateNextQuestion(newHistory, sessionLanguage, isPro);
    setIsThinking(false);
    setCurrentQuestion(nextQ);
  };

  if (isFinished) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex h-[80vh] items-center justify-center">
        <Card glass className="max-w-md text-center p-6 md:p-12 border-green-500/30 shadow-2xl mx-4">
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

  // --- SUBSCRIPTION GATING ---
  if (subLoading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!isActive) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] px-4">
        <Card glass className="max-w-md w-full p-8 text-center border-red-500/30">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-500 mb-2">Subscription Required</h2>
          <p className="text-muted-foreground mb-6">You need an active subscription to register patients.</p>
          <Button onClick={() => window.location.href = '/settings'} className="w-full">
            View Plans
          </Button>
        </Card>
      </div>
    );
  }

  if (isGrowth && patientCount >= 50) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] px-4">
        <Card glass className="max-w-md w-full p-8 text-center border-orange-500/30">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-orange-500 mb-2">Limit Reached</h2>
          <p className="text-muted-foreground mb-6">You have reached the limit of 50 patients per month on the Growth plan.</p>
          <Button onClick={() => window.location.href = '/settings'} className="w-full bg-orange-600 hover:bg-orange-700">
            Upgrade to Pro
          </Button>
        </Card>
      </div>
    );
  }

  // --- RECEPTIONIST INTAKE STATE ---
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[90vh] py-12 px-4 relative overflow-hidden">
        <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
        
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-4xl z-10">
          <Card glass className="p-8 shadow-2xl border-white/10 backdrop-blur-2xl bg-background/80">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 border-b border-white/10 pb-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/20 p-4 rounded-2xl">
                  <ClipboardList className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight">Reception Intake</h1>
                  <p className="text-muted-foreground text-lg">Record Vitals & Start Triage</p>
                </div>
              </div>
              <div className="text-left md:text-right relative w-full md:w-auto">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Assign Doctor</label>
                
                <div className="relative inline-block text-left w-full min-w-0 md:min-w-[240px]">
                  <div 
                    onClick={() => setIsDocDropdownOpen(!isDocDropdownOpen)}
                    className="flex items-center justify-between bg-background border border-primary/30 text-foreground text-lg rounded-xl px-4 py-3 cursor-pointer hover:border-primary/60 transition-colors shadow-sm"
                  >
                    <div className="flex items-center">
                      {doctors.find(d => d.id === doctorId)?.profilePic ? (
                        <img src={doctors.find(d => d.id === doctorId)?.profilePic} alt="Doc" className="w-8 h-8 rounded-full object-cover mr-3 border border-white/10" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm mr-3">
                          {doctors.find(d => d.id === doctorId)?.name?.replace('Dr. ', '').charAt(0)?.toUpperCase()}
                        </div>
                      )}
                      <span className="font-bold">{doctors.find(d => d.id === doctorId)?.name || 'Select Doctor'}</span>
                    </div>
                    <span className="ml-2 text-muted-foreground text-sm">▼</span>
                  </div>

                  {isDocDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-full bg-background border border-white/10 rounded-xl shadow-2xl z-50 max-h-[300px] overflow-y-auto">
                      {doctors.map(doc => (
                        <div 
                          key={doc.id}
                          onClick={() => { setDoctorId(doc.id); setIsDocDropdownOpen(false); }}
                          className={`flex items-center p-3 cursor-pointer transition-colors ${doctorId === doc.id ? 'bg-primary/20 text-primary' : 'hover:bg-white/5'}`}
                        >
                          {doc.profilePic ? (
                            <img src={doc.profilePic} alt={doc.name} className="w-8 h-8 rounded-full object-cover mr-3 border border-white/10" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm mr-3">
                              {doc.name.replace('Dr. ', '').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="font-bold text-base">{doc.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={startTriage} className="space-y-8">
              
              {/* Demographics & History */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>

              {/* Vitals Section */}
              <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Vital Signs</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">Blood Pressure</label>
                    <Input type="text" placeholder="120/80" value={bp} onChange={(e) => setBp(e.target.value)} className="font-mono" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">Heart Rate (bpm)</label>
                    <Input type="number" placeholder="75" value={hr} onChange={(e) => setHr(e.target.value)} className="font-mono" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">Temp (°F)</label>
                    <Input type="number" step="0.1" placeholder="98.6" value={temp} onChange={(e) => setTemp(e.target.value)} className="font-mono" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">O2 Sat (%)</label>
                    <Input type="number" placeholder="99" value={o2} onChange={(e) => setO2(e.target.value)} className="font-mono" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Chief Complaint Category</label>
                
                {/* Mobile View: Native Dropdown */}
                <div className="md:hidden">
                  <select 
                    className="flex h-14 w-full rounded-xl border border-input bg-background px-4 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary appearance-none"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="" disabled>Select a category...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                {/* Desktop View: Grid */}
                <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-3">
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
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
          <label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider hidden sm:block">Language:</label>
          <select 
            value={sessionLanguage}
            onChange={(e) => setSessionLanguage(e.target.value)}
            className="h-10 px-3 rounded-lg border border-primary/30 bg-background text-sm font-medium focus:outline-none focus:border-primary/60 shadow-sm appearance-none min-w-[100px] sm:min-w-[120px]"
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Marathi">Marathi</option>
          </select>
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
                      <div className="bg-muted/80 backdrop-blur-sm px-6 py-4 rounded-3xl rounded-tl-none max-w-[95%] md:max-w-[85%] text-base md:text-lg border border-white/5">
                        {item.question}
                      </div>
                    </div>
                    {item.answer && (
                      <div className="flex justify-end">
                        <div className="bg-primary text-primary-foreground px-6 py-4 rounded-3xl rounded-tr-none max-w-[95%] md:max-w-[85%] text-base md:text-lg shadow-lg font-medium">
                          {item.answer}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {currentQuestion && !isThinking && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                  <div className="bg-muted/80 backdrop-blur-sm px-6 py-4 rounded-3xl rounded-tl-none max-w-[95%] md:max-w-[85%] text-base md:text-lg border border-primary/20 ring-1 ring-primary/10">
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
