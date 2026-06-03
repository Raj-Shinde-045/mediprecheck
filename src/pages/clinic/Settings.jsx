import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { ref, get, set, remove, push } from 'firebase/database';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Settings as SettingsIcon, UserPlus, Trash2, User, Building, Mail, Shield, Stethoscope, Activity, Edit2, X, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export function Settings() {
  const { currentUser } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [newDocName, setNewDocName] = useState('');
  const [defaultLanguage, setDefaultLanguage] = useState('English');
  const [isLoading, setIsLoading] = useState(true);
  const [editingDocId, setEditingDocId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPic, setEditPic] = useState('');

  useEffect(() => {
    loadDoctors();
    loadSettings();
  }, [currentUser]);

  const loadSettings = async () => {
    if (!currentUser) return;
    const settingsRef = ref(db, `clinics/${currentUser.uid}/settings/defaultLanguage`);
    const snapshot = await get(settingsRef);
    if (snapshot.exists()) {
      setDefaultLanguage(snapshot.val());
    }
  };

  const loadDoctors = async () => {
    if (!currentUser) return;
    const doctorsRef = ref(db, `clinics/${currentUser.uid}/doctorsList`);
    const snapshot = await get(doctorsRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const docsList = Object.keys(data).map(key => ({ 
        id: key, 
        name: data[key].name,
        profilePic: data[key].profilePic || ''
      }));
      setDoctors(docsList);
    } else {
      setDoctors([]);
    }
    setIsLoading(false);
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    if (!newDocName.trim()) return;

    try {
      const doctorsListRef = ref(db, `clinics/${currentUser.uid}/doctorsList`);
      const newDocRef = push(doctorsListRef);
      await set(newDocRef, { name: newDocName.trim() });
      setNewDocName('');
      loadDoctors();
    } catch (err) {
      console.error("Error adding doctor:", err);
      alert("Error adding doctor: " + err.message);
    }
  };

  const handleDeleteDoctor = async (docId) => {
    if(window.confirm("Are you sure you want to remove this doctor from the roster?")) {
      const docRef = ref(db, `clinics/${currentUser.uid}/doctorsList/${docId}`);
      await remove(docRef);
      loadDoctors();
    }
  };

  const handleSaveEdit = async (docId) => {
    if (!editName.trim()) return;
    try {
      const docRef = ref(db, `clinics/${currentUser.uid}/doctorsList/${docId}`);
      await set(docRef, { name: editName.trim(), profilePic: editPic.trim() });
      setEditingDocId(null);
      loadDoctors();
    } catch (err) {
      console.error("Error updating doctor:", err);
      alert("Error updating doctor: " + err.message);
    }
  };

  const handleLanguageChange = async (e) => {
    const newLang = e.target.value;
    setDefaultLanguage(newLang);
    if (!currentUser) return;
    try {
      const settingsRef = ref(db, `clinics/${currentUser.uid}/settings/defaultLanguage`);
      await set(settingsRef, newLang);
    } catch (err) {
      console.error("Error saving language:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-6xl mx-auto mt-8">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-4 rounded-2xl mr-6 border border-white/10 shadow-inner">
            <SettingsIcon className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Clinic Command Center</h1>
            <p className="text-muted-foreground text-lg mt-1">Manage your clinic preferences, doctors, and security.</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        
        {/* Left Column: Clinic Profile & Security */}
        <div className="md:col-span-4 space-y-8">
          <Card glass className="border-white/10 shadow-xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 z-0 transition-opacity opacity-0 group-hover:opacity-100 duration-500"></div>
            <CardHeader className="border-b border-white/5 bg-background/30 relative z-10">
              <CardTitle className="flex items-center text-lg font-black tracking-widest uppercase">
                <Building className="w-5 h-5 mr-3 text-blue-400" />
                Clinic Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 relative z-10 space-y-6">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Administrator Email</p>
                <div className="flex items-center bg-background/50 p-3 rounded-lg border border-white/5">
                  <Mail className="w-4 h-4 mr-3 text-muted-foreground" />
                  <span className="font-medium">{currentUser.email}</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Account ID</p>
                <div className="flex items-center bg-background/50 p-3 rounded-lg border border-white/5">
                  <Shield className="w-4 h-4 mr-3 text-muted-foreground" />
                  <span className="font-mono text-xs text-muted-foreground truncate">{currentUser.uid}</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Default Triage Language</p>
                <select 
                  value={defaultLanguage} 
                  onChange={handleLanguageChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary appearance-none"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Marathi">Marathi</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card glass className="border-white/10 shadow-xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 z-0 transition-opacity opacity-0 group-hover:opacity-100 duration-500"></div>
            <CardHeader className="border-b border-white/5 bg-background/30 relative z-10">
              <CardTitle className="flex items-center text-lg font-black tracking-widest uppercase">
                <Activity className="w-5 h-5 mr-3 text-green-400" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-3 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
                  <span className="font-bold text-green-400">All Systems Operational</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">AI Triage Engine connected.</p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Doctor Roster */}
        <div className="md:col-span-8">
          <Card glass className="border-white/10 shadow-2xl h-full flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
            <CardHeader className="border-b border-white/5 bg-background/40 p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center text-2xl font-black">
                    <Stethoscope className="w-6 h-6 mr-3 text-primary" />
                    Doctor Roster
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Add or remove doctors from the Kiosk dropdown.</p>
                </div>
                <div className="bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  {doctors.length} Active
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-8 flex-1">
              {/* Add Doctor Input */}
              <div className="flex gap-4 mb-10 p-6 bg-background/60 border border-white/5 rounded-2xl shadow-inner relative z-10">
                <div className="relative flex-1">
                  <Input 
                    type="text" 
                    placeholder="Enter doctor's full name (e.g. Dr. Sarah Smith)" 
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    className="w-full h-14 pl-12 text-lg bg-background border-white/10 focus:border-primary/50 focus:ring-primary/50 transition-all rounded-xl"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDoctor(e);
                      }
                    }}
                  />
                  <Stethoscope className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                </div>
                <Button 
                  type="button" 
                  onClick={handleAddDoctor} 
                  disabled={!newDocName.trim()}
                  className="h-14 px-8 text-lg font-bold rounded-xl shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Add Doctor
                </Button>
              </div>

              {/* Doctors Grid */}
              {doctors.length === 0 ? (
                <div className="text-center p-12 bg-background/30 rounded-2xl border border-white/5 border-dashed">
                  <User className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">No Doctors Found</h3>
                  <p className="text-muted-foreground">Add your first doctor above to activate the triage kiosk.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {doctors.map((doc, index) => (
                    <motion.div 
                      key={doc.id} 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex flex-col justify-center p-5 bg-gradient-to-r from-background to-background/50 border border-white/10 rounded-2xl hover:border-primary/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all group min-h-[90px]"
                    >
                      {editingDocId === doc.id ? (
                        <div className="space-y-3 w-full">
                          <Input 
                            value={editName} 
                            onChange={(e) => setEditName(e.target.value)} 
                            placeholder="Doctor Name" 
                            className="h-10 text-sm bg-black/50"
                          />
                          <Input 
                            value={editPic} 
                            onChange={(e) => setEditPic(e.target.value)} 
                            placeholder="Profile Picture URL (Optional)" 
                            className="h-10 text-sm bg-black/50"
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <Button size="sm" variant="ghost" onClick={() => setEditingDocId(null)} className="h-8 px-3 hover:bg-white/10">
                              <X className="w-4 h-4 mr-1" /> Cancel
                            </Button>
                            <Button size="sm" onClick={() => handleSaveEdit(doc.id)} className="h-8 px-3 bg-green-600 hover:bg-green-700">
                              <Check className="w-4 h-4 mr-1" /> Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center">
                            {doc.profilePic ? (
                              <img src={doc.profilePic} alt={doc.name} className="w-12 h-12 rounded-full object-cover shadow-inner mr-4 group-hover:scale-110 transition-transform border-2 border-white/10" />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-inner mr-4 group-hover:scale-110 transition-transform">
                                {doc.name.replace('Dr. ', '').charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="font-bold text-lg tracking-tight">{doc.name}</span>
                          </div>
                          <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              className="w-10 h-10 p-0 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" 
                              onClick={() => {
                                setEditingDocId(doc.id);
                                setEditName(doc.name);
                                setEditPic(doc.profilePic || '');
                              }}
                            >
                              <Edit2 className="w-5 h-5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              className="w-10 h-10 p-0 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors" 
                              onClick={() => handleDeleteDoctor(doc.id)}
                            >
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </motion.div>
  );
}
