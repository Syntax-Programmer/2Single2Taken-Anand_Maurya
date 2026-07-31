"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    UploadCloud,
    FileText,
    CheckCircle2,
    Loader2,
    AlertCircle,
    Scale,
    Clock,
    AlertTriangle,
    CheckCircle,
    ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
    "Upload DOCX",
    "Upload Progress",
    "Reading Document",
    "Extracting Case Information",
    "Running ML Models",
    "Displaying Judicial Analysis Report",
];

interface PredictionResponse {
    case: {
        case_title: string | null;
        case_number: string | null;
        case_type: string | null;
        court: string | null;
        status: string | null;
        stage: string | null;
        acts: string[];
        sections: string[];
        precedents: string[];
    };

    prediction: {
        complexity: number;
        adjournment_probability: number;
        predicted_duration_days: number;
    };
}

export default function PredictionCenter() {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(-1); // -1 means upload stage
    const [uploadProgress, setUploadProgress] = useState(0);
    const [response, setResponse] = useState<PredictionResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const processFile = async (selectedFile: File) => {
        if (!selectedFile.name.toLowerCase().endsWith(".docx")) {
            alert("Please upload a .docx file.");
            return;
        }

        setFile(selectedFile);
        setResponse(null);
        setError(null);
        setUploadProgress(0);

        await startProcessing(selectedFile);
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

    const startProcessing = async (selectedFile: File) => {
        try {
            setCurrentStepIndex(0);

            const formData = new FormData();

            formData.append("file", selectedFile);

            setCurrentStepIndex(1);
            setUploadProgress(25);

            const apiUrl = process.env.NEXT_PUBLIC_API_URL;

            if (!apiUrl) {
                throw new Error("NEXT_PUBLIC_API_URL is not configured.");
            }

            setUploadProgress(50);
            setCurrentStepIndex(2);

            const apiResponse = await fetch(
                `${apiUrl}/api/v1/predictions/case`, // CHANGE if your /docs route differs
                {
                    method: "POST",
                    body: formData,
                },
            );

            setUploadProgress(100);

            if (!apiResponse.ok) {
                const errorText = await apiResponse.text();

                throw new Error(`Backend returned ${apiResponse.status}: ${errorText}`);
            }

            setCurrentStepIndex(3);

            const data: PredictionResponse = await apiResponse.json();

            setCurrentStepIndex(4);

            setResponse(data);

            setCurrentStepIndex(5);
        } catch (err) {
            console.error(err);

            setError(err instanceof Error ? err.message : "An unexpected error occurred.");

            setCurrentStepIndex(-1);
        }
    };

    const resetProcess = () => {
        setFile(null);
        setResponse(null);
        setError(null);
        setCurrentStepIndex(-1);
        setUploadProgress(0);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
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
                                <Card className="relative overflow-hidden border-2 border-dashed border-border bg-white/90 backdrop-blur-sm">
                                    {/* Satyameva Jayate Background */}
                                    <div
                                        className="absolute inset-0 z-0 opacity-10 bg-center bg-no-repeat pointer-events-none"
                                        style={{
                                            backgroundImage: "url('/images/satyameva-jayate.png')",
                                            backgroundSize: "280px",
                                            backgroundPosition: "center",
                                        }}
                                    />

                                    <div
                                        className={cn(
                                            "relative z-10 flex flex-col items-center justify-center p-16 md:p-24 transition-colors",
                                            isDragging
                                                ? "bg-primary/5"
                                                : "bg-transparent hover:bg-primary/[0.02]",
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
                                        <CardTitle className="text-2xl text-primary font-ibm-plex-sans mb-2">
                                            Upload Judicial Case Document
                                        </CardTitle>
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
                                                    <div
                                                        className={cn(
                                                            "w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 shrink-0",
                                                            isPast
                                                                ? "bg-primary text-white"
                                                                : isActive
                                                                  ? "bg-accent text-white"
                                                                  : "bg-border text-foreground/40",
                                                        )}
                                                    >
                                                        {isPast ? (
                                                            <CheckCircle2 className="w-5 h-5" />
                                                        ) : isActive ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <div className="w-2 h-2 rounded-full bg-current" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p
                                                            className={cn(
                                                                "font-medium transition-colors duration-300",
                                                                isPast
                                                                    ? "text-primary"
                                                                    : isActive
                                                                      ? "text-accent"
                                                                      : "text-foreground/40",
                                                            )}
                                                        >
                                                            {step}
                                                        </p>
                                                        {index === 1 && (isActive || isPast) && (
                                                            <div className="w-full h-1.5 bg-border rounded-full mt-2 overflow-hidden">
                                                                <motion.div
                                                                    className="h-full bg-accent"
                                                                    initial={{ width: 0 }}
                                                                    animate={{
                                                                        width: `${uploadProgress}%`,
                                                                    }}
                                                                    transition={{
                                                                        ease: "linear",
                                                                        duration: 0.1,
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
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
                                        <h2 className="text-2xl font-bold font-ibm-plex-sans text-primary">
                                            Judicial Analysis Report
                                        </h2>
                                        <p className="text-foreground/70 flex items-center gap-2 mt-1">
                                            <FileText className="w-4 h-4" />
                                            {file?.name || "document.docx"}
                                        </p>
                                    </div>
                                    <button
                                        onClick={resetProcess}
                                        className="text-sm font-medium text-accent hover:underline"
                                    >
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
                                                <p className="text-sm text-foreground/50 uppercase tracking-wider mb-1">
                                                    Case Title
                                                </p>
                                                <p className="font-semibold text-foreground">
                                                    {response?.case.case_title ?? "Not available"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-foreground/50 uppercase tracking-wider mb-1">
                                                    Case Number
                                                </p>
                                                <p className="font-semibold text-foreground">
                                                    {response?.case.case_number ?? "Not available"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-foreground/50 uppercase tracking-wider mb-1">
                                                    Case Type
                                                </p>
                                                <p className="font-medium">
                                                    {response?.case.case_type ?? "Not available"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-foreground/50 uppercase tracking-wider mb-1">
                                                    Court
                                                </p>
                                                <p className="font-medium">
                                                    {response?.case.court ?? "Not available"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-foreground/50 uppercase tracking-wider mb-1">
                                                    Status
                                                </p>
                                                <span className="px-3 py-1 bg-status-warning/10 text-status-warning rounded-full text-xs font-semibold">
                                                    {response?.case.status ?? "Unknown"}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm text-foreground/50 uppercase tracking-wider mb-1">
                                                    Stage
                                                </p>
                                                <p className="font-medium">
                                                    {response?.case.stage ?? "Unknown"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-border">
                                            <div>
                                                <p className="text-sm text-foreground/50 uppercase tracking-wider mb-3">
                                                    Acts
                                                </p>
                                                <ul className="space-y-2">
                                                    {response?.case.acts.map((act, i) => (
                                                        <li
                                                            key={i}
                                                            className="text-sm flex items-start gap-2"
                                                        >
                                                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                                            {act}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <p className="text-sm text-foreground/50 uppercase tracking-wider mb-3">
                                                    Sections
                                                </p>
                                                <ul className="space-y-2">
                                                    {response?.case.sections.map((section, i) => (
                                                        <li
                                                            key={i}
                                                            className="text-sm flex items-start gap-2"
                                                        >
                                                            <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                                                            {section}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <p className="text-sm text-foreground/50 uppercase tracking-wider mb-3">
                                                    Precedents
                                                </p>
                                                <ul className="space-y-2">
                                                    {response?.case.precedents.map(
                                                        (precedent, i) => (
                                                            <li
                                                                key={i}
                                                                className="text-sm flex items-start gap-2 text-primary font-medium italic"
                                                            >
                                                                <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 opacity-50" />
                                                                {precedent}
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Predictions */}
                                <h3 className="text-lg font-bold font-ibm-plex-sans text-primary mt-10 mb-4 px-1">
                                    AI Predictions
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Card className="shadow-premium border-t-4 border-t-primary">
                                        <CardHeader className="pb-2">
                                            <CardDescription className="uppercase tracking-wider font-semibold text-primary/70">
                                                Complexity
                                            </CardDescription>
                                            <CardTitle className="text-3xl font-ibm-plex-sans mt-2">
                                                {response?.prediction.complexity}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center gap-2 mt-4 text-sm text-foreground/60 bg-background p-3 rounded-lg">
                                                <FileText className="w-4 h-4 text-primary" />
                                                Based on cited sections
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {(() => {
                                        const probability =
                                            response?.prediction.adjournment_probability ?? 0;

                                        const risk =
                                            probability >= 65
                                                ? {
                                                      label: "High risk of delay",
                                                      border: "border-t-status-error",
                                                      text: "text-status-error",
                                                      borderLight: "border-status-error/10",
                                                      Icon: AlertTriangle,
                                                  }
                                                : probability >= 35
                                                  ? {
                                                        label: "Moderate risk of delay",
                                                        border: "border-t-yellow-500",
                                                        text: "text-yellow-600",
                                                        borderLight: "border-yellow-500/10",
                                                        Icon: AlertTriangle,
                                                    }
                                                  : {
                                                        label: "Low risk of delay",
                                                        border: "border-t-green-500",
                                                        text: "text-green-600",
                                                        borderLight: "border-green-500/10",
                                                        Icon: CheckCircle,
                                                    };

                                        const RiskIcon = risk.Icon;

                                        return (
                                            <Card
                                                className={`shadow-premium border-t-4 ${risk.border}`}
                                            >
                                                <CardHeader className="pb-2">
                                                    <CardDescription className="uppercase tracking-wider font-semibold text-primary/70">
                                                        Adjournment Probability
                                                    </CardDescription>

                                                    <CardTitle
                                                        className={`text-3xl font-ibm-plex-sans mt-2 ${risk.text}`}
                                                    >
                                                        {probability.toFixed(1)}%
                                                    </CardTitle>
                                                </CardHeader>

                                                <CardContent>
                                                    <div
                                                        className={`flex items-center gap-2 mt-4 text-sm bg-background p-3 rounded-lg border ${risk.borderLight}`}
                                                    >
                                                        <RiskIcon
                                                            className={`w-4 h-4 ${risk.text}`}
                                                        />

                                                        <span className={risk.text}>
                                                            {risk.label}
                                                        </span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })()}

                                    <Card className="shadow-premium border-t-4 border-t-accent">
                                        <CardHeader className="pb-2">
                                            <CardDescription className="uppercase tracking-wider font-semibold text-primary/70">
                                                Predicted Duration
                                            </CardDescription>
                                            <CardTitle className="text-3xl font-ibm-plex-sans mt-2">
                                                {response?.prediction.predicted_duration_days} Days
                                            </CardTitle>
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
