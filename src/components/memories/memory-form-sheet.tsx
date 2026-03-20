"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useAppData } from "@/components/providers/app-data-provider";
import { FileUploadField } from "@/components/shared/file-upload-field";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import {
  FieldError,
  FieldHint,
  FieldLabel,
  Input,
  Select,
  Textarea,
} from "@/components/ui/field";
import { MEMORY_MOODS } from "@/lib/constants";
import type { MediaAsset, MemoryRecord } from "@/lib/types";
import { parseTags } from "@/lib/utils";
import { memorySchema } from "@/lib/validation";

type MemoryFormValues = z.input<typeof memorySchema>;

function toDateTimeLocal(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function MemoryFormSheet({
  open,
  onClose,
  babyId,
  memory,
}: {
  open: boolean;
  onClose: () => void;
  babyId: string | null;
  memory?: MemoryRecord | null;
}) {
  const { saveMemory, suggestTags } = useAppData();
  const [existingMedia, setExistingMedia] = useState<MediaAsset[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const form = useForm<MemoryFormValues>({
    resolver: zodResolver(memorySchema),
    defaultValues: {
      title: "",
      recordedAt: "",
      content: "",
      tagsText: "",
      mood: "",
      isPinned: false,
      isFavorite: false,
    },
  });

  useEffect(() => {
    form.reset({
      title: memory?.title ?? "",
      recordedAt: toDateTimeLocal(memory?.recordedAt),
      content: memory?.content ?? "",
      tagsText: memory?.tags.join(", ") ?? "",
      mood: memory?.mood ?? "",
      isPinned: memory?.isPinned ?? false,
      isFavorite: memory?.isFavorite ?? false,
    });
    setExistingMedia(memory?.media ?? []);
    setNewFiles([]);
  }, [form, memory, open]);

  return (
    <Drawer
      description="支持图片 / 视频上传，并为未来 AI 自动整理和年册导出预留结构。"
      onClose={onClose}
      open={open}
      title={memory ? "编辑成长记录" : "新增成长记录"}
    >
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          if (!babyId) return;

          await saveMemory({
            id: memory?.id,
            babyId,
            title: values.title,
            recordedAt: new Date(values.recordedAt).toISOString(),
            content: values.content,
            tags: parseTags(values.tagsText),
            mood: values.mood || undefined,
            isPinned: values.isPinned,
            isFavorite: values.isFavorite,
            existingMedia,
            newFiles,
          });
          onClose();
        })}
      >
        <div>
          <FieldLabel htmlFor="memory-title">标题</FieldLabel>
          <Input id="memory-title" placeholder="例如：第一次自己拍手" {...form.register("title")} />
          {form.formState.errors.title ? (
            <FieldError>{form.formState.errors.title.message}</FieldError>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <FieldLabel htmlFor="memory-recorded-at">记录时间</FieldLabel>
            <Input id="memory-recorded-at" type="datetime-local" {...form.register("recordedAt")} />
            {form.formState.errors.recordedAt ? (
              <FieldError>{form.formState.errors.recordedAt.message}</FieldError>
            ) : null}
          </div>
          <div>
            <FieldLabel htmlFor="memory-mood">心情 / 状态</FieldLabel>
            <Select id="memory-mood" {...form.register("mood")}>
              <option value="">暂不设置</option>
              {MEMORY_MOODS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <FieldLabel htmlFor="memory-content">记录内容</FieldLabel>
          <Textarea
            id="memory-content"
            placeholder="今天发生了什么？有没有什么想留给未来回看的细节？"
            {...form.register("content")}
          />
          {form.formState.errors.content ? (
            <FieldError>{form.formState.errors.content.message}</FieldError>
          ) : null}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <FieldLabel className="mb-0" htmlFor="memory-tags">
              标签
            </FieldLabel>
            <Button
              onClick={async () => {
                setIsSuggesting(true);
                const suggestions = await suggestTags(form.getValues("content"));
                if (suggestions.length > 0) {
                  const merged = Array.from(
                    new Set([...parseTags(form.getValues("tagsText")), ...suggestions]),
                  );
                  form.setValue("tagsText", merged.join(", "));
                }
                setIsSuggesting(false);
              }}
              type="button"
              variant="ghost"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {isSuggesting ? "分析中..." : "AI 标签建议"}
            </Button>
          </div>
          <Input
            id="memory-tags"
            placeholder="例如：吃饭, 第一次, 生日"
            {...form.register("tagsText")}
          />
          <FieldHint>先做轻量 AI 占位，后续可接真实自动打标签。</FieldHint>
          {form.formState.errors.tagsText ? (
            <FieldError>{form.formState.errors.tagsText.message}</FieldError>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center justify-between rounded-[24px] border border-[#ead9cf] bg-white px-4 py-3 text-sm text-slate-600">
            <span>置顶到首页</span>
            <input type="checkbox" {...form.register("isPinned")} />
          </label>
          <label className="flex items-center justify-between rounded-[24px] border border-[#ead9cf] bg-white px-4 py-3 text-sm text-slate-600">
            <span>加入收藏</span>
            <input type="checkbox" {...form.register("isFavorite")} />
          </label>
        </div>

        <FileUploadField
          existingMedia={existingMedia}
          newFiles={newFiles}
          onExistingMediaChange={setExistingMedia}
          onNewFilesChange={setNewFiles}
        />

        <div className="flex gap-3 pt-2">
          <Button fullWidth onClick={onClose} type="button" variant="secondary">
            取消
          </Button>
          <Button
            disabled={form.formState.isSubmitting || !babyId}
            fullWidth
            type="submit"
          >
            {form.formState.isSubmitting ? "保存中..." : "保存记录"}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
