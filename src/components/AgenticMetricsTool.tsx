"use client";

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
// import { handleGetInsights } from '@/app/actions';

export default function AgenticMetricsTool() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [queueData, setQueueData] = useState('{"queue_a": 10, "queue_b": 5}');
  const [latencyData, setLatencyData] = useState('{"avg_latency_ms": 150, "p95_latency_ms": 400}');
  const [errorRateData, setErrorRateData] = useState('{"total_requests": 1000, "failed_requests": 15}');
  const [insights, setInsights] = useState<string | null>(null);

  const handleSubmit = () => {
    // startTransition(async () => {
    //   const result = await handleGetInsights({ queueData, latencyData, errorRateData });
    //   if (result.success) {
    //     setInsights(result.insights);
    //   } else {
    //     toast({
    //       variant: 'destructive',
    //       title: 'Error Generating Insights',
    //       description: result.error,
    //     });
    //     setInsights(null);
    //   }
    //  });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agentic Framework Metrics</CardTitle>
        <CardDescription>Input framework-managed data to generate AI-powered insights on performance.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="queue-data">Queue Data (JSON)</Label>
            <Textarea
              id="queue-data"
              placeholder='e.g., {"queue_a": 10, "queue_b": 5}'
              className="font-code h-32"
              value={queueData}
              onChange={(e) => setQueueData(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="latency-data">Latency Data (JSON)</Label>
            <Textarea
              id="latency-data"
              placeholder='e.g., {"avg_latency_ms": 150, "p95_latency_ms": 400}'
              className="font-code h-32"
              value={latencyData}
              onChange={(e) => setLatencyData(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="error-rate-data">Error Rate Data (JSON)</Label>
            <Textarea
              id="error-rate-data"
              placeholder='e.g., {"total_requests": 1000, "failed_requests": 15}'
              className="font-code h-32"
              value={errorRateData}
              onChange={(e) => setErrorRateData(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Insights
            </>
          )}
        </Button>

        {insights && (
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle>Generated Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="font-code text-sm whitespace-pre-wrap p-4 bg-background rounded-md overflow-x-auto">
                {insights}
              </pre>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
