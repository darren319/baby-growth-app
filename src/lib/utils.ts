import { clsx, type ClassValue } from "clsx";
import {
  differenceInDays,
  differenceInMonths,
  format,
  formatDistanceToNowStrict,
  parseISO,
} from "date-fns";

import { GROWTH_TYPES } from "@/lib/constants";
import type { GrowthMetricType, MediaAsset } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function safeId() {
  return crypto.randomUUID();
}

export function formatDate(value: string) {
  return format(parseISO(value), "yyyy年M月d日");
}

export function formatDateTime(value: string) {
  return format(parseISO(value), "yyyy年M月d日 HH:mm");
}

export function formatMonth(value: string) {
  return format(parseISO(value), "yyyy年M月");
}

export function formatRelativeFromNow(value: string) {
  return formatDistanceToNowStrict(parseISO(value), {
    addSuffix: true,
  });
}

export function calculateAgeLabel(birthDate: string) {
  const birthday = parseISO(birthDate);
  const months = differenceInMonths(new Date(), birthday);
  const days = differenceInDays(new Date(), birthday);

  if (months <= 0) {
    return `${Math.max(days, 0)} 天`;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${months} 个月`;
  }

  if (remainingMonths === 0) {
    return `${years} 岁`;
  }

  return `${years} 岁 ${remainingMonths} 个月`;
}

export function parseTags(input: string) {
  return input
    .split(/[，,]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag, index, all) => all.indexOf(tag) === index);
}

export function monthKey(value: string) {
  return format(parseISO(value), "yyyy-MM");
}

export function groupByMonth<T extends { createdAt?: string; recordedAt?: string; happenedAt?: string }>(
  items: T[],
) {
  return items.reduce<Record<string, T[]>>((groups, item) => {
    const rawDate = item.recordedAt ?? item.happenedAt ?? item.createdAt;
    if (!rawDate) return groups;
    const key = monthKey(rawDate);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
}

export function fileSizeLabel(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("无法读取文件内容"));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error("文件读取失败"));
    reader.readAsDataURL(file);
  });
}

export function createObjectPreview(file: File) {
  return URL.createObjectURL(file);
}

export function getMetricUnit(type: GrowthMetricType) {
  return GROWTH_TYPES.find((item) => item.value === type)?.unit ?? "";
}

export function createSvgPlaceholder(
  title: string,
  subtitle: string,
  accent = "#F29D74",
) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900" fill="none">
  <rect width="1200" height="900" rx="72" fill="#FFF7F2"/>
  <rect x="70" y="70" width="1060" height="760" rx="48" fill="url(#paint0_linear)"/>
  <circle cx="978" cy="214" r="132" fill="${accent}" fill-opacity="0.15"/>
  <circle cx="281" cy="672" r="170" fill="#B9D8BF" fill-opacity="0.24"/>
  <rect x="140" y="160" width="340" height="40" rx="20" fill="#FFFFFF" fill-opacity="0.75"/>
  <rect x="140" y="232" width="500" height="26" rx="13" fill="#FFF4EA"/>
  <rect x="140" y="280" width="580" height="26" rx="13" fill="#FFF4EA"/>
  <rect x="140" y="328" width="300" height="26" rx="13" fill="#FFF4EA"/>
  <rect x="140" y="434" width="920" height="270" rx="36" fill="#FFFFFF" fill-opacity="0.6"/>
  <text x="140" y="510" fill="#8B5E46" font-size="64" font-family="Arial, Helvetica, sans-serif" font-weight="700">${title}</text>
  <text x="140" y="585" fill="#9B7D69" font-size="32" font-family="Arial, Helvetica, sans-serif">${subtitle}</text>
  <defs>
    <linearGradient id="paint0_linear" x1="80" y1="90" x2="1130" y2="820" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FFE8D7"/>
      <stop offset="1" stop-color="#FFFDF8"/>
    </linearGradient>
  </defs>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function sortByNewest<T extends { createdAt?: string; recordedAt?: string; happenedAt?: string }>(
  items: T[],
) {
  return [...items].sort((a, b) => {
    const first = a.recordedAt ?? a.happenedAt ?? a.createdAt ?? "";
    const second = b.recordedAt ?? b.happenedAt ?? b.createdAt ?? "";
    return second.localeCompare(first);
  });
}

export function firstMediaPreview(media: MediaAsset[]) {
  const item = media[0];
  return item?.posterUrl ?? item?.fileUrl;
}

export function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}
