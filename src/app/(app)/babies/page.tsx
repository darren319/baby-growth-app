"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { BabyCard } from "@/components/babies/baby-card";
import { BabyFormSheet } from "@/components/babies/baby-form-sheet";
import { useAppData } from "@/components/providers/app-data-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Baby } from "@/lib/types";

export default function BabiesPage() {
  const { status, babies, selectedBabyId, setSelectedBabyId } = useAppData();
  const { user } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingBaby, setEditingBaby] = useState<Baby | null>(null);

  if (status === "loading" || status === "idle") {
    return <LoadingState label="正在加载宝宝档案..." />;
  }

  return (
    <>
      <div className="space-y-6">
        <SectionHeading
          action={
            <Button
              onClick={() => {
                setEditingBaby(null);
                setSheetOpen(true);
              }}
              type="button"
            >
              <Plus className="mr-2 h-4 w-4" />
              新增宝宝
            </Button>
          }
          eyebrow="Babies"
          description="你可以维护自己的宝宝档案；通过家庭共享加入的档案也会在这里展示，但资料编辑仍由拥有者处理。"
          title="宝宝档案管理"
        />

        {babies.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {babies.map((baby) => (
              <BabyCard
                key={baby.id}
                active={selectedBabyId === baby.id}
                baby={baby}
                onEdit={
                  baby.userId === user?.id
                    ? () => {
                        setEditingBaby(baby);
                        setSheetOpen(true);
                      }
                    : undefined
                }
                onSelect={() => setSelectedBabyId(baby.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            actionLabel="创建宝宝档案"
            description="先补全基础资料，后面所有成长记录、里程碑、相册和图表都会自动关联。"
            onAction={() => setSheetOpen(true)}
            title="还没有任何宝宝档案"
          />
        )}
      </div>

      <BabyFormSheet
        baby={editingBaby}
        onClose={() => {
          setEditingBaby(null);
          setSheetOpen(false);
        }}
        open={sheetOpen}
      />
    </>
  );
}
