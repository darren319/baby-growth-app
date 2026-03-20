import type { GrowthMetricType, MemoryMood, TagOption } from "@/lib/types";

export const APP_NAME = "宝宝成长记录";
export const APP_DESCRIPTION =
  "面向新手父母的成长记录 App，支持日常记录、里程碑、相册和成长数据趋势。";
export const PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_PUBLIC_SITE_URL ?? "https://darren319.github.io/";
export const SOURCE_REPO_URL =
  process.env.NEXT_PUBLIC_SOURCE_REPO_URL ??
  "https://github.com/darren319/baby-growth-app";
export const APK_DOWNLOAD_URL =
  process.env.NEXT_PUBLIC_APK_DOWNLOAD_URL ??
  "https://github.com/darren319/baby-growth-app/releases/latest/download/baby-growth-app-android.apk";

export const MEMORY_TAG_PRESETS: TagOption[] = [
  { id: "eat", name: "吃饭", color: "#f4a26d" },
  { id: "sleep", name: "睡觉", color: "#90b8f8" },
  { id: "play", name: "玩耍", color: "#7bc7a4" },
  { id: "bath", name: "洗澡", color: "#5bc0de" },
  { id: "sick", name: "生病", color: "#f48b94" },
  { id: "first", name: "第一次", color: "#ffb067" },
  { id: "birthday", name: "生日", color: "#e28ad0" },
  { id: "checkup", name: "体检", color: "#83bdb6" },
];

export const MEMORY_MOODS: Array<{ label: string; value: MemoryMood }> = [
  { label: "开心", value: "happy" },
  { label: "平静", value: "calm" },
  { label: "哭闹", value: "fussy" },
  { label: "兴奋", value: "excited" },
  { label: "困倦", value: "sleepy" },
  { label: "不舒服", value: "sick" },
];

export const GROWTH_TYPES: Array<{
  label: string;
  shortLabel: string;
  value: GrowthMetricType;
  unit: string;
}> = [
  { label: "身高", shortLabel: "身高", value: "height", unit: "cm" },
  { label: "体重", shortLabel: "体重", value: "weight", unit: "kg" },
  {
    label: "头围",
    shortLabel: "头围",
    value: "head_circumference",
    unit: "cm",
  },
];

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

export const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
];

export const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;
export const MAX_VIDEO_SIZE_BYTES = 80 * 1024 * 1024;
export const STORAGE_BUCKET = "baby-media";
