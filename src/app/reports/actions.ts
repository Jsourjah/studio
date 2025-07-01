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
    // It's better to return a generic error message to the client
    return { success: false, error: 'An unexpected error occurred while analyzing the report. Please try again later.' };
  }
}
