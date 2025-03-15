// src/app/View/page.tsx
"use client";

import DashboardComponent from "@/components/dashboard/Dashboard";

export default function ViewPage() {
  return (
    <div className="pt-16"> {/* Adjust padding-top (pt-16 = 4rem = 64px) based on your Navbar height */}
      <DashboardComponent />
    </div>
  );
}