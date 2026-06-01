import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Stethoscope, FileText, CheckCircle2, Activity, ShieldAlert, Pill } from 'lucide-react';
import { db } from '../../lib/firebase';
import { ref, get, update } from 'firebase/database';
import { motion } from 'framer-motion';

export function TokenReview() {
  const { token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const doctorId = searchParams.get('doc') || 'doc-smith';

  const [isLoading, setIsLoading] = useState(true);
  const [patientData, setPatientData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const tokenRef = ref(db, `doctors/${doctorId}/queue/${token}`);
      const snapshot = await get(tokenRef);
      
      if (snapshot.exists()) {
        setPatientData(snapshot.val());
      }
      setIsLoading(false);
    };
    loadData();
  }, [token, doctorId]);

  const handleMarkConsulted = async () => {
    const tokenRef = ref(db, `doctors/${doctorId}/queue/${token}`);
    await update(tokenRef, { status: 'completed' });
    navigate('/doctor');
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
        <p className="text-muted-foreground mb-8">The token {token} could not be located in your queue.</p>
        <Button onClick={() => navigate('/doctor')}>Return to Dashboard</Button>
      </div>
    );
  }

  const { history, summary } = patientData;
  const intake = history[0]; // The first item is always the intake form

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-5xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate('/doctor')} className="-ml-4 mr-4 h-12 w-12 p-0 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-4xl font-black tracking-tight">{token}</h1>
            <p className="text-muted-foreground text-lg">Patient Triage Review</p>
          </div>
        </div>
        <Button onClick={handleMarkConsulted} className="h-12 px-6 text-lg font-bold bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg hover:scale-105 transition-all">
          <CheckCircle2 className="w-5 h-5 mr-2" />
          Mark as Consulted
        </Button>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        
        {/* VITALS PANEL - DOCTOR'S MOST IMPORTANT VIEW */}
        <Card glass className="md:col-span-4 border-red-500/30 shadow-xl overflow-hidden">
          <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-3 flex items-center">
            <Activity className="w-5 h-5 text-red-500 mr-2" />
            <h2 className="text-red-500 font-black tracking-widest uppercase text-sm">Critical Clinical Data</h2>
          </div>
          <CardContent className="p-0">
            <div className="grid grid-cols-2 md:grid-cols-6 divide-x divide-y divide-white/10">
              
              {/* Vitals Blocks */}
              <div className="p-6 text-center hover:bg-white/5 transition-colors">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Blood Pressure</p>
                <p className="text-4xl font-black font-mono">{intake.vitals?.bp || 'N/A'}</p>
              </div>
              <div className="p-6 text-center hover:bg-white/5 transition-colors">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Heart Rate</p>
                <p className="text-4xl font-black font-mono">{intake.vitals?.hr || 'N/A'}</p>
                <p className="text-xs text-muted-foreground mt-1">bpm</p>
              </div>
              <div className="p-6 text-center hover:bg-white/5 transition-colors">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Temperature</p>
                <p className="text-4xl font-black font-mono">{intake.vitals?.temp || 'N/A'}</p>
                <p className="text-xs text-muted-foreground mt-1">°F</p>
              </div>
              <div className="p-6 text-center hover:bg-white/5 transition-colors">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">O2 Saturation</p>
                <p className="text-4xl font-black font-mono text-blue-500">{intake.vitals?.o2 || 'N/A'}</p>
                <p className="text-xs text-muted-foreground mt-1">%</p>
              </div>

              {/* Allergies & Meds */}
              <div className="p-6 text-left col-span-2 hover:bg-white/5 transition-colors">
                <div className="mb-4">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center">
                    <ShieldAlert className="w-3 h-3 mr-1 text-orange-500"/> Known Allergies
                  </p>
                  <p className={`font-medium text-lg ${intake.allergies && intake.allergies.toLowerCase() !== 'none' ? 'text-orange-500 font-bold' : ''}`}>
                    {intake.allergies || 'None recorded'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center">
                    <Pill className="w-3 h-3 mr-1 text-purple-500"/> Current Medications
                  </p>
                  <p className="font-medium">{intake.medications || 'None recorded'}</p>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

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
                      {summary.verdict}
                    </p>
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
