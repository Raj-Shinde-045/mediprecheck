import React from 'react';
import { Shield, FileText, AlertTriangle, UserCheck, Lock } from 'lucide-react';

export function Terms() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-card shadow-xl rounded-2xl overflow-hidden border border-border">
        {/* Header */}
        <div className="bg-primary/5 border-b border-border p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-card-foreground tracking-tight">Terms and Conditions</h1>
          <p className="text-muted-foreground mt-2 text-sm">Last Updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          <section>
            <h2 className="text-xl font-semibold flex items-center gap-2 text-card-foreground mb-3">
              <UserCheck className="w-5 h-5 text-primary" />
              1. Acceptance of Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using MediPreCheck, you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by these terms, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold flex items-center gap-2 text-card-foreground mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              2. Medical Disclaimer
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              <strong>MediPreCheck is not a substitute for professional medical advice, diagnosis, or treatment.</strong> 
              Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. 
              If you think you may have a medical emergency, call your doctor or emergency services immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold flex items-center gap-2 text-card-foreground mb-3">
              <Shield className="w-5 h-5 text-primary" />
              3. User Responsibilities
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Users are responsible for providing accurate and complete medical history, symptoms, and personal information. 
              Falsifying medical information may lead to incorrect pre-checks and adverse health consequences.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold flex items-center gap-2 text-card-foreground mb-3">
              <Lock className="w-5 h-5 text-primary" />
              4. Data Privacy and Security
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We are committed to protecting your privacy. Your personal and medical data is encrypted and handled in accordance 
              with applicable healthcare privacy laws (e.g., HIPAA). We will not share your data with unauthorized third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold flex items-center gap-2 text-card-foreground mb-3">
              <FileText className="w-5 h-5 text-primary" />
              5. Limitation of Liability
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              MediPreCheck and its affiliated clinics shall not be held liable for any direct, indirect, incidental, special, 
              consequential or exemplary damages resulting from the use or the inability to use the service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
