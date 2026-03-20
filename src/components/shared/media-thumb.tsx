"use client";

import { PlayCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { MediaAsset } from "@/lib/types";
import { cn, fileSizeLabel } from "@/lib/utils";

export function MediaThumb({
  asset,
  className,
}: {
  asset: MediaAsset;
  className?: string;
}) {
  const preview = asset.posterUrl ?? asset.fileUrl;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[24px] border border-white/70 bg-[#fff6f0]",
        className,
      )}
    >
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={asset.fileName}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          src={preview}
        />
      ) : (
        <div className="flex h-full min-h-32 items-center justify-center bg-[#fff1e8] text-sm text-slate-500">
          暂无预览
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/55 to-transparent p-3 text-white">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{asset.fileName}</p>
            <p className="text-[11px] text-white/80">{fileSizeLabel(asset.sizeBytes)}</p>
          </div>
          {asset.kind === "video" ? (
            <Badge className="bg-white/18 text-white">
              <PlayCircle className="mr-1 h-3.5 w-3.5" />
              视频
            </Badge>
          ) : null}
        </div>
      </div>
    </div>
  );
}
