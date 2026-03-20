"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { GrowthChartCard } from "@/components/growth/growth-chart-card";
import { GrowthFormSheet } from "@/components/growth/growth-form-sheet";
import { useAppData } from "@/components/providers/app-data-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { GROWTH_TYPES } from "@/lib/constants";
import type { GrowthMetric } from "@/lib/types";
import { formatDate, getMetricUnit } from "@/lib/utils";

export default function GrowthPage() {
  const { status, growthMetrics, selectedBaby, deleteGrowthMetric } = useAppData();
  const [formOpen, setFormOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState<GrowthMetric | null>(null);

  const orderedMetrics = useMemo(
    () => [...growthMetrics].sort((a, b) => b.recordedOn.localeCompare(a.recordedOn)),
    [growthMetrics],
  );

  if (status === "loading" || status === "idle") {
    return <LoadingState label="正在加载成长数据..." />;
  }

  if (!selectedBaby) {
    return (
      <EmptyState
        description="先创建宝宝档案，再慢慢积累身高、体重和头围数据。"
        title="还没有可展示的成长数据"
      />
    );
  }

  return (
    <>
      <div className="space-y-6">
        <SectionHeading
          action={
            <Button
              onClick={() => {
                setEditingMetric(null);
                setFormOpen(true);
              }}
              type="button"
            >
              <Plus className="mr-2 h-4 w-4" />
              新增数据
            </Button>
          }
          eyebrow="Growth"
          description="用清晰的趋势图观察阶段变化，空状态下也会给出轻提示。"
          title={`${selectedBaby.name} 的成长数据`}
        />

        <div className="grid gap-4 xl:grid-cols-3">
          {GROWTH_TYPES.map((item) => (
            <GrowthChartCard
              key={item.value}
              label={item.label}
              metrics={growthMetrics}
              type={item.value}
            />
          ))}
        </div>

        {orderedMetrics.length > 0 ? (
          <Card className="space-y-4">
            <SectionHeading title="历史记录" />
            <div className="space-y-3">
              {orderedMetrics.map((metric) => (
                <div
                  key={metric.id}
                  className="flex flex-col gap-3 rounded-[24px] border border-[#eee1d8] bg-[#fffdf9] p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-sm text-slate-400">{formatDate(metric.recordedOn)}</p>
                    <h3 className="mt-1 text-base font-bold text-slate-900">
                      {GROWTH_TYPES.find((item) => item.value === metric.type)?.label}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {metric.notes || "无备注"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-black tracking-tight text-slate-900">
                      {metric.value} {getMetricUnit(metric.type)}
                    </p>
                    <Button
                      onClick={() => {
                        setEditingMetric(metric);
                        setFormOpen(true);
                      }}
                      type="button"
                      variant="secondary"
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      编辑
                    </Button>
                    <Button
                      onClick={() => void deleteGrowthMetric(metric.id)}
                      type="button"
                      variant="danger"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      删除
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <EmptyState
            actionLabel="新增第一条成长数据"
            description="先记一次儿保数据，图表和历史列表就会立刻出现。"
            onAction={() => setFormOpen(true)}
            title="还没有成长数据"
          />
        )}
      </div>

      <GrowthFormSheet
        babyId={selectedBaby.id}
        metric={editingMetric}
        onClose={() => {
          setEditingMetric(null);
          setFormOpen(false);
        }}
        open={formOpen}
      />
    </>
  );
}
