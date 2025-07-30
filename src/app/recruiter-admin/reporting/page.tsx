
"use client";

import Header from "@/components/Header";
import ReportGenerator from "@/components/ReportGenerator";

export default function ReportingPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <ReportGenerator />
      </main>
    </div>
  );
}
