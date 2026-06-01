import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Users, Clock, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import { db } from '../../lib/firebase';
import { ref, onValue, update } from 'firebase/database';
import { motion, AnimatePresence } from 'framer-motion';

export function DoctorDashboard() {
  const navigate = useNavigate();
  const [doctorId, setDoctorId] = useState('doc-smith'); // Hardcoded default doctor for now
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    const queueRef = ref(db, `doctors/${doctorId}/queue`);
    
    // Real-time listener!
    const unsubscribe = onValue(queueRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert object to array
        const queueList = Object.keys(data).map(key => ({
          token: key,
          ...data[key]
        }));
        
        // Sort: 'ready' first, then 'in-consult'
        queueList.sort((a, b) => {
          if (a.status === 'ready' && b.status !== 'ready') return -1;
          if (a.status !== 'ready' && b.status === 'ready') return 1;
          return 0;
        });
        
        setQueue(queueList);
      } else {
        setQueue([]);
      }
    });

    return () => unsubscribe();
  }, [doctorId]);

  const handleStartConsult = async (token) => {
    // Update Firebase status
    const tokenRef = ref(db, `doctors/${doctorId}/queue/${token}`);
    await update(tokenRef, { status: 'in-consult' });
    navigate(`/doctor/review/${token}?doc=${doctorId}`);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'ready': return <span className="bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider flex items-center gap-1"><Clock className="w-3 h-3"/> Waiting</span>;
      case 'in-consult': return <span className="bg-blue-500/20 text-blue-500 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">In Consult</span>;
      case 'completed': return <span className="bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">Completed</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Doctor Dashboard</h1>
          <p className="text-muted-foreground text-lg flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
            Real-time Sync Active
          </p>
        </div>
        
        <div className="bg-background/80 p-2 rounded-xl border border-white/10 flex items-center shadow-lg">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-2 mr-3">Viewing Queue For:</label>
          <select 
            className="bg-primary/20 border-none text-primary font-bold text-lg rounded-lg px-4 py-2"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
          >
            <option value="doc-smith">Dr. Sarah Smith</option>
            <option value="doc-jones">Dr. Michael Jones</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card glass className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center">
              <Users className="w-4 h-4 mr-2" />
              My Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black text-primary">{queue.filter(p => p.status === 'ready').length}</div>
            <p className="text-muted-foreground mt-1">Patients waiting</p>
          </CardContent>
        </Card>
      </div>

      <Card glass className="mt-8 border-white/10 overflow-hidden shadow-2xl">
        <CardHeader className="bg-muted/30 border-b border-white/5 pb-4">
          <CardTitle className="text-xl">Live Patient Queue</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-white/5">
            <AnimatePresence>
              {queue.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  No patients in your queue.
                </div>
              ) : (
                queue.map((patient) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={patient.token} 
                    className="flex items-center justify-between p-6 hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center space-x-6">
                      <div className="bg-primary/10 text-primary w-20 h-20 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner border border-primary/20">
                        {patient.token.split('-')[1]}
                      </div>
                      <div>
                        <p className="font-bold text-2xl mb-2 tracking-tight">{patient.token}</p>
                        <div className="flex gap-3 items-center">
                          {getStatusBadge(patient.status)}
                          <span className="text-muted-foreground text-sm flex items-center bg-background px-3 py-1 rounded-full border border-white/5">
                            <Clock className="w-3 h-3 mr-1" />
                            Arrived {patient.timeWaiting}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {patient.status === 'ready' && (
                      <Button 
                        onClick={() => handleStartConsult(patient.token)}
                        className="h-14 px-8 text-lg font-bold rounded-xl shadow-lg opacity-90 group-hover:opacity-100 transition-all hover:scale-105"
                      >
                        Review Triage
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
