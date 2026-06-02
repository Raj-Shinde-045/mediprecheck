import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Users, Clock, ChevronRight, Activity, Calendar } from 'lucide-react';
import { db } from '../../lib/firebase';
import { ref, onValue, update, get, remove } from 'firebase/database';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

export function DoctorQueue() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [doctorId, setDoctorId] = useState('');
  const [isDocDropdownOpen, setIsDocDropdownOpen] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [queue, setQueue] = useState([]);
  
  // Date picker state. Default to today in YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

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
    loadDoctors();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !doctorId) return;
    
    const queueRef = ref(db, `clinics/${currentUser.uid}/doctors/${doctorId}/queue`);
    
    // Real-time listener!
    const unsubscribe = onValue(queueRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert object to array
        const queueList = Object.keys(data).map(key => ({
          token: key, // e.g. 02062026-1
          ...data[key]
        }));
        
        // Sort logic: 'ready' (1) -> 'in-consult' (2) -> 'on-hold' (3) -> 'completed' (4)
        // If statuses are equal, sort by Token Number (descending) so most recent is on top
        queueList.sort((a, b) => {
          const rank = { 'ready': 1, 'in-consult': 2, 'on-hold': 3, 'completed': 4 };
          const rankDiff = (rank[a.status] || 99) - (rank[b.status] || 99);
          
          if (rankDiff !== 0) return rankDiff;
          
          // Secondary sort: Token number descending
          const numA = parseInt(a.token.split('-')[1] || 0);
          const numB = parseInt(b.token.split('-')[1] || 0);
          return numB - numA;
        });
        
        setQueue(queueList);
      } else {
        setQueue([]);
      }
    });

    return () => unsubscribe();
  }, [currentUser, doctorId]);

  const handleStartConsult = async (token) => {
    // Update Firebase status
    const tokenRef = ref(db, `clinics/${currentUser.uid}/doctors/${doctorId}/queue/${token}`);
    await update(tokenRef, { status: 'in-consult' });
    navigate(`/doctor/review/${token}?doc=${doctorId}`);
  };

  const handleViewRecord = (token) => {
    navigate(`/doctor/review/${token}?doc=${doctorId}`);
  };

  const handleToggleHold = async (token, currentStatus) => {
    const newStatus = currentStatus === 'on-hold' ? 'ready' : 'on-hold';
    const tokenRef = ref(db, `clinics/${currentUser.uid}/doctors/${doctorId}/queue/${token}`);
    await update(tokenRef, { status: newStatus });
  };

  const handleClearQueue = async () => {
    if (!confirm('Are you sure you want to delete ALL patients in this queue? This cannot be undone.')) return;
    
    // Delete the entire queue for this doctor
    const queueRef = ref(db, `clinics/${currentUser.uid}/doctors/${doctorId}/queue`);
    await remove(queueRef);
    
    // Delete the daily counters for this doctor so tokens reset to #1
    const countersRef = ref(db, `clinics/${currentUser.uid}/doctors/${doctorId}/counters`);
    await remove(countersRef);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'ready': return <span className="bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider flex items-center gap-1"><Clock className="w-3 h-3"/> Waiting</span>;
      case 'in-consult': return <span className="bg-blue-500/20 text-blue-500 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">In Consult</span>;
      case 'on-hold': return <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">On Hold (Absent)</span>;
      case 'completed': return <span className="bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">Completed</span>;
      default: return null;
    }
  };

  // Convert YYYY-MM-DD to DDMMYYYY for filtering
  const targetFilterPrefix = useMemo(() => {
    if (!selectedDate) return '';
    const [y, m, d] = selectedDate.split('-');
    return `${d}${m}${y}`; // e.g. 02062026
  }, [selectedDate]);

  const formattedDisplayDate = useMemo(() => {
    if (!selectedDate) return '';
    const [y, m, d] = selectedDate.split('-');
    return `${d}/${m}/${y}`; // e.g. 02/06/2026
  }, [selectedDate]);

  // Filter patients by selected date
  const todaysPatients = useMemo(() => {
    return queue.filter(patient => patient.token.startsWith(targetFilterPrefix));
  }, [queue, targetFilterPrefix]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Live Queue</h1>
          <p className="text-muted-foreground text-lg flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
            Real-time Sync Active
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={handleClearQueue} 
            className="text-red-500 border border-red-500/30 hover:bg-red-500/10 font-bold px-4 rounded-xl shadow-sm"
          >
            Clear Queue (Test)
          </Button>

          <div className="bg-background/80 p-2 rounded-xl border border-white/10 flex items-center shadow-lg">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-2 mr-3">Date:</label>
            <input 
              type="date"
              className="bg-primary/20 border-none text-primary font-bold text-lg rounded-lg px-4 py-2"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          
          <div className="bg-background/80 p-2 rounded-xl border border-white/10 flex items-center shadow-lg relative">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-2 mr-3">Viewing Queue For:</label>
            
            <div className="relative inline-block text-left min-w-[200px]">
              <div 
                onClick={() => setIsDocDropdownOpen(!isDocDropdownOpen)}
                className="flex items-center justify-between bg-primary/20 text-primary font-bold text-lg rounded-lg px-4 py-2 cursor-pointer hover:bg-primary/30 transition-colors"
              >
                <div className="flex items-center">
                  {doctors.find(d => d.id === doctorId)?.profilePic ? (
                    <img src={doctors.find(d => d.id === doctorId)?.profilePic} alt="Doc" className="w-6 h-6 rounded-full object-cover mr-2" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs mr-2">
                      {doctors.find(d => d.id === doctorId)?.name?.replace('Dr. ', '').charAt(0)?.toUpperCase()}
                    </div>
                  )}
                  <span>{doctors.find(d => d.id === doctorId)?.name || 'Select Doctor'}</span>
                </div>
                <span className="ml-2 text-sm opacity-70">▼</span>
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
                        <img src={doc.profilePic} alt={doc.name} className="w-6 h-6 rounded-full object-cover mr-2" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs mr-2">
                          {doc.name.replace('Dr. ', '').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-bold text-sm">{doc.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card glass className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Queue for {formattedDisplayDate}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black text-primary">{todaysPatients.filter(p => p.status === 'ready').length}</div>
            <p className="text-muted-foreground mt-1">Patients waiting</p>
          </CardContent>
        </Card>
        
        <Card glass className="border-white/10 bg-background/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Total Consulted Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black text-foreground">{todaysPatients.filter(p => p.status === 'completed').length}</div>
            <p className="text-muted-foreground mt-1">Patients seen</p>
          </CardContent>
        </Card>
      </div>

      <Card glass className="mt-8 border-white/10 overflow-hidden shadow-2xl">
        <CardContent className="p-0">
          <div className="divide-y divide-white/5">
            <AnimatePresence>
              {todaysPatients.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground text-lg">
                  No patients assigned for {formattedDisplayDate}.
                </div>
              ) : (
                todaysPatients.map((patient) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={patient.token} 
                    className="flex items-center justify-between p-6 hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center space-x-6">
                      <div className="bg-primary/10 text-primary w-24 h-20 rounded-2xl flex items-center justify-center font-black text-3xl shadow-inner border border-primary/20">
                        #{patient.token.split('-')[1]}
                      </div>
                      <div>
                        <p className="font-bold text-2xl mb-2 tracking-tight">Token #{patient.token.split('-')[1]}</p>
                        <div className="flex gap-3 items-center">
                          {getStatusBadge(patient.status)}
                          <span className="text-muted-foreground text-sm flex items-center bg-background px-3 py-1 rounded-full border border-white/5">
                            <Clock className="w-3 h-3 mr-1" />
                            Arrived {patient.timeWaiting}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {(patient.status === 'ready' || patient.status === 'on-hold') && (
                        <Button 
                          variant="outline"
                          onClick={() => handleToggleHold(patient.token, patient.status)}
                          className="h-14 px-5 text-sm font-bold rounded-xl border-white/10 hover:bg-white/5 opacity-80 hover:opacity-100"
                        >
                          {patient.status === 'on-hold' ? 'Resume Patient' : 'Put on Hold'}
                        </Button>
                      )}
                      
                      {patient.status !== 'completed' ? (
                        <Button 
                          onClick={() => handleStartConsult(patient.token)}
                          className="h-14 px-8 text-lg font-bold rounded-xl shadow-lg opacity-90 group-hover:opacity-100 transition-all hover:scale-105"
                        >
                          Review Triage
                          <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                      ) : (
                        <Button 
                          variant="secondary"
                          onClick={() => handleViewRecord(patient.token)}
                          className="h-14 px-8 text-lg font-bold rounded-xl shadow-lg transition-all hover:scale-105 bg-white/10 hover:bg-white/20 text-white"
                        >
                          View Record
                          <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                      )}
                    </div>
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
