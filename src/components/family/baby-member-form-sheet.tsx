"use client";

import { useEffect } from "react";
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
} from "@/components/ui/field";
import { babyMemberSchema } from "@/lib/validation";

type BabyMemberFormValues = z.input<typeof babyMemberSchema>;

export function BabyMemberFormSheet({
  babyId,
  open,
  onClose,
}: {
  babyId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const { inviteBabyMember } = useAppData();
  const form = useForm<BabyMemberFormValues>({
    resolver: zodResolver(babyMemberSchema),
    defaultValues: {
      inviteEmail: "",
      displayName: "",
      role: "editor",
    },
  });

  useEffect(() => {
    form.reset({
      inviteEmail: "",
      displayName: "",
      role: "editor",
    });
  }, [form, open]);

  return (
    <Drawer
      description="基础版先记录共享成员和角色，后续再补邮件邀请、接受邀请和更细粒度权限。"
      onClose={onClose}
      open={open}
      title="邀请家庭成员"
    >
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          if (!babyId) return;

          await inviteBabyMember({
            babyId,
            inviteEmail: values.inviteEmail,
            displayName: values.displayName,
            role: values.role,
          });
          onClose();
        })}
      >
        <div>
          <FieldLabel htmlFor="member-email">家庭成员邮箱</FieldLabel>
          <Input
            id="member-email"
            placeholder="例如：dad@example.com"
            {...form.register("inviteEmail")}
          />
          {form.formState.errors.inviteEmail ? (
            <FieldError>{form.formState.errors.inviteEmail.message}</FieldError>
          ) : null}
        </div>

        <div>
          <FieldLabel htmlFor="member-name">成员称呼</FieldLabel>
          <Input
            id="member-name"
            placeholder="例如：爸爸 / 外婆 / 阿姨"
            {...form.register("displayName")}
          />
          <FieldHint>不填也可以，后续成员接受邀请后会自动补齐自己的显示信息。</FieldHint>
          {form.formState.errors.displayName ? (
            <FieldError>{form.formState.errors.displayName.message}</FieldError>
          ) : null}
        </div>

        <div>
          <FieldLabel htmlFor="member-role">角色</FieldLabel>
          <Select id="member-role" {...form.register("role")}>
            <option value="editor">编辑者</option>
            <option value="viewer">查看者</option>
          </Select>
        </div>

        <div className="rounded-[24px] bg-[#fff8f2] p-4 text-sm leading-6 text-slate-500">
          当前基础版说明：
          <br />
          1. 拥有者可以管理共享成员。
          <br />
          2. 邀请记录会先保存到数据库。
          <br />
          3. 真实邮件通知与接受邀请流程后续补充。
        </div>

        <div className="flex gap-3 pt-2">
          <Button fullWidth onClick={onClose} type="button" variant="secondary">
            取消
          </Button>
          <Button
            disabled={form.formState.isSubmitting || !babyId}
            fullWidth
            type="submit"
          >
            {form.formState.isSubmitting ? "保存中..." : "保存邀请"}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
