"use client";

import { useEffect, useState } from "react";
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
  Textarea,
} from "@/components/ui/field";
import type { MediaAsset, Milestone } from "@/lib/types";
import { parseTags } from "@/lib/utils";
import { milestoneSchema } from "@/lib/validation";

type MilestoneFormValues = z.input<typeof milestoneSchema>;

function toDateInput(value?: string) {
  return value ? value.slice(0, 10) : "";
}

export function MilestoneFormSheet({
  open,
  onClose,
  babyId,
  milestone,
}: {
  open: boolean;
  onClose: () => void;
  babyId: string | null;
  milestone?: Milestone | null;
}) {
  const { saveMilestone } = useAppData();
  const [existingMedia, setExistingMedia] = useState<MediaAsset[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const form = useForm<MilestoneFormValues>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      title: "",
      happenedAt: "",
      description: "",
      tagsText: "",
      isImportant: false,
    },
  });

  useEffect(() => {
    form.reset({
      title: milestone?.title ?? "",
      happenedAt: toDateInput(milestone?.happenedAt),
      description: milestone?.description ?? "",
      tagsText: milestone?.tags.join(", ") ?? "",
      isImportant: milestone?.isImportant ?? false,
    });
    setExistingMedia(milestone?.media ?? []);
    setNewFiles([]);
  }, [form, milestone, open]);

  return (
    <Drawer
      description="适合记录每一个值得回看的第一次，也为成长年册沉淀素材。"
      onClose={onClose}
      open={open}
      title={milestone ? "编辑里程碑" : "新增里程碑"}
    >
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          if (!babyId) return;
          await saveMilestone({
            id: milestone?.id,
            babyId,
            title: values.title,
            happenedAt: new Date(values.happenedAt).toISOString(),
            description: values.description,
            isImportant: values.isImportant,
            tags: parseTags(values.tagsText),
            existingMedia,
            newFiles,
          });
          onClose();
        })}
      >
        <div>
          <FieldLabel htmlFor="milestone-title">标题</FieldLabel>
          <Input id="milestone-title" placeholder="例如：第一次叫妈妈" {...form.register("title")} />
          {form.formState.errors.title ? (
            <FieldError>{form.formState.errors.title.message}</FieldError>
          ) : null}
        </div>

        <div>
          <FieldLabel htmlFor="milestone-date">日期</FieldLabel>
          <Input id="milestone-date" type="date" {...form.register("happenedAt")} />
          {form.formState.errors.happenedAt ? (
            <FieldError>{form.formState.errors.happenedAt.message}</FieldError>
          ) : null}
        </div>

        <div>
          <FieldLabel htmlFor="milestone-description">描述</FieldLabel>
          <Textarea
            id="milestone-description"
            placeholder="写下当时发生了什么，留给未来回看。"
            {...form.register("description")}
          />
        </div>

        <div>
          <FieldLabel htmlFor="milestone-tags">标签</FieldLabel>
          <Input
            id="milestone-tags"
            placeholder="例如：第一次, 语言发展"
            {...form.register("tagsText")}
          />
          <FieldHint>里程碑支持自定义标签，便于未来整理年册。</FieldHint>
        </div>

        <label className="flex items-center justify-between rounded-[24px] border border-[#ead9cf] bg-white px-4 py-3 text-sm text-slate-600">
          <span>标记为重要事件</span>
          <input type="checkbox" {...form.register("isImportant")} />
        </label>

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
            {form.formState.isSubmitting ? "保存中..." : "保存里程碑"}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
