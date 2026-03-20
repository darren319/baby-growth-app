"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { MilestoneCard } from "@/components/milestones/milestone-card";
import { MilestoneFormSheet } from "@/components/milestones/milestone-form-sheet";
import { useAppData } from "@/components/providers/app-data-provider";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Milestone } from "@/lib/types";

export default function MilestonesPage() {
  const { status, milestones, selectedBaby, deleteMilestone } = useAppData();
  const [formOpen, setFormOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);

  if (status === "loading" || status === "idle") {
    return <LoadingState label="正在加载里程碑..." />;
  }

  if (!selectedBaby) {
    return (
      <EmptyState
        description="先创建宝宝档案，再用里程碑记录每一个第一次和重要节点。"
        title="当前没有可管理的里程碑"
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
                setEditingMilestone(null);
                setFormOpen(true);
              }}
              type="button"
            >
              <Plus className="mr-2 h-4 w-4" />
              新增里程碑
            </Button>
          }
          eyebrow="Milestones"
          description="适合记录第一次翻身、第一次叫爸爸妈妈、第一次走路等关键事件。"
          title={`${selectedBaby.name} 的里程碑`}
        />

        {milestones.length > 0 ? (
          <div className="space-y-4">
            {milestones
              .sort((a, b) => b.happenedAt.localeCompare(a.happenedAt))
              .map((milestone) => (
                <div key={milestone.id} className="grid gap-3 md:grid-cols-[140px_1fr]">
                  <div className="pt-3 text-sm font-semibold text-[#b57a58]">
                    {milestone.happenedAt.slice(0, 10)}
                  </div>
                  <MilestoneCard
                    milestone={milestone}
                    onDelete={() => void deleteMilestone(milestone.id)}
                    onEdit={() => {
                      setEditingMilestone(milestone);
                      setFormOpen(true);
                    }}
                  />
                </div>
              ))}
          </div>
        ) : (
          <EmptyState
            actionLabel="新增里程碑"
            description="把那些真正想多年后再翻出来看的瞬间，单独存进里程碑里。"
            onAction={() => setFormOpen(true)}
            title="还没有里程碑内容"
          />
        )}
      </div>

      <MilestoneFormSheet
        babyId={selectedBaby.id}
        milestone={editingMilestone}
        onClose={() => {
          setEditingMilestone(null);
          setFormOpen(false);
        }}
        open={formOpen}
      />
    </>
  );
}
