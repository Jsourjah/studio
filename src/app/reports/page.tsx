"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { checkReportAnomaly } from './actions';
import { ReportAnomalyDetectionOutput } from '@/ai/flows/report-anomaly-detection';
import { Loader2, Sparkles, FileDown, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const sampleCurrentReport = JSON.stringify({
  "total_sales": 12500,
  "net_profit": 3500,
  "new_customers": 15,
  "customer_churn_rate": 0.25,
  "average_sale_value": 833
}, null, 2);

const samplePastReports = JSON.stringify({
  "monthly_averages": {
    "total_sales": 8200,
    "net_profit": 2100,
    "new_customers": 12,
    "customer_churn_rate": 0.05,
    "average_sale_value": 683
  }
}, null, 2);


export default function ReportsPage() {
  const [currentReportData, setCurrentReportData] = useState(sampleCurrentReport);
  const [pastReportData, setPastReportData] = useState(samplePastReports);
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<ReportAnomalyDetectionOutput | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAiResult(null);

    try {
      JSON.parse(currentReportData);
      JSON.parse(pastReportData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Invalid JSON format",
        description: "Please ensure both data fields contain valid JSON.",
      });
      setIsLoading(false);
      return;
    }

    const result = await checkReportAnomaly({ currentReportData, pastReportData });

    if (result.success) {
      setAiResult(result.data);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Monthly Report Anomaly Detection</CardTitle>
            <CardDescription>
              Generate a monthly report and use AI to detect any significant anomalies compared to past data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current-report">Current Report Data (JSON)</Label>
                <Textarea
                  id="current-report"
                  value={currentReportData}
                  onChange={(e) => setCurrentReportData(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                  placeholder="Enter current month's report data in JSON format."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="past-reports">Past Reports Data (JSON)</Label>
                <Textarea
                  id="past-reports"
                  value={pastReportData}
                  onChange={(e) => setPastReportData(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                  placeholder="Enter past months' aggregated data in JSON format."
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate & Analyze Report
            </Button>
            <Button variant="outline" disabled>
              <FileDown className="mr-2 h-4 w-4" />
              Download as PDF
            </Button>
          </CardFooter>
        </form>
      </Card>

      {aiResult && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Result</CardTitle>
          </CardHeader>
          <CardContent>
            {aiResult.hasAnomaly ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Anomaly Detected!</AlertTitle>
                <AlertDescription>
                  <p className="whitespace-pre-wrap">{aiResult.anomalyExplanation}</p>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertTitle>No Significant Anomalies Detected</AlertTitle>
                <AlertDescription>
                  <p className="whitespace-pre-wrap">{aiResult.anomalyExplanation}</p>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
