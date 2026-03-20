"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  canUserAccessBaby,
  isIncomingBabyInvite,
  resolveBabyPermissions,
  resolveBabyRole,
} from "@/lib/access";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/components/providers/toast-provider";
import { appRepository } from "@/lib/repository/app-repository";
import type {
  AppStoreSnapshot,
  Baby,
  BabyMember,
  BabyPermissions,
  GrowthMetric,
  IncomingInvite,
  MediaAsset,
  MemoryRecord,
  Milestone,
  RepositoryContext,
  SaveBabyInput,
  SaveBabyMemberInput,
  SaveGrowthMetricInput,
  SaveMemoryInput,
  SaveMilestoneInput,
  UpdateBabyMemberRoleInput,
} from "@/lib/types";
import { unique } from "@/lib/utils";

interface AppDataContextValue {
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
  babies: Baby[];
  babyMembers: BabyMember[];
  incomingInvites: IncomingInvite[];
  selectedBabyMembers: BabyMember[];
  selectedBabyId: string | null;
  selectedBaby: Baby | null;
  selectedBabyRole: BabyPermissions["role"];
  permissions: BabyPermissions;
  memories: MemoryRecord[];
  milestones: Milestone[];
  growthMetrics: GrowthMetric[];
  galleryAssets: MediaAsset[];
  recentMemories: MemoryRecord[];
  recentMilestones: Milestone[];
  availableTags: string[];
  setSelectedBabyId: (id: string) => void;
  refresh: () => Promise<void>;
  saveBaby: (input: SaveBabyInput) => Promise<void>;
  inviteBabyMember: (input: SaveBabyMemberInput) => Promise<void>;
  updateBabyMemberRole: (input: UpdateBabyMemberRoleInput) => Promise<void>;
  acceptBabyInvite: (memberId: string) => Promise<void>;
  declineBabyInvite: (memberId: string) => Promise<void>;
  removeBabyMember: (memberId: string) => Promise<void>;
  saveMemory: (input: SaveMemoryInput) => Promise<void>;
  deleteMemory: (memoryId: string) => Promise<void>;
  saveMilestone: (input: SaveMilestoneInput) => Promise<void>;
  deleteMilestone: (milestoneId: string) => Promise<void>;
  saveGrowthMetric: (input: SaveGrowthMetricInput) => Promise<void>;
  deleteGrowthMetric: (metricId: string) => Promise<void>;
  suggestTags: (content: string) => Promise<string[]>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

const emptySnapshot: AppStoreSnapshot = {
  babies: [],
  memories: [],
  milestones: [],
  growthMetrics: [],
  babyMembers: [],
};

function storageKey(userId: string) {
  return `baby-growth-selected-baby:${userId}`;
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { user, status, isMockMode } = useAuth();
  const { showToast } = useToast();
  const [appStatus, setAppStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<AppStoreSnapshot>(emptySnapshot);
  const [selectedBabyId, setSelectedBabyIdState] = useState<string | null>(null);

  const getContext = useCallback((): RepositoryContext | null => {
    if (!user) return null;
    return { user, isMockMode };
  }, [isMockMode, user]);

  const refresh = useCallback(async () => {
    const context = getContext();
    if (!context) {
      setSnapshot(emptySnapshot);
      setAppStatus("idle");
      return;
    }

    setAppStatus("loading");
    setError(null);

    try {
      const nextSnapshot = await appRepository.getSnapshot(context);
      const accessibleBabies = nextSnapshot.babies.filter((baby) =>
        canUserAccessBaby(context.user, baby, nextSnapshot.babyMembers),
      );

      setSnapshot(nextSnapshot);
      setAppStatus("ready");

      if (typeof window !== "undefined") {
        const storedBabyId = window.localStorage.getItem(storageKey(context.user.id));
        const defaultBabyId =
          storedBabyId && accessibleBabies.some((baby) => baby.id === storedBabyId)
            ? storedBabyId
            : accessibleBabies[0]?.id ?? null;
        setSelectedBabyIdState(defaultBabyId);
      } else {
        setSelectedBabyIdState(accessibleBabies[0]?.id ?? null);
      }
    } catch (nextError) {
      setAppStatus("error");
      setError(nextError instanceof Error ? nextError.message : "数据加载失败");
    }
  }, [getContext]);

  useEffect(() => {
    if (status === "authenticated") {
      void refresh();
      return;
    }

    if (status === "unauthenticated") {
      setSnapshot(emptySnapshot);
      setSelectedBabyIdState(null);
      setAppStatus("idle");
    }
  }, [refresh, status]);

  const setSelectedBabyId = useCallback(
    (id: string) => {
      setSelectedBabyIdState(id);
      if (typeof window !== "undefined" && user) {
        window.localStorage.setItem(storageKey(user.id), id);
      }
    },
    [user],
  );

  const babies = useMemo(
    () =>
      snapshot.babies.filter((baby) =>
        canUserAccessBaby(user, baby, snapshot.babyMembers),
      ),
    [snapshot.babies, snapshot.babyMembers, user],
  );

  const selectedBaby =
    babies.find((baby) => baby.id === selectedBabyId) ?? babies[0] ?? null;

  const selectedBabyRole = useMemo(
    () => resolveBabyRole(user, selectedBaby, snapshot.babyMembers),
    [selectedBaby, snapshot.babyMembers, user],
  );

  const permissions = useMemo(
    () => resolveBabyPermissions(selectedBabyRole),
    [selectedBabyRole],
  );

  const incomingInvites = useMemo(
    () =>
      snapshot.babyMembers
        .filter((member) => isIncomingBabyInvite(user, member))
        .map((member) => ({
          member,
          baby: snapshot.babies.find((baby) => baby.id === member.babyId) ?? null,
        })),
    [snapshot.babyMembers, snapshot.babies, user],
  );

  const scopedMemories = useMemo(
    () =>
      snapshot.memories.filter((memory) =>
        selectedBaby ? memory.babyId === selectedBaby.id : true,
      ),
    [selectedBaby, snapshot.memories],
  );

  const scopedMilestones = useMemo(
    () =>
      snapshot.milestones.filter((milestone) =>
        selectedBaby ? milestone.babyId === selectedBaby.id : true,
      ),
    [selectedBaby, snapshot.milestones],
  );

  const scopedGrowthMetrics = useMemo(
    () =>
      snapshot.growthMetrics.filter((metric) =>
        selectedBaby ? metric.babyId === selectedBaby.id : true,
      ),
    [selectedBaby, snapshot.growthMetrics],
  );

  const scopedBabyMembers = useMemo(
    () =>
      snapshot.babyMembers.filter((member) =>
        selectedBaby ? member.babyId === selectedBaby.id : true,
      ),
    [selectedBaby, snapshot.babyMembers],
  );

  const galleryAssets = useMemo(
    () =>
      [
        ...scopedMemories.flatMap((memory) => memory.media),
        ...scopedMilestones.flatMap((milestone) => milestone.media),
      ].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [scopedMemories, scopedMilestones],
  );

  const availableTags = useMemo(
    () =>
      unique([
        ...snapshot.memories.flatMap((memory) => memory.tags),
        ...snapshot.milestones.flatMap((milestone) => milestone.tags),
      ]),
    [snapshot.memories, snapshot.milestones],
  );

  const withMutation = useCallback(
    async (work: (context: RepositoryContext) => Promise<void>, successMessage: string) => {
      const context = getContext();
      if (!context) {
        showToast("当前未登录，暂时不能保存", "error");
        return;
      }

      try {
        await work(context);
        await refresh();
        showToast(successMessage, "success");
      } catch (nextError) {
        showToast(
          nextError instanceof Error ? nextError.message : "操作失败，请稍后再试",
          "error",
        );
      }
    },
    [getContext, refresh, showToast],
  );

  const value = useMemo<AppDataContextValue>(
    () => ({
      status: appStatus,
      error,
      babies,
      babyMembers: snapshot.babyMembers,
      incomingInvites,
      selectedBabyMembers: scopedBabyMembers,
      selectedBabyId,
      selectedBaby,
      selectedBabyRole,
      permissions,
      memories: scopedMemories,
      milestones: scopedMilestones,
      growthMetrics: scopedGrowthMetrics,
      galleryAssets,
      recentMemories: scopedMemories.slice(0, 4),
      recentMilestones: scopedMilestones.slice(0, 3),
      availableTags,
      setSelectedBabyId,
      refresh,
      saveBaby: async (input) => {
        await withMutation((context) => appRepository.saveBaby(context, input), "宝宝档案已保存");
      },
      inviteBabyMember: async (input) => {
        await withMutation(
          (context) => appRepository.inviteBabyMember(context, input),
          "家庭成员邀请已保存",
        );
      },
      updateBabyMemberRole: async (input) => {
        await withMutation(
          (context) => appRepository.updateBabyMemberRole(context, input),
          "家庭成员角色已更新",
        );
      },
      acceptBabyInvite: async (memberId) => {
        await withMutation(
          (context) => appRepository.acceptBabyInvite(context, memberId),
          "共享邀请已接受",
        );
      },
      declineBabyInvite: async (memberId) => {
        await withMutation(
          (context) => appRepository.declineBabyInvite(context, memberId),
          "共享邀请已拒绝",
        );
      },
      removeBabyMember: async (memberId) => {
        await withMutation(
          (context) => appRepository.removeBabyMember(context, memberId),
          "家庭成员已移除",
        );
      },
      saveMemory: async (input) => {
        await withMutation((context) => appRepository.saveMemory(context, input), "成长记录已保存");
      },
      deleteMemory: async (memoryId) => {
        await withMutation(
          (context) => appRepository.deleteMemory(context, memoryId),
          "成长记录已删除，关联媒体会同步清理",
        );
      },
      saveMilestone: async (input) => {
        await withMutation(
          (context) => appRepository.saveMilestone(context, input),
          "里程碑已保存",
        );
      },
      deleteMilestone: async (milestoneId) => {
        await withMutation(
          (context) => appRepository.deleteMilestone(context, milestoneId),
          "里程碑已删除，关联媒体会同步清理",
        );
      },
      saveGrowthMetric: async (input) => {
        await withMutation(
          (context) => appRepository.saveGrowthMetric(context, input),
          "成长数据已保存",
        );
      },
      deleteGrowthMetric: async (metricId) => {
        await withMutation(
          (context) => appRepository.deleteGrowthMetric(context, metricId),
          "成长数据已删除",
        );
      },
      suggestTags: async (content: string) => {
        const context = getContext();
        if (!context || !content.trim()) return [];
        const suggestions = await appRepository.suggestTags(context, content);
        return suggestions.map((tag) => tag.name);
      },
    }),
    [
      appStatus,
      availableTags,
      babies,
      error,
      galleryAssets,
      getContext,
      incomingInvites,
      permissions,
      refresh,
      scopedBabyMembers,
      scopedGrowthMetrics,
      scopedMemories,
      scopedMilestones,
      selectedBaby,
      selectedBabyId,
      selectedBabyRole,
      setSelectedBabyId,
      snapshot.babyMembers,
      withMutation,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData 必须在 AppDataProvider 中使用");
  }
  return context;
}
