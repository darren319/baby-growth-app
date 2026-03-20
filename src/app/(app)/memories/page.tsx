"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import { MemoryCard } from "@/components/memories/memory-card";
import { MemoryDetailSheet } from "@/components/memories/memory-detail-sheet";
import { MemoryFormSheet } from "@/components/memories/memory-form-sheet";
import { useAppData } from "@/components/providers/app-data-provider";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/field";
import { LoadingState } from "@/components/ui/loading-state";
import { SectionHeading } from "@/components/ui/section-heading";
import type { MemoryFilters, MemoryRecord } from "@/lib/types";
import { monthKey } from "@/lib/utils";

const defaultFilters: MemoryFilters = {
  query: "",
  tag: "",
  month: "",
  favoritesOnly: false,
  pinnedOnly: false,
};
const PAGE_SIZE = 6;

export default function MemoriesPage() {
  const { status, memories, availableTags, selectedBaby, deleteMemory } = useAppData();
  const [filters, setFilters] = useState<MemoryFilters>(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<MemoryRecord | null>(null);
  const [detailMemory, setDetailMemory] = useState<MemoryRecord | null>(null);

  const monthOptions = useMemo(
    () => Array.from(new Set(memories.map((memory) => monthKey(memory.recordedAt)))),
    [memories],
  );

  const filteredMemories = useMemo(() => {
    return memories
      .filter((memory) => {
        const query = filters.query.trim().toLowerCase();
        const matchesQuery =
          !query ||
          memory.title.toLowerCase().includes(query) ||
          memory.content.toLowerCase().includes(query);
        const matchesTag = !filters.tag || memory.tags.includes(filters.tag);
        const matchesMonth =
          !filters.month || monthKey(memory.recordedAt) === filters.month;
        const matchesFavorite = !filters.favoritesOnly || memory.isFavorite;
        const matchesPinned = !filters.pinnedOnly || memory.isPinned;
        return (
          matchesQuery &&
          matchesTag &&
          matchesMonth &&
          matchesFavorite &&
          matchesPinned
        );
      })
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) {
          return a.isPinned ? -1 : 1;
        }
        return b.recordedAt.localeCompare(a.recordedAt);
      });
  }, [filters, memories]);

  const totalPages = Math.max(1, Math.ceil(filteredMemories.length / PAGE_SIZE));
  const currentPageItems = filteredMemories.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, selectedBaby?.id]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  if (status === "loading" || status === "idle") {
    return <LoadingState label="正在加载成长记录..." />;
  }

  if (!selectedBaby) {
    return (
      <EmptyState
        description="先在宝宝档案页创建一个宝宝，记录、相册和时间轴才会关联起来。"
        title="当前还没有可记录的宝宝"
      />
    );
  }

  return (
    <>
      <div className="space-y-6">
        <SectionHeading
          action={
            <Button
              onClick={() => {
                setEditingMemory(null);
                setFormOpen(true);
              }}
              type="button"
            >
              <Plus className="mr-2 h-4 w-4" />
              新增记录
            </Button>
          }
          eyebrow="Memories"
          description="支持标题、正文、标签、收藏、置顶以及图片 / 视频上传，移动端优先呈现。"
          title={`${selectedBaby.name} 的成长记录`}
        />

        <div className="rounded-[28px] border border-white/70 bg-white/86 p-4 shadow-[0_18px_42px_rgba(244,180,145,0.14)]">
          <div className="grid gap-3 md:grid-cols-[1.2fr_repeat(4,0.8fr)]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-10"
                onChange={(event) =>
                  setFilters((current) => ({ ...current, query: event.target.value }))
                }
                placeholder="搜索标题或内容"
                value={filters.query}
              />
            </div>
            <Select
              onChange={(event) =>
                setFilters((current) => ({ ...current, tag: event.target.value }))
              }
              value={filters.tag}
            >
              <option value="">全部标签</option>
              {availableTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </Select>
            <Select
              onChange={(event) =>
                setFilters((current) => ({ ...current, month: event.target.value }))
              }
              value={filters.month}
            >
              <option value="">全部月份</option>
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </Select>
            <label className="flex items-center justify-between rounded-2xl border border-[#ead9cf] bg-white px-3 text-sm text-slate-600">
              仅收藏
              <input
                checked={filters.favoritesOnly}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    favoritesOnly: event.target.checked,
                  }))
                }
                type="checkbox"
              />
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-[#ead9cf] bg-white px-3 text-sm text-slate-600">
              仅置顶
              <input
                checked={filters.pinnedOnly}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    pinnedOnly: event.target.checked,
                  }))
                }
                type="checkbox"
              />
            </label>
          </div>
        </div>

        {filteredMemories.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-[24px] bg-[#fff8f2] px-4 py-3 text-sm text-slate-500">
              <span>共 {filteredMemories.length} 条记录</span>
              <span>
                第 {currentPage} / {totalPages} 页
              </span>
            </div>

            {currentPageItems.map((memory) => (
              <MemoryCard
                key={memory.id}
                memory={memory}
                onDelete={() => void deleteMemory(memory.id)}
                onEdit={() => {
                  setEditingMemory(memory);
                  setFormOpen(true);
                }}
                onView={() => setDetailMemory(memory)}
              />
            ))}

            <div className="grid grid-cols-2 gap-3">
              <Button
                disabled={currentPage <= 1}
                fullWidth
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                type="button"
                variant="secondary"
              >
                上一页
              </Button>
              <Button
                disabled={currentPage >= totalPages}
                fullWidth
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                type="button"
                variant="secondary"
              >
                下一页
              </Button>
            </div>
          </div>
        ) : (
          <EmptyState
            actionLabel="新增一条记录"
            description="试着放宽筛选条件，或者直接记录一个新瞬间。"
            onAction={() => setFormOpen(true)}
            title="没有匹配的成长记录"
          />
        )}
      </div>

      <MemoryFormSheet
        babyId={selectedBaby.id}
        memory={editingMemory}
        onClose={() => {
          setEditingMemory(null);
          setFormOpen(false);
        }}
        open={formOpen}
      />
      <MemoryDetailSheet
        memory={detailMemory}
        onClose={() => setDetailMemory(null)}
        onEdit={() => {
          if (!detailMemory) return;
          setEditingMemory(detailMemory);
          setFormOpen(true);
          setDetailMemory(null);
        }}
        open={Boolean(detailMemory)}
      />
    </>
  );
}
