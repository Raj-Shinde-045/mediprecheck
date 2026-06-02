import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { ref, get, set, remove, push } from 'firebase/database';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Settings as SettingsIcon, UserPlus, Trash2, User } from 'lucide-react';
import { motion } from 'framer-motion';

export function Settings() {
  const { currentUser } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [newDocName, setNewDocName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDoctors();
  }, [currentUser]);

  const loadDoctors = async () => {
    if (!currentUser) return;
    const doctorsRef = ref(db, `clinics/${currentUser.uid}/doctorsList`);
    const snapshot = await get(doctorsRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const docsList = Object.keys(data).map(key => ({ id: key, name: data[key].name }));
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
    if(window.confirm("Are you sure you want to remove this doctor?")) {
      const docRef = ref(db, `clinics/${currentUser.uid}/doctorsList/${docId}`);
      await remove(docRef);
      loadDoctors();
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl mx-auto mt-8">
      <div className="flex items-center mb-8">
        <div className="bg-primary/20 p-4 rounded-2xl mr-4">
          <SettingsIcon className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tight">Clinic Settings</h1>
          <p className="text-muted-foreground text-lg">Manage your clinic preferences and roster.</p>
        </div>
      </div>

      <Card glass className="border-white/10 shadow-2xl">
        <CardHeader className="border-b border-white/5 bg-muted/30">
          <CardTitle className="flex items-center text-xl">
            <User className="w-5 h-5 mr-2" />
            Manage Doctors
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-4 mb-8">
            <Input 
              type="text" 
              placeholder="e.g. Dr. Sarah Smith" 
              value={newDocName}
              onChange={(e) => setNewDocName(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddDoctor(e);
                }
              }}
            />
            <Button type="button" onClick={handleAddDoctor} className="font-bold bg-primary hover:bg-blue-600">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Doctor
            </Button>
          </div>

          <div className="space-y-3">
            {doctors.length === 0 ? (
              <p className="text-muted-foreground italic text-center p-6">No doctors added yet. Add one above to start accepting patients.</p>
            ) : (
              doctors.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 bg-background/50 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                  <span className="font-bold text-lg">{doc.name}</span>
                  <Button variant="outline" className="border-red-500/20 text-red-500 hover:bg-red-500/10" onClick={() => handleDeleteDoctor(doc.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
