"use client";

import type { ComponentType } from "react";
import { useMemo, useState } from "react";
import { Camera, Heart, Plus, Ruler, Sparkles, Target } from "lucide-react";

import { BabyFormSheet } from "@/components/babies/baby-form-sheet";
import { GrowthFormSheet } from "@/components/growth/growth-form-sheet";
import { MemoryDetailSheet } from "@/components/memories/memory-detail-sheet";
import { MemoryFormSheet } from "@/components/memories/memory-form-sheet";
import { MilestoneFormSheet } from "@/components/milestones/milestone-form-sheet";
import { useAppData } from "@/components/providers/app-data-provider";
import { MediaThumb } from "@/components/shared/media-thumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { calculateAgeLabel, formatDate, formatDateTime, getMetricUnit } from "@/lib/utils";

export default function DashboardPage() {
  const {
    status,
    selectedBaby,
    babies,
    recentMemories,
    recentMilestones,
    growthMetrics,
    galleryAssets,
  } = useAppData();
  const [babySheetOpen, setBabySheetOpen] = useState(false);
  const [memorySheetOpen, setMemorySheetOpen] = useState(false);
  const [milestoneSheetOpen, setMilestoneSheetOpen] = useState(false);
  const [growthSheetOpen, setGrowthSheetOpen] = useState(false);
  const [detailMemoryId, setDetailMemoryId] = useState<string | null>(null);

  const detailMemory = recentMemories.find((item) => item.id === detailMemoryId) ?? null;

  const latestMetrics = useMemo(() => {
    return ["height", "weight", "head_circumference"].map((type) => {
      const metric = growthMetrics
        .filter((item) => item.type === type)
        .sort((a, b) => b.recordedOn.localeCompare(a.recordedOn))[0];
      return metric;
    });
  }, [growthMetrics]);

  if (status === "loading" || status === "idle") {
    return <LoadingState label="正在整理首页内容..." />;
  }

  if (!selectedBaby) {
    return (
      <>
        <EmptyState
          actionLabel="创建第一个宝宝档案"
          description="先创建宝宝资料，首页、记录、相册、里程碑和成长数据就会围绕这个档案展开。"
          onAction={() => setBabySheetOpen(true)}
          title="还没有宝宝档案"
        />
        <BabyFormSheet open={babySheetOpen} onClose={() => setBabySheetOpen(false)} />
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <SectionHeading
          action={
            <Button onClick={() => setMemorySheetOpen(true)} type="button">
              <Plus className="mr-2 h-4 w-4" />
              新增记录
            </Button>
          }
          eyebrow="Dashboard"
          description="把最近最重要的内容放在首页，方便你每天拿起手机就能快速记录。"
          title="今日陪伴面板"
        />

        <Card className="overflow-hidden bg-[linear-gradient(160deg,#fff4eb_0%,#ffffff_52%,#eef7f1_100%)]">
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="flex gap-4">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[30px] bg-[#fff1e8]">
                {selectedBaby.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={selectedBaby.name}
                    className="h-full w-full object-cover"
                    src={selectedBaby.avatarUrl}
                  />
                ) : null}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-black tracking-tight text-slate-900">
                    {selectedBaby.name}
                  </h1>
                  <Badge>{calculateAgeLabel(selectedBaby.birthDate)}</Badge>
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  出生于 {formatDate(selectedBaby.birthDate)}
                  {selectedBaby.notes ? ` · ${selectedBaby.notes}` : ""}
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Button onClick={() => setMemorySheetOpen(true)} type="button">
                    新增记录
                  </Button>
                  <Button onClick={() => setMilestoneSheetOpen(true)} type="button" variant="secondary">
                    新增里程碑
                  </Button>
                  <Button onClick={() => setGrowthSheetOpen(true)} type="button" variant="secondary">
                    新增成长数据
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <QuickStat icon={Sparkles} label="最近记录" value={`${recentMemories.length} 条`} />
              <QuickStat icon={Camera} label="媒体素材" value={`${galleryAssets.length} 个`} />
              <QuickStat icon={Target} label="里程碑" value={`${recentMilestones.length} 条`} />
              <QuickStat icon={Ruler} label="宝宝档案" value={`${babies.length} 个`} />
            </div>
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
          <div className="space-y-6">
            <section className="space-y-4">
              <SectionHeading title="最近记录" />
              <div className="space-y-3">
                {recentMemories.length > 0 ? (
                  recentMemories.map((memory) => (
                    <Card key={memory.id} className="flex items-center gap-4">
                      <div className="h-18 w-18 shrink-0 overflow-hidden rounded-[22px] bg-[#fff1e8]">
                        {memory.media[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            alt={memory.title}
                            className="h-full w-full object-cover"
                            src={memory.media[0].posterUrl ?? memory.media[0].fileUrl}
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-slate-400">{formatDateTime(memory.recordedAt)}</p>
                        <h3 className="truncate text-base font-bold text-slate-900">
                          {memory.title}
                        </h3>
                        <p className="line-clamp-2 text-sm leading-6 text-slate-500">
                          {memory.content}
                        </p>
                      </div>
                      <Button
                        onClick={() => setDetailMemoryId(memory.id)}
                        type="button"
                        variant="secondary"
                      >
                        查看
                      </Button>
                    </Card>
                  ))
                ) : (
                  <EmptyState
                    actionLabel="写下第一条记录"
                    description="先记下一顿饭、一次午睡，或者一个让你心头一暖的小瞬间。"
                    onAction={() => setMemorySheetOpen(true)}
                    title="今天还没有新记录"
                  />
                )}
              </div>
            </section>

            <section className="space-y-4">
              <SectionHeading title="最近里程碑" />
              <div className="space-y-3">
                {recentMilestones.length > 0 ? (
                  recentMilestones.map((milestone) => (
                    <Card key={milestone.id}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">{milestone.title}</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {formatDate(milestone.happenedAt)}
                          </p>
                        </div>
                        {milestone.isImportant ? (
                          <Badge className="bg-[#ffe9cf] text-[#b56c3d]">重要时刻</Badge>
                        ) : null}
                      </div>
                      {milestone.description ? (
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          {milestone.description}
                        </p>
                      ) : null}
                    </Card>
                  ))
                ) : (
                  <EmptyState
                    actionLabel="新增里程碑"
                    description="宝宝每个第一次都值得被珍藏，记录下来会很有仪式感。"
                    onAction={() => setMilestoneSheetOpen(true)}
                    title="里程碑还空着"
                  />
                )}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="space-y-4">
              <SectionHeading title="最近上传的媒体" />
              {galleryAssets.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {galleryAssets.slice(0, 4).map((asset) => (
                    <MediaThumb key={asset.id} asset={asset} className="aspect-square" />
                  ))}
                </div>
              ) : (
                <EmptyState
                  actionLabel="上传第一张照片"
                  description="在成长记录或里程碑中选择图片 / 视频，首页会自动聚合展示。"
                  onAction={() => setMemorySheetOpen(true)}
                  title="还没有媒体素材"
                />
              )}
            </section>

            <section className="space-y-4">
              <SectionHeading title="最新成长数据" />
              <div className="grid gap-3 sm:grid-cols-3">
                {latestMetrics.map((metric, index) => (
                  <Card key={index} className="bg-[#fffdf8]">
                    <p className="text-sm text-slate-400">
                      {metric?.type === "height"
                        ? "身高"
                        : metric?.type === "weight"
                          ? "体重"
                          : metric?.type === "head_circumference"
                            ? "头围"
                            : "待记录"}
                    </p>
                    <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                      {metric ? `${metric.value} ${getMetricUnit(metric.type)}` : "--"}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      {metric ? formatDate(metric.recordedOn) : "还没有数据"}
                    </p>
                  </Card>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <SectionHeading title="未来功能占位" />
              <div className="grid gap-3">
                <FuturePlaceholder
                  description="根据本周记录、图片和视频生成成长总结。"
                  title="AI 成长周报"
                />
                <FuturePlaceholder
                  description="未来支持爸爸妈妈共同维护同一个宝宝档案，并细化角色权限。"
                  title="家庭共享"
                />
                <FuturePlaceholder
                  description="预留疫苗、体检、生日和纪念日提醒入口。"
                  title="提醒中心"
                />
              </div>
            </section>
          </div>
        </div>
      </div>

      <BabyFormSheet open={babySheetOpen} onClose={() => setBabySheetOpen(false)} />
      <MemoryFormSheet
        babyId={selectedBaby.id}
        onClose={() => setMemorySheetOpen(false)}
        open={memorySheetOpen}
      />
      <MilestoneFormSheet
        babyId={selectedBaby.id}
        onClose={() => setMilestoneSheetOpen(false)}
        open={milestoneSheetOpen}
      />
      <GrowthFormSheet
        babyId={selectedBaby.id}
        onClose={() => setGrowthSheetOpen(false)}
        open={growthSheetOpen}
      />
      <MemoryDetailSheet
        memory={detailMemory}
        onClose={() => setDetailMemoryId(null)}
        open={Boolean(detailMemory)}
      />
    </>
  );
}

function QuickStat({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/70 bg-white/80 p-4">
      <Icon className="h-5 w-5 text-[#d18e6a]" />
      <p className="mt-3 text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-black tracking-tight text-slate-900">{value}</p>
    </div>
  );
}

function FuturePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="border-dashed border-[#ead6ca] bg-white/72">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-[#fff1e8] p-2 text-[#c97954]">
          <Heart className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            TODO
          </p>
        </div>
      </div>
    </Card>
  );
}
