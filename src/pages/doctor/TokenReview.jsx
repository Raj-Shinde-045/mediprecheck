import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Stethoscope, CheckCircle2, Activity, ShieldAlert, Pill, Utensils, AlertOctagon, Apple, History, RotateCcw } from 'lucide-react';
import { db } from '../../lib/firebase';
import { ref, get, update } from 'firebase/database';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

export function TokenReview() {
  const { token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const searchParams = new URLSearchParams(location.search);
  const doctorId = searchParams.get('doc');

  const [isLoading, setIsLoading] = useState(true);
  const [patientData, setPatientData] = useState(null);
  const [timeMachineDay, setTimeMachineDay] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      if (!currentUser || !doctorId) return;
      const tokenRef = ref(db, `clinics/${currentUser.uid}/doctors/${doctorId}/queue/${token}`);
      const snapshot = await get(tokenRef);
      
      if (snapshot.exists()) {
        setPatientData(snapshot.val());
      }
      setIsLoading(false);
    };
    loadData();
  }, [token, doctorId, currentUser]);

  const handleMarkConsulted = async () => {
    const tokenRef = ref(db, `clinics/${currentUser.uid}/doctors/${doctorId}/queue/${token}`);
    await update(tokenRef, { status: 'completed' });
    navigate('/doctor');
  };

  const handleReopenCase = async () => {
    const tokenRef = ref(db, `clinics/${currentUser.uid}/doctors/${doctorId}/queue/${token}`);
    await update(tokenRef, { status: 'ready' });
    navigate('/doctor');
  };

  const renderMarkdown = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-red-600 dark:text-red-400 font-black tracking-wide">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  if (isLoading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-center">
        <h2 className="text-3xl font-bold mb-4">Patient Record Not Found</h2>
        <p className="text-muted-foreground mb-8">The token could not be located in your queue.</p>
        <Button onClick={() => navigate('/doctor')}>Return to Dashboard</Button>
      </div>
    );
  }

  const { history, summary } = patientData;
  const intake = history[0]; // The first item is always the intake form

  const isRecorded = (val) => val && val.toLowerCase() !== 'not recorded' && val.toLowerCase() !== 'n/a' && val.trim() !== '';

  const hasAnyVitals = isRecorded(intake.vitals?.bp) || isRecorded(intake.vitals?.hr) || isRecorded(intake.vitals?.temp) || isRecorded(intake.vitals?.o2);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-5xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate('/doctor')} className="-ml-4 mr-4 h-12 w-12 p-0 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-4xl font-black tracking-tight flex items-center gap-4">
              Token #{token.split('-')[1]}
              {patientData.status === 'completed' && <span className="bg-green-500 text-white text-sm px-3 py-1 rounded-full uppercase tracking-widest font-bold">Consulted</span>}
            </h1>
            <p className="text-muted-foreground text-lg">Patient Triage Review</p>
          </div>
        </div>
        {patientData.status === 'completed' ? (
          <Button onClick={handleReopenCase} className="h-12 px-6 text-lg font-bold bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl shadow-lg hover:scale-105 transition-all">
            <RotateCcw className="w-5 h-5 mr-2" />
            Reopen Case
          </Button>
        ) : (
          <Button onClick={handleMarkConsulted} className="h-12 px-6 text-lg font-bold bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg hover:scale-105 transition-all">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Mark as Consulted
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        
        {/* RISK ASSESSMENT BANNER */}
        {summary?.riskLevel && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`md:col-span-4 rounded-xl p-6 border shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 ${
              summary.riskLevel === 'Critical' ? 'bg-red-100 dark:bg-red-600/20 border-red-600 text-red-700 dark:text-red-100 shadow-red-600/20' :
              summary.riskLevel === 'High' ? 'bg-orange-100 dark:bg-orange-500/20 border-orange-500 text-orange-800 dark:text-orange-100 shadow-orange-500/20' :
              summary.riskLevel === 'Medium' ? 'bg-yellow-50 dark:bg-yellow-500/10 border-yellow-500/50 text-yellow-700 dark:text-yellow-400' :
              'bg-green-50 dark:bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400'
            }`}
          >
            <div className="flex items-start gap-4">
              <ShieldAlert className={`w-10 h-10 shrink-0 mt-1 ${summary.riskLevel === 'Critical' ? 'animate-pulse text-red-500' : summary.riskLevel === 'High' ? 'text-orange-500' : ''}`} />
              <div>
                <h2 className={`text-2xl font-black uppercase tracking-wider flex items-center gap-2 ${
                  summary.riskLevel === 'Critical' ? 'text-red-500' : 
                  summary.riskLevel === 'High' ? 'text-orange-500' : ''
                }`}>
                  Triage Risk Level: {summary.riskLevel}
                </h2>
                {summary.redFlags && summary.redFlags.length > 0 && summary.redFlags[0] !== '' && summary.redFlags[0] !== 'Leave array empty if no red flags are present' && (
                  <div className="mt-3 text-sm font-medium">
                    <span className="font-bold opacity-100 uppercase tracking-wider text-xs block mb-1">Detected Red Flags:</span>
                    <ul className="list-disc list-inside space-y-1">
                      {summary.redFlags.map((flag, idx) => (
                        <li key={idx} className="leading-snug">{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            {summary.riskLevel === 'Critical' && (
              <div className="bg-red-600 text-foreground dark:text-white px-6 py-3 rounded-xl font-bold text-sm tracking-widest uppercase animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.6)] shrink-0 text-center">
                Immediate Attention
              </div>
            )}
          </motion.div>
        )}
        
        {/* VITALS PANEL - Conditionally rendered */}
        {hasAnyVitals && (
          <Card glass className="md:col-span-4 border-red-500/30 shadow-xl overflow-hidden">
            <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-3 flex items-center">
              <Activity className="w-5 h-5 text-red-500 mr-2" />
              <h2 className="text-red-500 font-black tracking-widest uppercase text-sm">Critical Clinical Data</h2>
            </div>
            <CardContent className="p-0">
              <div className="grid grid-cols-2 md:grid-cols-6 divide-x divide-y divide-white/10">
                
                {/* Vitals Blocks - Only render if recorded */}
                {isRecorded(intake.vitals?.bp) && (
                  <div className="p-6 text-center hover:bg-white/5 transition-colors">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Blood Pressure</p>
                    <p className="text-4xl font-black font-mono">{intake.vitals.bp}</p>
                  </div>
                )}
                {isRecorded(intake.vitals?.hr) && (
                  <div className="p-6 text-center hover:bg-white/5 transition-colors">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Heart Rate</p>
                    <p className="text-4xl font-black font-mono">{intake.vitals.hr}</p>
                    <p className="text-xs text-muted-foreground mt-1">bpm</p>
                  </div>
                )}
                {isRecorded(intake.vitals?.temp) && (
                  <div className="p-6 text-center hover:bg-white/5 transition-colors">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Temperature</p>
                    <p className="text-4xl font-black font-mono">{intake.vitals.temp}</p>
                    <p className="text-xs text-muted-foreground mt-1">°F</p>
                  </div>
                )}
                {isRecorded(intake.vitals?.o2) && (
                  <div className="p-6 text-center hover:bg-white/5 transition-colors">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">O2 Saturation</p>
                    <p className="text-4xl font-black font-mono text-blue-500">{intake.vitals.o2}</p>
                    <p className="text-xs text-muted-foreground mt-1">%</p>
                  </div>
                )}

              </div>
            </CardContent>
          </Card>
        )}

        {/* AUTOMATED SUMMARY PANEL */}
        <Card glass className="md:col-span-4 border-primary/20 shadow-xl mt-4">
          <CardHeader className="bg-primary/5 border-b border-primary/10 flex flex-row items-center justify-between py-4">
            <CardTitle className="flex items-center text-xl text-primary font-black">
              <Stethoscope className="w-6 h-6 mr-3" />
              Automated Triage Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden">
            {summary && typeof summary === 'object' ? (
              <div>
                {/* Top Details Bar */}
                <div className="bg-muted/30 p-6 flex flex-wrap gap-4 border-b border-primary/10">
                  <div className="bg-background border border-primary/20 px-4 py-2 rounded-xl flex items-center shadow-sm">
                    <span className="text-muted-foreground text-sm font-bold uppercase tracking-wider mr-3">Patient</span>
                    <span className="text-foreground font-black text-lg">{summary.patientDetails}</span>
                  </div>
                  <div className="bg-background border border-primary/20 px-4 py-2 rounded-xl flex items-center shadow-sm">
                    <span className="text-muted-foreground text-sm font-bold uppercase tracking-wider mr-3">Chief Complaint</span>
                    <span className="text-primary font-black text-lg">{summary.chiefComplaint}</span>
                  </div>
                </div>
                
                {/* Q&A Analysis */}
                <div className="p-6 space-y-4">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Follow-up Analysis (Clinical Q&A)</h3>
                  <div className="space-y-3">
                    {summary.analysis.map((item, idx) => (
                      <div key={idx} className="flex items-start justify-between bg-background p-4 rounded-xl border border-white/5 shadow-sm hover:border-primary/20 transition-colors">
                        <span className="text-foreground text-lg pr-4 font-medium">{item.question}</span>
                        <span className={`px-4 py-1.5 rounded-lg text-sm font-black tracking-wider uppercase shrink-0 shadow-inner ${
                          item.answer === 'Yes' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                          item.answer === 'No' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                          'bg-muted text-muted-foreground'
                        }`}>
                          {item.answer}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* JUNIOR DOCTOR VERDICT */}
                {summary.verdict && (
                  <div className="p-6 bg-primary/10 border-t border-primary/20">
                    <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-3 flex items-center">
                      <Stethoscope className="w-4 h-4 mr-2" />
                      Junior Doctor AI Verdict & DDx
                    </h3>
                    <p className="text-lg leading-relaxed font-medium text-foreground bg-background/50 p-6 rounded-xl border border-primary/10 shadow-inner">
                      {renderMarkdown(summary.verdict)}
                    </p>
                  </div>
                )}

                {/* DIETARY ADVICE */}
                {summary.dietaryAdvice && (
                  <div className="p-6 bg-background/50 border-t border-white/5 grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h3 className="text-sm font-black text-green-600 dark:text-green-500 uppercase tracking-widest flex items-center">
                        <Apple className="w-4 h-4 mr-2" />
                        Recommended to Consume
                      </h3>
                      <ul className="space-y-2 bg-green-500/30 dark:bg-green-500/10 p-4 rounded-xl border border-green-500/40 dark:border-green-500/20">
                        {summary.dietaryAdvice.toEat.map((item, idx) => (
                          <li key={idx} className="flex items-start text-green-700 dark:text-green-100 font-medium text-sm">
                            <span className="mr-2 text-green-600 dark:text-green-500 font-black">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-sm font-black text-red-600 dark:text-red-500 uppercase tracking-widest flex items-center">
                        <AlertOctagon className="w-4 h-4 mr-2" />
                        Recommended to Avoid
                      </h3>
                      <ul className="space-y-2 bg-red-500/30 dark:bg-red-500/10 p-4 rounded-xl border border-red-500/40 dark:border-red-500/20">
                        {summary.dietaryAdvice.toAvoid.map((item, idx) => (
                          <li key={idx} className="flex items-start text-red-700 dark:text-red-100 font-medium text-sm">
                            <span className="mr-2 text-red-600 dark:text-red-500 font-black">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* AI TIME MACHINE */}
                {summary.diseaseProgression && summary.diseaseProgression.length > 0 && (
                  <div className="p-6 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 border-t border-indigo-300 dark:border-indigo-500/20">
                    <h3 className="text-sm font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-widest flex items-center mb-6">
                      <History className="w-4 h-4 mr-2" />
                      AI Time Machine (Disease Progression Simulator)
                    </h3>
                    
                    <div className="space-y-6">
                      <div className="flex justify-between items-center px-4 md:px-12 relative z-10">
                        {[1, 2, 3, 4].map(day => (
                          <button 
                            key={day}
                            onClick={() => setTimeMachineDay(day)}
                            className={`flex flex-col items-center gap-2 transition-all ${timeMachineDay === day ? 'scale-110' : 'opacity-60 hover:opacity-100'} relative`}
                          >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl z-10 transition-colors ${timeMachineDay === day ? 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.8)] border-2 border-indigo-300' : 'bg-background border-2 border-white/10'}`}>
                              {day}
                            </div>
                            <span className={`text-xs font-bold uppercase tracking-wider ${timeMachineDay === day ? 'text-indigo-600 dark:text-indigo-300' : 'text-foreground/60 dark:text-muted-foreground'}`}>Day {day}</span>
                          </button>
                        ))}
                      </div>
                      
                      <div className="relative h-2 bg-indigo-300/40 dark:bg-black/50 rounded-full overflow-hidden mx-8 md:mx-16 -mt-16 mb-12 shadow-inner">
                        <div 
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-600 dark:from-indigo-500 to-purple-600 dark:to-purple-500 transition-all duration-500" 
                          style={{ width: `${((timeMachineDay - 1) / 3) * 100}%` }}
                        />
                      </div>

                      <div className="bg-white dark:bg-background/80 p-6 md:p-8 rounded-2xl border border-indigo-400 dark:border-indigo-500/30 shadow-[inset_0_2px_20px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_20px_rgba(0,0,0,0.5)] min-h-[120px] flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600 dark:bg-indigo-500"></div>
                        <p className="text-lg md:text-xl font-medium text-indigo-900 dark:text-indigo-100 leading-relaxed max-w-2xl">
                          {summary.diseaseProgression.find(p => p.day === timeMachineDay)?.prediction || 'No prediction available for this timeframe.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center">
                <p className="text-muted-foreground italic text-lg">No automated summary generated for this record.</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </motion.div>
  );
}
