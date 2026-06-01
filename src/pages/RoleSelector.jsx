import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, ScanFace, Sparkles, ActivitySquare } from 'lucide-react';
import { motion } from 'framer-motion';

export function RoleSelector({ onSelectRole }) {
  const navigate = useNavigate();

  const handleRoleSelect = (role, path) => {
    onSelectRole(role);
    navigate(path);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] -z-10 animate-pulse delay-700" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-primary/5 via-transparent to-blue-500/5 rounded-full blur-3xl -z-10" />

      <motion.div 
        className="w-full max-w-4xl px-6 relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="text-center mb-16 relative">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5, duration: 1 }}
            className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-6 ring-1 ring-primary/20 backdrop-blur-md"
          >
            <ActivitySquare className="h-8 w-8 text-primary" />
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-br from-foreground via-foreground to-muted-foreground">
            Welcome to <br/> The Future of Care
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
            Select your portal to experience lightning-fast, intelligent triage.
          </p>
        </motion.div>

        <motion.div variants={containerVariants} className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Patient Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRoleSelect('patient', '/patient')}
            className="group relative cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative h-full bg-background/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:border-blue-500/50 transition-all duration-300 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ScanFace className="w-32 h-32" />
              </div>
              <div className="bg-blue-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                <ScanFace className="h-8 w-8 text-blue-500 group-hover:text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-3 flex items-center gap-2">
                Patient Kiosk <Sparkles className="w-5 h-5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Step right up. Describe your symptoms naturally and our AI will guide you instantly.
              </p>
            </div>
          </motion.div>

          {/* Doctor Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRoleSelect('doctor', '/doctor')}
            className="group relative cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative h-full bg-background/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:border-green-500/50 transition-all duration-300 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Stethoscope className="w-32 h-32" />
              </div>
              <div className="bg-green-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500 group-hover:text-white transition-colors duration-300">
                <Stethoscope className="h-8 w-8 text-green-500 group-hover:text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-3">
                Doctor Review
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Access the live patient queue and read AI-generated triage summaries instantly.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
