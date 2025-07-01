"use client"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Bar, CartesianGrid, XAxis, YAxis, BarChart as RechartsBarChart } from 'recharts';

type DashboardChartProps = {
    data: any[];
    chartConfig: ChartConfig;
};

export function DashboardChart({ data, chartConfig }: DashboardChartProps) {
    return (
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <RechartsBarChart data={data}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tickFormatter={(value) => `$${Number(value) / 1000}k`}
                />
                <ChartTooltip
                    content={<ChartTooltipContent />}
                />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                <Bar dataKey="purchases" fill="var(--color-purchases)" radius={4} />
            </RechartsBarChart>
        </ChartContainer>
    );
}
