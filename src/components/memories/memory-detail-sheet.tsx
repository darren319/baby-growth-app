"use client";

import { Heart, MapPinned } from "lucide-react";

import { Drawer } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MediaThumb } from "@/components/shared/media-thumb";
import type { MemoryRecord } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export function MemoryDetailSheet({
  open,
  memory,
  onClose,
  onEdit,
}: {
  open: boolean;
  memory: MemoryRecord | null;
  onClose: () => void;
  onEdit?: () => void;
}) {
  if (!memory) return null;

  return (
    <Drawer
      description="从时间轴、相册和列表都可以进入同一条成长记录详情。"
      onClose={onClose}
      open={open}
      title={memory.title}
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{formatDateTime(memory.recordedAt)}</Badge>
          {memory.isPinned ? (
            <Badge className="bg-[#eef6ff] text-[#4e74a8]">
              <MapPinned className="mr-1 h-3.5 w-3.5" />
              置顶
            </Badge>
          ) : null}
          {memory.isFavorite ? (
            <Badge className="bg-[#ffe9ed] text-[#bf5a6c]">
              <Heart className="mr-1 h-3.5 w-3.5" />
              收藏
            </Badge>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {memory.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
          {memory.mood ? <Badge className="bg-[#eef6ff] text-[#4e74a8]">{memory.mood}</Badge> : null}
        </div>

        <p className="rounded-[24px] bg-[#fff8f2] px-4 py-4 text-sm leading-7 text-slate-700">
          {memory.content}
        </p>

        {memory.media.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {memory.media.map((asset) => (
              <MediaThumb key={asset.id} asset={asset} className="aspect-square" />
            ))}
          </div>
        ) : null}

        {onEdit ? (
          <Button fullWidth onClick={onEdit} type="button">
            编辑这条记录
          </Button>
        ) : null}
      </div>
    </Drawer>
  );
}
