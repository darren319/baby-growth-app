"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardTitle } from "@/components/ui/card";
import type { GrowthMetric, GrowthMetricType } from "@/lib/types";
import { formatDate, getMetricUnit } from "@/lib/utils";

export function GrowthChartCard({
  type,
  label,
  metrics,
}: {
  type: GrowthMetricType;
  label: string;
  metrics: GrowthMetric[];
}) {
  const items = metrics
    .filter((metric) => metric.type === type)
    .sort((a, b) => a.recordedOn.localeCompare(b.recordedOn))
    .map((metric) => ({
      ...metric,
      label: metric.recordedOn.slice(5),
    }));

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <CardTitle>{label}</CardTitle>
          <p className="mt-1 text-sm text-slate-500">
            共 {items.length} 条记录，单位 {getMetricUnit(type)}
          </p>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={items}>
              <CartesianGrid stroke="#f3e6dd" strokeDasharray="3 3" />
              <XAxis dataKey="label" stroke="#b89480" />
              <YAxis stroke="#b89480" />
              <Tooltip
                contentStyle={{
                  borderRadius: 18,
                  border: "1px solid #f0d8cb",
                  background: "rgba(255,255,255,0.96)",
                }}
                formatter={(value) => `${value ?? "--"} ${getMetricUnit(type)}`}
                labelFormatter={(value) => `日期：${value}`}
              />
              <Line
                dataKey="value"
                dot={{ fill: "#ee8e83", r: 4 }}
                stroke="#ee8e83"
                strokeWidth={3}
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="rounded-[24px] bg-[#fff8f2] px-4 py-8 text-sm text-slate-500">
          暂时还没有 {label} 数据，添加第一条记录后这里会显示趋势图。
        </div>
      )}

      {items.length > 0 ? (
        <div className="space-y-2 rounded-[24px] bg-[#fff8f2] p-4">
          {items.slice(-3).reverse().map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 text-sm text-slate-600"
            >
              <span>{formatDate(item.recordedOn)}</span>
              <span className="font-semibold text-slate-900">
                {item.value} {getMetricUnit(type)}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  );
}
