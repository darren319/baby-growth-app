"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useAppData } from "@/components/providers/app-data-provider";
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
import type { Baby } from "@/lib/types";
import { babySchema } from "@/lib/validation";

type BabyFormValues = z.input<typeof babySchema>;

export function BabyFormSheet({
  open,
  onClose,
  baby,
}: {
  open: boolean;
  onClose: () => void;
  baby?: Baby | null;
}) {
  const { saveBaby } = useAppData();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const form = useForm<BabyFormValues>({
    resolver: zodResolver(babySchema),
    defaultValues: {
      name: "",
      nickname: "",
      gender: "unspecified",
      birthDate: "",
      notes: "",
    },
  });

  useEffect(() => {
    form.reset({
      name: baby?.name ?? "",
      nickname: baby?.nickname ?? "",
      gender: baby?.gender ?? "unspecified",
      birthDate: baby?.birthDate ?? "",
      notes: baby?.notes ?? "",
    });
    setAvatarFile(null);
  }, [baby, form, open]);

  const avatarPreview = useMemo(() => {
    if (avatarFile) {
      return URL.createObjectURL(avatarFile);
    }
    return baby?.avatarUrl ?? "";
  }, [avatarFile, baby?.avatarUrl]);

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  return (
    <Drawer
      description="维护宝宝基础档案，后续家庭共享会基于这个数据结构扩展。"
      onClose={onClose}
      open={open}
      title={baby ? "编辑宝宝档案" : "新建宝宝档案"}
    >
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          await saveBaby({
            id: baby?.id,
            ...values,
            avatarFile,
            avatarUrl: baby?.avatarUrl,
          });
          onClose();
        })}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <FieldLabel htmlFor="baby-name">宝宝姓名</FieldLabel>
            <Input id="baby-name" placeholder="例如：柚柚" {...form.register("name")} />
            {form.formState.errors.name ? (
              <FieldError>{form.formState.errors.name.message}</FieldError>
            ) : null}
          </div>
          <div>
            <FieldLabel htmlFor="baby-nickname">昵称</FieldLabel>
            <Input
              id="baby-nickname"
              placeholder="例如：小柚子"
              {...form.register("nickname")}
            />
            {form.formState.errors.nickname ? (
              <FieldError>{form.formState.errors.nickname.message}</FieldError>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <FieldLabel htmlFor="baby-gender">性别</FieldLabel>
            <Select id="baby-gender" {...form.register("gender")}>
              <option value="unspecified">暂不填写</option>
              <option value="female">女孩</option>
              <option value="male">男孩</option>
              <option value="other">其他</option>
            </Select>
          </div>
          <div>
            <FieldLabel htmlFor="baby-birth">出生日期</FieldLabel>
            <Input id="baby-birth" type="date" {...form.register("birthDate")} />
            {form.formState.errors.birthDate ? (
              <FieldError>{form.formState.errors.birthDate.message}</FieldError>
            ) : null}
          </div>
        </div>

        <div>
          <FieldLabel htmlFor="baby-avatar">头像</FieldLabel>
          <label className="flex cursor-pointer items-center gap-4 rounded-[24px] border border-dashed border-[#e7cdbf] bg-white px-4 py-4">
            <div className="h-18 w-18 overflow-hidden rounded-[24px] bg-[#fff1e8]">
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt="宝宝头像预览"
                  className="h-full w-full object-cover"
                  src={avatarPreview}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                  头像
                </div>
              )}
            </div>
            <div className="text-sm text-slate-500">
              <p className="font-semibold text-slate-700">点击上传头像</p>
              <p className="mt-1 leading-6">支持 JPG、PNG、WEBP，建议使用正方形照片。</p>
            </div>
            <input
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => setAvatarFile(event.target.files?.[0] ?? null)}
              type="file"
            />
          </label>
          <FieldHint>未来家庭成员会共享这个头像和基础资料。</FieldHint>
        </div>

        <div>
          <FieldLabel htmlFor="baby-notes">备注</FieldLabel>
          <Textarea
            id="baby-notes"
            placeholder="记录一些喂养习惯、喜好或者日常提醒。"
            {...form.register("notes")}
          />
          {form.formState.errors.notes ? (
            <FieldError>{form.formState.errors.notes.message}</FieldError>
          ) : null}
        </div>

        <div className="flex gap-3 pt-2">
          <Button fullWidth type="button" variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button fullWidth disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting ? "保存中..." : "保存档案"}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
