"use client";

import { useMemo, useState } from "react";

import { MemoryDetailSheet } from "@/components/memories/memory-detail-sheet";
import { useAppData } from "@/components/providers/app-data-provider";
import { MediaThumb } from "@/components/shared/media-thumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { SectionHeading } from "@/components/ui/section-heading";
import type { MediaAsset, MemoryRecord } from "@/lib/types";
import { formatDate, monthKey } from "@/lib/utils";

export default function GalleryPage() {
  const { status, galleryAssets, memories, milestones, selectedBaby } = useAppData();
  const [kindFilter, setKindFilter] = useState<"all" | "image" | "video">("all");
  const [monthFilter, setMonthFilter] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [detailMemory, setDetailMemory] = useState<MemoryRecord | null>(null);

  const monthOptions = useMemo(
    () => Array.from(new Set(galleryAssets.map((asset) => monthKey(asset.createdAt)))),
    [galleryAssets],
  );

  const filteredAssets = useMemo(() => {
    return galleryAssets.filter((asset) => {
      const matchesKind = kindFilter === "all" || asset.kind === kindFilter;
      const matchesMonth = !monthFilter || monthKey(asset.createdAt) === monthFilter;
      return matchesKind && matchesMonth;
    });
  }, [galleryAssets, kindFilter, monthFilter]);

  const parentMemory = selectedAsset
    ? memories.find((memory) => memory.id === selectedAsset.memoryId)
    : null;
  const parentMilestone = selectedAsset
    ? milestones.find((milestone) => milestone.id === selectedAsset.milestoneId)
    : null;

  if (status === "loading" || status === "idle") {
    return <LoadingState label="正在整理相册内容..." />;
  }

  if (!selectedBaby) {
    return (
      <EmptyState
        description="先创建宝宝，再通过成长记录和里程碑上传图片 / 视频，这里会自动聚合。"
        title="当前还没有可查看的相册"
      />
    );
  }

  return (
    <>
      <div className="space-y-6">
        <SectionHeading
          eyebrow="Gallery"
          description="聚合成长记录和里程碑里的全部图片 / 视频，支持按类型和月份筛选。"
          title={`${selectedBaby.name} 的成长相册`}
        />

        <div className="flex flex-wrap gap-3 rounded-[28px] border border-white/70 bg-white/86 p-4 shadow-[0_18px_42px_rgba(244,180,145,0.14)]">
          {[
            { value: "all", label: "全部" },
            { value: "image", label: "图片" },
            { value: "video", label: "视频" },
          ].map((item) => (
            <button
              key={item.value}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                kindFilter === item.value
                  ? "bg-[#fff1e8] text-[#a76446]"
                  : "bg-[#fffaf6] text-slate-500"
              }`}
              onClick={() => setKindFilter(item.value as "all" | "image" | "video")}
              type="button"
            >
              {item.label}
            </button>
          ))}

          <select
            className="h-11 rounded-2xl border border-[#ead9cf] bg-white px-3 text-sm text-slate-600 outline-none"
            onChange={(event) => setMonthFilter(event.target.value)}
            value={monthFilter}
          >
            <option value="">全部月份</option>
            {monthOptions.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>

        {filteredAssets.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {filteredAssets.map((asset) => (
              <button
                key={asset.id}
                className="text-left"
                onClick={() => setSelectedAsset(asset)}
                type="button"
              >
                <MediaThumb asset={asset} className="aspect-square" />
              </button>
            ))}
          </div>
        ) : (
          <EmptyState
            description="可以切换筛选条件，或者先去成长记录页上传图片 / 视频。"
            title="当前筛选下没有媒体内容"
          />
        )}
      </div>

      <Drawer
        description="你可以直接跳回原始记录，继续补充文字和更多素材。"
        onClose={() => setSelectedAsset(null)}
        open={Boolean(selectedAsset)}
        title={selectedAsset?.fileName ?? "媒体详情"}
      >
        {selectedAsset ? (
          <div className="space-y-4">
            <MediaThumb asset={selectedAsset} className="aspect-[4/3]" />
            <div className="flex flex-wrap gap-2">
              <Badge>{selectedAsset.kind === "image" ? "图片" : "视频"}</Badge>
              <Badge>{formatDate(selectedAsset.createdAt)}</Badge>
            </div>
            {parentMemory ? (
              <div className="rounded-[24px] bg-[#fff8f2] p-4">
                <p className="text-sm text-slate-400">来源成长记录</p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">
                  {parentMemory.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {parentMemory.content}
                </p>
                <Button
                  className="mt-4"
                  onClick={() => {
                    setDetailMemory(parentMemory);
                    setSelectedAsset(null);
                  }}
                  type="button"
                >
                  打开原记录
                </Button>
              </div>
            ) : null}
            {parentMilestone ? (
              <div className="rounded-[24px] bg-[#fff8f2] p-4">
                <p className="text-sm text-slate-400">来源里程碑</p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">
                  {parentMilestone.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {parentMilestone.description || "这条里程碑暂时没有补充更多描述。"}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </Drawer>

      <MemoryDetailSheet
        memory={detailMemory}
        onClose={() => setDetailMemory(null)}
        open={Boolean(detailMemory)}
      />
    </>
  );
}
