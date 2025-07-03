"use client"

import * as React from "react"
import { Label, Pie, PieChart as RechartsPieChart } from "recharts"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

type DashboardChartProps = {
    data: any[];
    chartConfig: ChartConfig;
};

export function DashboardChart({ data, chartConfig }: DashboardChartProps) {
    const totalValue = React.useMemo(() => {
        return data.reduce((acc, curr) => acc + curr.value, 0);
    }, [data]);

    return (
        <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square h-full max-h-[300px]"
        >
            <RechartsPieChart>
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="60%"
                    strokeWidth={5}
                >
                    <Label
                        content={({ viewBox }) => {
                            if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                return (
                                    <text
                                        x={viewBox.cx}
                                        y={viewBox.cy}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                    >
                                        <tspan
                                            x={viewBox.cx}
                                            y={viewBox.cy}
                                            className="fill-foreground text-3xl font-bold"
                                        >
                                            {`$${(totalValue / 1000).toFixed(1)}k`}
                                        </tspan>
                                        <tspan
                                            x={viewBox.cx}
                                            y={(viewBox.cy || 0) + 24}
                                            className="fill-muted-foreground"
                                        >
                                            Total
                                        </tspan>
                                    </text>
                                )
                            }
                        }}
                    />
                </Pie>
                <ChartLegend
                    content={<ChartLegendContent nameKey="name" />}
                    verticalAlign="bottom"
                    height={50}
                />
            </RechartsPieChart>
        </ChartContainer>
    );
}
