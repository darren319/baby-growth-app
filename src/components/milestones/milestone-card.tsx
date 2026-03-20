import { Pencil, Star, Trash2 } from "lucide-react";

import { MediaThumb } from "@/components/shared/media-thumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Milestone } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function MilestoneCard({
  milestone,
  onEdit,
  onDelete,
}: {
  milestone: Milestone;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-black tracking-tight text-slate-900">
              {milestone.title}
            </h3>
            {milestone.isImportant ? (
              <Badge className="bg-[#ffe9cf] text-[#b56c3d]">
                <Star className="mr-1 h-3.5 w-3.5" />
                重要
              </Badge>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-slate-500">{formatDate(milestone.happenedAt)}</p>
        </div>
      </div>

      {milestone.description ? (
        <p className="text-sm leading-7 text-slate-600">{milestone.description}</p>
      ) : null}

      {milestone.tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {milestone.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      ) : null}

      {milestone.media.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {milestone.media.map((asset) => (
            <MediaThumb key={asset.id} asset={asset} className="aspect-square" />
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <Button onClick={onEdit} type="button">
          <Pencil className="mr-2 h-4 w-4" />
          编辑
        </Button>
        <Button onClick={onDelete} type="button" variant="danger">
          <Trash2 className="mr-2 h-4 w-4" />
          删除
        </Button>
      </div>
    </Card>
  );
}
