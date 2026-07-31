"use client";

import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { FolderOpen, ArrowLeft, Hourglass } from "lucide-react";
import Link from "next/link";

export default function MyCasesComingSoon() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />

            <main className="flex-1 container mx-auto px-6 md:px-12 pt-32 pb-24 flex items-center justify-center">
                <div className="max-w-xl w-full">
                    <Card className="border-border shadow-premium overflow-hidden relative">
                        {/* Satyameva Jayate Background Watermark */}
                        <div
                            className="absolute inset-0 z-0 opacity-[0.03] bg-center bg-no-repeat bg-contain pointer-events-none"
                            style={{
                                backgroundImage: "url('/images/satyameva-jayate.png')",
                                backgroundSize: "60%",
                            }}
                        />

                        <CardContent className="p-12 md:p-16 flex flex-col items-center text-center relative z-10">
                            <div className="w-20 h-20 rounded-full bg-primary/5 text-accent flex items-center justify-center mb-8 relative">
                                <FolderOpen className="w-10 h-10" />
                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm border border-border">
                                    <Hourglass className="w-4 h-4 text-primary animate-pulse" />
                                </div>
                            </div>

                            <h1 className="text-3xl font-bold font-ibm-plex-sans text-primary mb-3">
                                My Cases Dashboard
                            </h1>

                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider mb-6">
                                Coming Soon
                            </div>

                            <p className="text-foreground/75 mb-10 leading-relaxed">
                                The cases dashboard, judicial roster tracking, and active case
                                history modules are currently under development. This feature will
                                be available in the upcoming release of the DocketIQ Judicial
                                Support platform.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                                <Link href="/prediction" className="w-full sm:w-auto">
                                    <button className="w-full sm:w-auto h-12 px-8 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition-colors shadow-premium flex items-center justify-center gap-2">
                                        <ArrowLeft className="w-4 h-4" />
                                        Go to Prediction Center
                                    </button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="text-center mt-6 text-xs text-foreground/40 font-semibold tracking-wider uppercase">
                        DocketIQ Judicial Platform &bull; Phase II
                    </div>
                </div>
            </main>
        </div>
    );
}
