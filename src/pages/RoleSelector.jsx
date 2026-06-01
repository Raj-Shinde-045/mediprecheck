import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Activity, Stethoscope, ScanFace } from 'lucide-react';

export function RoleSelector({ onSelectRole }) {
  const navigate = useNavigate();

  const handleRoleSelect = (role, path) => {
    onSelectRole(role);
    navigate(path);
  };

  return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="w-full max-w-3xl animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center mb-8">
          <Activity className="h-16 w-16 text-primary" />
        </div>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">MediPreCheck Walk-in Clinic</h1>
          <p className="text-xl text-muted-foreground">Select your portal to continue</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card glass className="hover:border-blue-500/50 transition-colors cursor-pointer group" onClick={() => handleRoleSelect('patient', '/patient')}>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-blue-500/10 p-6 rounded-full mb-4 group-hover:bg-blue-500/20 transition-colors">
                <ScanFace className="h-12 w-12 text-blue-500" />
              </div>
              <CardTitle className="text-2xl">Patient Kiosk</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              Walk-in patients start here to begin intelligent AI triage.
            </CardContent>
          </Card>

          <Card glass className="hover:border-green-500/50 transition-colors cursor-pointer group" onClick={() => handleRoleSelect('doctor', '/doctor')}>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-green-500/10 p-6 rounded-full mb-4 group-hover:bg-green-500/20 transition-colors">
                <Stethoscope className="h-12 w-12 text-green-500" />
              </div>
              <CardTitle className="text-2xl">Doctor Review</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              View patient queue and AI-generated triage summaries.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
