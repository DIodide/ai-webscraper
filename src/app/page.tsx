"use client";

import { useState } from "react";
import { AmbientBackground } from "@/components/ui/ambient-background";
import { WebsiteAnalysisForm } from "@/components/website-analysis-form";
import type { FormState, LoadingState } from "@/types/analyze";

export default function Home() {
  // Form state
  const [formState, setFormState] = useState<FormState>({
    url: "",
    prompt: "",
  });

  // Loading states
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    isAnalyzingResume: false,
  });

  const handleFormChange = (field: keyof FormState, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    // TODO: Implement API to analyze the website



  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black flex flex-col items-center p-4 relative overflow-x-hidden">
      <AmbientBackground />

      <main className="w-full max-w-2xl mx-auto text-center space-y-12 relative py-16 mt-[15vh]">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-violet-400 to-blue-400 bg-gradient-moving animate-gradient text-transparent bg-clip-text pb-2">
          Analyze Any Website
        </h1>

        <WebsiteAnalysisForm
          formState={formState}
          isLoading={loadingState.isLoading}
          onSubmit={handleSubmit}
          onFormChange={handleFormChange}
        />
      </main>
    </div>
  );
}
