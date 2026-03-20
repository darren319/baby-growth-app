"use client";

import { useMemo, useState } from "react";

import { MemoryDetailSheet } from "@/components/memories/memory-detail-sheet";
import { useAppData } from "@/components/providers/app-data-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/field";
import { LoadingState } from "@/components/ui/loading-state";
import { SectionHeading } from "@/components/ui/section-heading";
import type { MemoryRecord } from "@/lib/types";
import { firstMediaPreview, formatDate, formatDateTime, monthKey } from "@/lib/utils";

export default function TimelinePage() {
  const { status, memories, selectedBaby } = useAppData();
  const [mode, setMode] = useState<"day" | "month">("day");
  const [monthFilter, setMonthFilter] = useState("");
  const [detailMemory, setDetailMemory] = useState<MemoryRecord | null>(null);

  const monthOptions = useMemo(
    () => Array.from(new Set(memories.map((memory) => monthKey(memory.recordedAt)))),
    [memories],
  );

  const filteredMemories = useMemo(
    () =>
      memories.filter((memory) =>
        monthFilter ? monthKey(memory.recordedAt) === monthFilter : true,
      ),
    [memories, monthFilter],
  );

  const groups = useMemo(() => {
    return filteredMemories.reduce<Record<string, MemoryRecord[]>>((acc, memory) => {
      const key = mode === "day" ? formatDate(memory.recordedAt) : monthKey(memory.recordedAt);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(memory);
      return acc;
    }, {});
  }, [filteredMemories, mode]);

  const keys = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  if (status === "loading" || status === "idle") {
    return <LoadingState label="正在整理成长时间轴..." />;
  }

  if (!selectedBaby) {
    return (
      <EmptyState
        description="先创建宝宝，再来用时间轴回顾每天和每个月的成长变化。"
        title="还没有可展示的时间轴"
      />
    );
  }

  return (
    <>
      <div className="space-y-6">
        <SectionHeading
          action={
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 rounded-[24px] bg-[#fff6ef] p-1.5">
                <button
                  className={`rounded-[18px] px-4 py-2 text-sm font-semibold transition ${
                    mode === "day" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                  }`}
                  onClick={() => setMode("day")}
                  type="button"
                >
                  按日查看
                </button>
                <button
                  className={`rounded-[18px] px-4 py-2 text-sm font-semibold transition ${
                    mode === "month" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                  }`}
                  onClick={() => setMode("month")}
                  type="button"
                >
                  按月查看
                </button>
              </div>
              <Select
                onChange={(event) => setMonthFilter(event.target.value)}
                value={monthFilter}
              >
                <option value="">全部月份</option>
                {monthOptions.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </Select>
            </div>
          }
          eyebrow="Timeline"
          description="把日常记录按时间顺序串起来，支持切换日 / 月视图和按月份快速回看。"
          title={`${selectedBaby.name} 的成长时间轴`}
        />

        <div className="flex flex-wrap gap-2">
          <Badge className="bg-[#fff3ea] text-[#a76446]">
            当前共 {filteredMemories.length} 条记录
          </Badge>
          <Badge>{mode === "day" ? "按天编排" : "按月编排"}</Badge>
          {monthFilter ? <Badge>{monthFilter}</Badge> : null}
        </div>

        {keys.length > 0 ? (
          <div className="space-y-5">
            {keys.map((key) => (
              <section key={key} className="grid gap-3 md:grid-cols-[140px_1fr]">
                <div className="pt-2">
                  <Badge className="bg-[#fff3ea] text-[#a76446]">{key}</Badge>
                </div>
                <div className="space-y-3 border-l border-dashed border-[#e8d4c8] pl-4 md:pl-6">
                  {groups[key]
                    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))
                    .map((memory) => {
                      const preview = firstMediaPreview(memory.media);
                      return (
                        <Card key={memory.id} className="relative overflow-hidden">
                          <div className="grid gap-4 md:grid-cols-[1fr_160px]">
                            <div>
                              <p className="text-sm text-slate-400">
                                {formatDateTime(memory.recordedAt)}
                              </p>
                              <h3 className="mt-1 text-lg font-black tracking-tight text-slate-900">
                                {memory.title}
                              </h3>
                              <p className="mt-2 text-sm leading-7 text-slate-600">
                                {memory.content}
                              </p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {memory.tags.map((tag) => (
                                  <Badge key={tag}>{tag}</Badge>
                                ))}
                              </div>
                              <Button
                                className="mt-4"
                                onClick={() => setDetailMemory(memory)}
                                type="button"
                                variant="secondary"
                              >
                                查看详情
                              </Button>
                            </div>
                            {preview ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                alt={memory.title}
                                className="h-40 w-full rounded-[24px] object-cover"
                                src={preview}
                              />
                            ) : null}
                          </div>
                        </Card>
                      );
                    })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <EmptyState
            description="成长记录会自动进入时间轴。写下第一条记录后，这里就会有温暖的回顾感。"
            title="时间轴还是空的"
          />
        )}
      </div>

      <MemoryDetailSheet
        memory={detailMemory}
        onClose={() => setDetailMemory(null)}
        open={Boolean(detailMemory)}
      />
    </>
  );
}
