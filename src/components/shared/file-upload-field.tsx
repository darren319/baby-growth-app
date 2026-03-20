"use client";

import { useEffect, useMemo } from "react";
import { ImagePlus, Trash2, Video } from "lucide-react";

import { useToast } from "@/components/providers/toast-provider";
import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
} from "@/lib/constants";
import type { MediaAsset } from "@/lib/types";
import { fileSizeLabel } from "@/lib/utils";

interface FileUploadFieldProps {
  existingMedia: MediaAsset[];
  onExistingMediaChange: (media: MediaAsset[]) => void;
  newFiles: File[];
  onNewFilesChange: (files: File[]) => void;
  label?: string;
  hint?: string;
}

export function FileUploadField({
  existingMedia,
  onExistingMediaChange,
  newFiles,
  onNewFilesChange,
  label = "图片 / 视频",
  hint = "支持多图和视频上传。图片建议 8MB 内，视频建议 80MB 内。",
}: FileUploadFieldProps) {
  const { showToast } = useToast();
  const previews = useMemo(
    () =>
      newFiles.map((file) => ({
        id: `${file.name}-${file.lastModified}`,
        previewUrl: URL.createObjectURL(file),
        file,
      })),
    [newFiles],
  );

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.previewUrl));
    };
  }, [previews]);

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-2 text-sm font-semibold text-slate-700">{label}</p>
        <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-[#e7cdbf] bg-white px-4 py-5 text-center transition hover:border-[#ef9b74] hover:bg-[#fff8f2]">
          <div className="mb-2 flex items-center gap-2 text-[#c97954]">
            <ImagePlus className="h-5 w-5" />
            <Video className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-slate-700">点击选择文件</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{hint}</p>
          <input
            accept={[...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES].join(",")}
            className="hidden"
            multiple
            onChange={async (event) => {
              const nextFiles = Array.from(event.target.files ?? []);
              const invalidMessages: string[] = [];
              const validFiles = nextFiles.filter((file) => {
                const isImage = ACCEPTED_IMAGE_TYPES.includes(file.type);
                const isVideo = ACCEPTED_VIDEO_TYPES.includes(file.type);
                if (!isImage && !isVideo) {
                  invalidMessages.push(`${file.name} 格式不支持`);
                  return false;
                }
                if (isImage && file.size > MAX_IMAGE_SIZE_BYTES) {
                  invalidMessages.push(`${file.name} 超过 8MB`);
                  return false;
                }
                if (isVideo && file.size > MAX_VIDEO_SIZE_BYTES) {
                  invalidMessages.push(`${file.name} 超过 80MB`);
                  return false;
                }
                return true;
              });

              if (invalidMessages.length > 0) {
                showToast(`已跳过：${invalidMessages.join("；")}`, "error");
              }

              onNewFilesChange([...newFiles, ...validFiles]);
              event.target.value = "";
            }}
            type="file"
          />
        </label>
      </div>

      {existingMedia.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            已保存媒体
          </p>
          <div className="grid grid-cols-2 gap-3">
            {existingMedia.map((asset) => {
              const preview = asset.posterUrl ?? asset.fileUrl;
              return (
                <div
                  key={asset.id}
                  className="overflow-hidden rounded-[24px] border border-[#ecd9ce] bg-white"
                >
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={asset.fileName}
                      className="h-28 w-full object-cover"
                      src={preview}
                    />
                  ) : (
                    <div className="flex h-28 items-center justify-center bg-[#fff1e8] text-sm text-slate-500">
                      无预览
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-700">
                        {asset.fileName}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {fileSizeLabel(asset.sizeBytes)}
                      </p>
                    </div>
                    <button
                      className="rounded-full p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                      onClick={() =>
                        onExistingMediaChange(
                          existingMedia.filter((item) => item.id !== asset.id),
                        )
                      }
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {previews.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            待上传文件
          </p>
          <div className="grid grid-cols-2 gap-3">
            {previews.map((preview, index) => (
              <div
                key={preview.id}
                className="overflow-hidden rounded-[24px] border border-[#ecd9ce] bg-white"
              >
                {preview.file.type.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={preview.file.name}
                    className="h-28 w-full object-cover"
                    src={preview.previewUrl}
                  />
                ) : (
                  <video
                    className="h-28 w-full bg-slate-100 object-cover"
                    controls
                    preload="metadata"
                    src={preview.previewUrl}
                  />
                )}
                <div className="flex items-center justify-between gap-2 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-700">
                      {preview.file.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {fileSizeLabel(preview.file.size)}
                    </p>
                  </div>
                  <button
                    className="rounded-full p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                    onClick={() =>
                      onNewFilesChange(newFiles.filter((_, fileIndex) => fileIndex !== index))
                    }
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
