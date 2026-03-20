import { z } from "zod";

export const authSchema = z.object({
  email: z.string().email("请输入正确的邮箱地址"),
  password: z
    .string()
    .min(6, "密码至少需要 6 位")
    .max(64, "密码不能超过 64 位"),
  fullName: z.string().max(40, "姓名最多 40 个字符").optional(),
});

export const babySchema = z.object({
  name: z.string().min(1, "请输入宝宝姓名").max(30, "宝宝姓名最多 30 个字符"),
  nickname: z.string().max(30, "昵称最多 30 个字符").optional(),
  gender: z.enum(["female", "male", "other", "unspecified"]),
  birthDate: z.string().min(1, "请选择出生日期"),
  notes: z.string().max(400, "备注最多 400 个字符").optional(),
});

export const memorySchema = z.object({
  title: z.string().min(1, "请输入标题").max(60, "标题最多 60 个字符"),
  recordedAt: z.string().min(1, "请选择记录时间"),
  content: z.string().min(1, "请输入记录内容").max(3000, "内容最多 3000 个字符"),
  tagsText: z.string().max(200, "标签内容过长"),
  mood: z
    .enum(["happy", "calm", "fussy", "excited", "sleepy", "sick"])
    .optional()
    .or(z.literal("")),
  isPinned: z.boolean(),
  isFavorite: z.boolean(),
});

export const milestoneSchema = z.object({
  title: z.string().min(1, "请输入里程碑标题").max(60, "标题最多 60 个字符"),
  happenedAt: z.string().min(1, "请选择日期"),
  description: z.string().max(1500, "描述最多 1500 个字符").optional(),
  tagsText: z.string().max(120, "标签内容过长"),
  isImportant: z.boolean(),
});

export const growthMetricSchema = z.object({
  type: z.enum(["height", "weight", "head_circumference"]),
  value: z.coerce.number().positive("请输入大于 0 的数值"),
  recordedOn: z.string().min(1, "请选择记录日期"),
  notes: z.string().max(400, "备注最多 400 个字符").optional(),
});

export const babyMemberSchema = z.object({
  inviteEmail: z.string().email("请输入正确的家庭成员邮箱"),
  displayName: z.string().max(40, "称呼最多 40 个字符").optional(),
  role: z.enum(["editor", "viewer"]),
});
