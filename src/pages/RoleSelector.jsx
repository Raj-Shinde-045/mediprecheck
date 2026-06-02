import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, ScanFace, Sparkles, ActivitySquare, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function RoleSelector() {
  const navigate = useNavigate();

  const handleRoleSelect = (path) => {
    navigate(path);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 80, damping: 20 } }
  };

  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
      {/* Premium Dynamic Background Elements */}
      <motion.div 
        animate={{ 
          x: [0, 50, 0], 
          y: [0, -50, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10" 
      />
      <motion.div 
        animate={{ 
          x: [0, -50, 0], 
          y: [0, 50, 0],
          scale: [1, 1.3, 1]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] -z-10" 
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 -z-10" />

      <motion.div 
        className="w-full max-w-5xl px-6 relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="text-center mb-20 relative">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.5, duration: 1, delay: 0.2 }}
            className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-3xl mb-8 ring-1 ring-primary/30 backdrop-blur-xl shadow-[0_0_40px_rgba(0,200,255,0.2)]"
          >
            <ActivitySquare className="h-10 w-10 text-primary" />
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 drop-shadow-sm">
            The Future of <br className="hidden md:block" /> Patient Intake.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-3xl mx-auto leading-relaxed">
            Experience lightning-fast, intelligent triage powered by next-generation clinical AI.
          </p>
        </motion.div>

        <motion.div variants={containerVariants} className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Patient Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -12, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRoleSelect('/patient')}
            className="group relative cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-blue-600/30 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative h-full bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] hover:border-primary/50 transition-all duration-500 shadow-2xl overflow-hidden flex flex-col">
              <div className="absolute -top-10 -right-10 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 group-hover:rotate-12 group-hover:scale-110">
                <ScanFace className="w-64 h-64" />
              </div>
              <div className="bg-primary/20 w-20 h-20 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-inner border border-white/10">
                <ScanFace className="h-10 w-10 text-primary group-hover:text-white" />
              </div>
              <h2 className="text-4xl font-bold mb-4 flex items-center gap-3 text-white">
                Patient Kiosk <Sparkles className="w-6 h-6 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed flex-grow">
                Step right up. Describe your symptoms naturally and our AI will guide you instantly.
              </p>
              <div className="mt-8 flex items-center text-primary font-bold text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-10px] group-hover:translate-x-0">
                Start Triage <ArrowRight className="ml-2 w-5 h-5" />
              </div>
            </div>
          </motion.div>

          {/* Doctor Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -12, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRoleSelect('/doctor')}
            className="group relative cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 to-teal-600/30 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative h-full bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] hover:border-emerald-500/50 transition-all duration-500 shadow-2xl overflow-hidden flex flex-col">
              <div className="absolute -top-10 -right-10 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 group-hover:rotate-12 group-hover:scale-110">
                <Stethoscope className="w-64 h-64" />
              </div>
              <div className="bg-emerald-500/20 w-20 h-20 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 shadow-inner border border-white/10">
                <Stethoscope className="h-10 w-10 text-emerald-500 group-hover:text-white" />
              </div>
              <h2 className="text-4xl font-bold mb-4 text-white">
                Doctor Review
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed flex-grow">
                Access the live patient queue and read AI-generated triage summaries instantly.
              </p>
              <div className="mt-8 flex items-center text-emerald-500 font-bold text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-10px] group-hover:translate-x-0">
                Enter Dashboard <ArrowRight className="ml-2 w-5 h-5" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
