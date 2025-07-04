'use server';

import {
  reportAnomalyDetection,
  type ReportAnomalyDetectionInput,
  type ReportAnomalyDetectionOutput,
} from '@/ai/flows/report-anomaly-detection';

export async function checkReportAnomaly(
  data: ReportAnomalyDetectionInput
): Promise<{ success: true, data: ReportAnomalyDetectionOutput } | { success: false, error: string }> {
  try {
    const result = await reportAnomalyDetection(data);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in anomaly detection flow:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Analysis failed: ${errorMessage}` };
  }
}
