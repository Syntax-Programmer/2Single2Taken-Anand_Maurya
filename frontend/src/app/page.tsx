"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Scale, Clock, AlertTriangle, FileText, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-black/30"
            style={{ backgroundImage: "url('/images/supreme-court.jpg')" }}
          />
          {/* Soft white overlay for premium government grade look */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px]" />
        </div>

        <div className="container relative z-10 mx-auto px-6 md:px-12 flex flex-col items-center text-center mt-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary mb-8 text-sm font-medium">
              <Scale className="w-4 h-4" />
              <span>Official Decision Support System</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold font-ibm-plex-sans text-primary tracking-tight leading-tight mb-6">
              Smarter Scheduling. <br className="hidden md:block" />
              <span className="text-accent">Faster Justice.</span>
            </h1>

            <p className="text-lg md:text-xl text-foreground/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Helping courts improve scheduling through Hearing Duration Prediction, 
              Adjournment Risk Prediction and Case Complexity Classification.
            </p>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href="/prediction">
                <Button size="lg" className="rounded-full shadow-premium text-base gap-2">
                  Upload Judicial Case Document
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-50"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <span className="text-sm text-primary font-medium mb-2 uppercase tracking-widest">Explore</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-primary to-transparent" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32 relative z-10 bg-background">
        <div className="container mx-auto px-6 md:px-12">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-ibm-plex-sans text-primary mb-4">
              Core Capabilities
            </h2>
            <div className="w-16 h-1 bg-accent mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <Card className="h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-none shadow-premium group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <Clock className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl text-primary font-ibm-plex-sans">Hearing Duration Prediction</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Estimate hearing duration to optimize daily cause lists and allocate appropriate time slots for each matter.
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Card className="h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-none shadow-premium group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl text-primary font-ibm-plex-sans">Adjournment Risk Prediction</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Estimate adjournment probability based on historical patterns, party behaviors, and case characteristics.
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Card className="h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-none shadow-premium group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <FileText className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl text-primary font-ibm-plex-sans">Case Complexity Classification</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Classify cases into Low, Medium and High complexity to assign appropriate benches and manage workload.
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-border bg-white py-8 mt-auto">
        <div className="container mx-auto px-6 text-center text-sm text-foreground/60">
          &copy; {new Date().getFullYear()} DocketIQ Judicial Decision Support System. Official Platform.
        </div>
      </footer>
    </div>
  );
}
