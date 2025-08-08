"use client";

import { useState, useEffect } from 'react';
import { Progress } from "@/components/ui/progress";
import { arDashboardData } from "@/lib/data";
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WorkflowProgress() {
  const [progress, setProgress] = useState(0);
  const { workflowSteps } = arDashboardData;

  const totalSteps = workflowSteps.length;
  const completedSteps = workflowSteps.filter(step => step.status === 'completed').length;
  const finalProgress = (completedSteps / totalSteps) * 100;

  useEffect(() => {
    // Animate progress bar on component mount
    const timer = setTimeout(() => setProgress(finalProgress), 500);
    return () => clearTimeout(timer);
  }, [finalProgress]);

  return (
    <div className="space-y-4">
      <Progress value={progress} className="w-full h-3" />
      <ul className="space-y-4">
        {workflowSteps.map((step, index) => (
          <li key={index} className="flex items-center gap-3">
            <div
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center transition-colors",
                step.status === 'completed' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              <step.icon className="h-5 w-5" />
            </div>
            <span className={cn(
                "font-medium",
                step.status === 'completed' ? "text-foreground" : "text-muted-foreground"
            )}>
              {step.name}
            </span>
            {step.status === 'completed' && <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto" />}
          </li>
        ))}
      </ul>
    </div>
  );
}
