"use client";

import { useState, useRef} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UploadCloud, FileText, CheckCircle2, Loader2, AlertCircle, Scale, Clock, AlertTriangle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  "Upload DOCX",
  "Upload Progress",
  "Reading Document",
  "Extracting Case Information",
  "Running ML Models",
  "Displaying Judicial Analysis Report"
];

// Mock API Response based on requirements
const MOCK_RESPONSE = {
  case: {
    case_title: "State of Maharashtra vs. Sandeep Kumar",
    case_number: "CR-2023-0145",
    case_type: "Criminal Revision",
    court: "High Court of Bombay",
    status: "Pending",
    stage: "Framing of Charges",
    acts: ["Indian Penal Code, 1860", "Code of Criminal Procedure, 1973"],
    sections: ["Section 420", "Section 120B", "Section 406"],
    precedents: [
      "Arnesh Kumar v. State of Bihar (2014) 8 SCC 273",
      "Siddharam Satlingappa Mhetre v. State of Maharashtra (2011) 1 SCC 694"
    ]
  },
  prediction: {
    complexity: "High",
    adjournment_probability: "78%",
    predicted_duration_days: 145
  }
};

export default function PredictionCenter() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1); // -1 means upload stage
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith(".docx")) {
      alert("Please upload a .docx file.");
      return;
    }
    setFile(file);
    startProcessing();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const startProcessing = () => {
    setCurrentStepIndex(0); // Upload DOCX
    
    // Simulate steps
    setTimeout(() => {
      setCurrentStepIndex(1); // Upload Progress
      
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);

      setTimeout(() => setCurrentStepIndex(2), 1500); // Reading
      setTimeout(() => setCurrentStepIndex(3), 3000); // Extracting
      setTimeout(() => setCurrentStepIndex(4), 5000); // ML Models
      setTimeout(() => setCurrentStepIndex(5), 7500); // Display Report
    }, 500);
  };

  const resetProcess = () => {
    setFile(null);
    setCurrentStepIndex(-1);
    setUploadProgress(0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-6 md:px-12 pt-32 pb-24">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold font-ibm-plex-sans text-primary mb-4">
            Prediction Center
          </h1>
          <div className="w-12 h-1 bg-accent mx-auto rounded-full" />
        </div>

        <div className="max-w-4xl mx-auto">
          
          <AnimatePresence mode="wait">
            
            {currentStepIndex === -1 && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-2 border-dashed border-border overflow-hidden relative">
                  {/* Satyameva Jayate Background */}
                  <div 
                    className="absolute inset-0 z-0 opacity-[0.03] bg-center bg-no-repeat bg-contain pointer-events-none"
                    style={{ backgroundImage: "url('/images/satyamev-jayate.png')", backgroundSize: "40%" }}
                  />
                  
                  <div
                    className={cn(
                      "flex flex-col items-center justify-center p-16 md:p-24 transition-colors relative z-10",
                      isDragging ? "bg-primary/5 border-primary/50" : "bg-card/90 hover:bg-background/90"
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept=".docx"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                    <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                      <UploadCloud className="w-10 h-10" />
                    </div>
                    <CardTitle className="text-2xl text-primary font-ibm-plex-sans mb-2">Upload Judicial Case Document</CardTitle>
                    <CardDescription className="text-lg text-center mb-8">
                      Drag & Drop your .docx case document or Browse.
                    </CardDescription>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="h-12 px-8 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition-colors shadow-premium flex items-center gap-2"
                    >
                      Browse Files
                    </button>
                    <p className="mt-6 text-sm text-foreground/50 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Supported format: .docx only
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}

            {currentStepIndex >= 0 && currentStepIndex < 5 && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-xl mx-auto"
              >
                <Card className="p-8 shadow-premium">
                  <h3 className="text-xl font-semibold font-ibm-plex-sans text-primary mb-8 flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-accent" />
                    Processing Document
                  </h3>
                  
                  <div className="space-y-6">
                    {STEPS.slice(0, 5).map((step, index) => {
                      const isActive = index === currentStepIndex;
                      const isPast = index < currentStepIndex;
                      
                      return (
                        <div key={step} className="flex items-center gap-4">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 shrink-0",
                            isPast ? "bg-primary text-white" : isActive ? "bg-accent text-white" : "bg-border text-foreground/40"
                          )}>
                            {isPast ? <CheckCircle2 className="w-5 h-5" /> : isActive ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                          </div>
                          <div className="flex-1">
                            <p className={cn(
                              "font-medium transition-colors duration-300",
                              isPast ? "text-primary" : isActive ? "text-accent" : "text-foreground/40"
                            )}>
                              {step}
                            </p>
                            {index === 1 && (isActive || isPast) && (
                              <div className="w-full h-1.5 bg-border rounded-full mt-2 overflow-hidden">
                                <motion.div 
                                  className="h-full bg-accent"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${uploadProgress}%` }}
                                  transition={{ ease: "linear", duration: 0.1 }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              </motion.div>
            )}

            {currentStepIndex === 5 && (
              <motion.div
                key="report"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-2xl font-bold font-ibm-plex-sans text-primary">Judicial Analysis Report</h2>
                    <p className="text-foreground/70 flex items-center gap-2 mt-1">
                      <FileText className="w-4 h-4" />
                      {file?.name || "document.docx"}
                    </p>
                  </div>
                  <button onClick={resetProcess} className="text-sm font-medium text-accent hover:underline">
                    Process Another Document
                  </button>
                </div>

                {/* Case Summary */}
                <Card className="mb-6 shadow-premium border-primary/10">
                  <CardHeader className="border-b border-border bg-primary/5">
                    <CardTitle className="text-lg text-primary flex items-center gap-2">
                      <Scale className="w-5 h-5" />
                      Case Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-foreground/50 uppercase tracking-wider mb-1">Case Title</p>
                        <p className="font-semibold text-foreground">{MOCK_RESPONSE.case.case_title}</p>
                      </div>
                      <div>
                        <p className="text-sm text-foreground/50 uppercase tracking-wider mb-1">Case Number</p>
                        <p className="font-semibold text-foreground">{MOCK_RESPONSE.case.case_number}</p>
                      </div>
                      <div>
                        <p className="text-sm text-foreground/50 uppercase tracking-wider mb-1">Case Type</p>
                        <p className="font-medium">{MOCK_RESPONSE.case.case_type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-foreground/50 uppercase tracking-wider mb-1">Court</p>
                        <p className="font-medium">{MOCK_RESPONSE.case.court}</p>
                      </div>
                      <div>
                        <p className="text-sm text-foreground/50 uppercase tracking-wider mb-1">Status</p>
                        <span className="px-3 py-1 bg-status-warning/10 text-status-warning rounded-full text-xs font-semibold">
                          {MOCK_RESPONSE.case.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-foreground/50 uppercase tracking-wider mb-1">Stage</p>
                        <p className="font-medium">{MOCK_RESPONSE.case.stage}</p>
                      </div>
                    </div>
                    
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-border">
                      <div>
                        <p className="text-sm text-foreground/50 uppercase tracking-wider mb-3">Acts</p>
                        <ul className="space-y-2">
                          {MOCK_RESPONSE.case.acts.map((act, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                              {act}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm text-foreground/50 uppercase tracking-wider mb-3">Sections</p>
                        <ul className="space-y-2">
                          {MOCK_RESPONSE.case.sections.map((section, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                              {section}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm text-foreground/50 uppercase tracking-wider mb-3">Precedents</p>
                        <ul className="space-y-2">
                          {MOCK_RESPONSE.case.precedents.map((precedent, i) => (
                            <li key={i} className="text-sm flex items-start gap-2 text-primary font-medium italic">
                              <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 opacity-50" />
                              {precedent}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Predictions */}
                <h3 className="text-lg font-bold font-ibm-plex-sans text-primary mt-10 mb-4 px-1">AI Predictions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="shadow-premium border-t-4 border-t-primary">
                    <CardHeader className="pb-2">
                      <CardDescription className="uppercase tracking-wider font-semibold text-primary/70">Complexity</CardDescription>
                      <CardTitle className="text-3xl font-ibm-plex-sans mt-2">{MOCK_RESPONSE.prediction.complexity}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mt-4 text-sm text-foreground/60 bg-background p-3 rounded-lg">
                        <FileText className="w-4 h-4 text-primary" />
                        Based on cited sections
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-premium border-t-4 border-t-status-error">
                    <CardHeader className="pb-2">
                      <CardDescription className="uppercase tracking-wider font-semibold text-primary/70">Adjournment Prob.</CardDescription>
                      <CardTitle className="text-3xl font-ibm-plex-sans mt-2 text-status-error">{MOCK_RESPONSE.prediction.adjournment_probability}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mt-4 text-sm text-foreground/60 bg-background p-3 rounded-lg border border-status-error/10">
                        <AlertTriangle className="w-4 h-4 text-status-error" />
                        High risk of delay
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-premium border-t-4 border-t-accent">
                    <CardHeader className="pb-2">
                      <CardDescription className="uppercase tracking-wider font-semibold text-primary/70">Predicted Duration</CardDescription>
                      <CardTitle className="text-3xl font-ibm-plex-sans mt-2">{MOCK_RESPONSE.prediction.predicted_duration_days} Days</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mt-4 text-sm text-foreground/60 bg-background p-3 rounded-lg">
                        <Clock className="w-4 h-4 text-accent" />
                        Estimated timeline
                      </div>
                    </CardContent>
                  </Card>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>
    </div>
  );
}
