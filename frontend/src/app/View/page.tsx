// src/app/View/page.tsx
"use client";

import DashboardComponent from "@/components/dashboard/Dashboard";
import VoiceComponent from "@/components/VoiceComponent";
import { Mic } from "lucide-react";

export default function ViewPage() {
  return (
    <div className="pt-16"> {/* Adjust padding-top (pt-16 = 4rem = 64px) based on your Navbar height */}
      <DashboardComponent />
      <div className="mt-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-6 border border-purple-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-700">Voice Assistant</h3>
            <Mic className="w-5 h-5 text-indigo-500" />
          </div>
          <VoiceComponent />
        </div>
    </div>
  );
}