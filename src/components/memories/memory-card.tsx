import { Heart, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { MemoryRecord } from "@/lib/types";
import { firstMediaPreview, formatDateTime } from "@/lib/utils";

export function MemoryCard({
  memory,
  onView,
  onEdit,
  onDelete,
  canManage = true,
}: {
  memory: MemoryRecord;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canManage?: boolean;
}) {
  const preview = firstMediaPreview(memory.media);

  return (
    <Card className="overflow-hidden p-0">
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={memory.title}
          className="h-40 w-full object-cover"
          src={preview}
        />
      ) : null}
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-lg font-black tracking-tight text-slate-900">
                {memory.title}
              </h3>
              {memory.isPinned ? <Badge>置顶</Badge> : null}
              {memory.isFavorite ? (
                <Badge className="bg-[#ffe9ed] text-[#bf5a6c]">
                  <Heart className="mr-1 h-3.5 w-3.5" />
                  收藏
                </Badge>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-slate-500">{formatDateTime(memory.recordedAt)}</p>
          </div>
        </div>

        <p className="text-sm leading-7 text-slate-600">{memory.content}</p>

        <div className="flex flex-wrap gap-2">
          {memory.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
          {memory.mood ? <Badge className="bg-[#eef6ff] text-[#4e74a8]">{memory.mood}</Badge> : null}
        </div>

        <div className={`grid gap-2 ${canManage ? "grid-cols-3" : "grid-cols-1"}`}>
          <Button onClick={onView} type="button" variant="secondary">
            查看详情
          </Button>
          {canManage ? (
            <Button onClick={onEdit} type="button">
              <Pencil className="mr-2 h-4 w-4" />
              编辑
            </Button>
          ) : null}
          {canManage ? (
            <Button onClick={onDelete} type="button" variant="danger">
              <Trash2 className="mr-2 h-4 w-4" />
              删除
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
