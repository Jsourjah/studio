'use server';

/**
 * @fileOverview Implements anomaly detection for monthly reports, flagging discrepancies and suggesting possible causes.
 *
 * - reportAnomalyDetection - Analyzes monthly report data for anomalies and provides explanations.
 * - ReportAnomalyDetectionInput - The input type for the reportAnomalyDetection function.
 * - ReportAnomalyDetectionOutput - The return type for the reportAnomalyDetection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReportAnomalyDetectionInputSchema = z.object({
  currentReportData: z.string().describe('The data from the current monthly report.'),
  pastReportData: z.string().describe('The data from past monthly reports for comparison.'),
});
export type ReportAnomalyDetectionInput = z.infer<typeof ReportAnomalyDetectionInputSchema>;

const ReportAnomalyDetectionOutputSchema = z.object({
  hasAnomaly: z.boolean().describe('Whether a significant anomaly was detected.'),
  anomalyExplanation: z.string().describe('Explanation of the detected anomaly and potential causes.'),
});
export type ReportAnomalyDetectionOutput = z.infer<typeof ReportAnomalyDetectionOutputSchema>;

export async function reportAnomalyDetection(input: ReportAnomalyDetectionInput): Promise<ReportAnomalyDetectionOutput> {
  return reportAnomalyDetectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reportAnomalyDetectionPrompt',
  input: {schema: ReportAnomalyDetectionInputSchema},
  output: {schema: ReportAnomalyDetectionOutputSchema},
  prompt: `You are an expert business data analyst. Your task is to analyze monthly report data and detect any significant anomalies compared to past trends.

  Current Report Data:
  {{{currentReportData}}}

  Past Report Data:
  {{{pastReportData}}}

  Determine if there are any large discrepancies between the current report and past reports. If there is, explain the anomaly and provide possible reasons for the change.  Be specific, and describe which metrics had the largest changes.  If there is no anomaly, state that clearly.
  Set the hasAnomaly field to true if there are anomalies and false otherwise.

  Provide your response in a valid JSON object that conforms to the specified output schema. Do not include any text outside of the JSON object.
`,
});

const reportAnomalyDetectionFlow = ai.defineFlow(
  {
    name: 'reportAnomalyDetectionFlow',
    inputSchema: ReportAnomalyDetectionInputSchema,
    outputSchema: ReportAnomalyDetectionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model failed to generate a valid analysis. Please try again.');
    }
    return output;
  }
);
