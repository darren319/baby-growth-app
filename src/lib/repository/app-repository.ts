import type { AuthChangeEvent, User } from "@supabase/supabase-js";

import { normalizeEmail, resolveBabyRole } from "@/lib/access";
import { MEMORY_TAG_PRESETS, STORAGE_BUCKET } from "@/lib/constants";
import {
  getMockMode,
  readMockAuthUser,
  readMockGlobalStore,
  readMockStore,
  writeMockAuthUser,
  writeMockGlobalStore,
} from "@/lib/mock-data";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  AppStoreSnapshot,
  AuthFormInput,
  AuthUser,
  Baby,
  BabyMember,
  GrowthMetric,
  MediaAsset,
  MemoryRecord,
  Milestone,
  RepositoryContext,
  SaveBabyInput,
  SaveBabyMemberInput,
  SaveGrowthMetricInput,
  SaveMemoryInput,
  SaveMilestoneInput,
  TagOption,
  UpdateBabyMemberRoleInput,
} from "@/lib/types";
import {
  createSvgPlaceholder,
  fileToDataUrl,
  safeId,
} from "@/lib/utils";

interface BabyRow {
  id: string;
  user_id: string;
  name: string;
  nickname: string | null;
  gender: Baby["gender"];
  birth_date: string;
  avatar_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface MediaRow {
  id: string;
  user_id: string;
  baby_id: string;
  kind: MediaAsset["kind"];
  file_url: string | null;
  poster_url: string | null;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  storage_path: string | null;
  memory_id: string | null;
  milestone_id: string | null;
  created_at: string;
}

interface MemoryTagJoinRow {
  tags: {
    id: string;
    name: string;
    color: string;
  } | null;
}

interface MemoryRow {
  id: string;
  user_id: string;
  baby_id: string;
  title: string;
  recorded_at: string;
  content: string | null;
  mood: MemoryRecord["mood"] | null;
  is_pinned: boolean | null;
  is_favorite: boolean | null;
  created_at: string;
  updated_at: string;
  media_assets?: MediaRow[] | null;
  memory_tags?: MemoryTagJoinRow[] | null;
}

interface MilestoneRow {
  id: string;
  user_id: string;
  baby_id: string;
  title: string;
  happened_at: string;
  description: string | null;
  is_important: boolean | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  media_assets?: MediaRow[] | null;
}

interface GrowthMetricRow {
  id: string;
  user_id: string;
  baby_id: string;
  type: GrowthMetric["type"];
  value: number;
  recorded_on: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface BabyMemberRow {
  id: string;
  baby_id: string;
  user_id: string | null;
  invite_email: string;
  display_name: string | null;
  role: BabyMember["role"];
  status: BabyMember["status"];
  invited_by: string | null;
  created_at: string;
  updated_at: string;
}

function normalizeUser(user: User | AuthUser | null): AuthUser | null {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email ?? "",
    fullName:
      "user_metadata" in user
        ? ((user.user_metadata?.full_name as string | undefined) ?? null)
        : (user.fullName ?? null),
  };
}

function createMockUser(input: AuthFormInput): AuthUser {
  const normalizedEmail = input.email.trim().toLowerCase();
  return {
    id: `mock-${normalizedEmail.replace(/[^a-z0-9]+/g, "-")}`,
    email: normalizedEmail,
    fullName: input.fullName?.trim() || normalizedEmail.split("@")[0],
  };
}

function resolveTagColor(name: string) {
  return (
    MEMORY_TAG_PRESETS.find((tag) => tag.name === name)?.color ?? "#F29D74"
  );
}

async function mapFileToMedia(
  user: AuthUser,
  babyId: string,
  file: File,
  relation: { memoryId?: string | null; milestoneId?: string | null },
) {
  const isImage = file.type.startsWith("image/");
  const isSmallEnoughForBase64 =
    isImage || file.size <= 8 * 1024 * 1024 || getMockMode();

  return {
    id: safeId(),
    userId: user.id,
    babyId,
    kind: isImage ? "image" : "video",
    fileUrl: isSmallEnoughForBase64 ? await fileToDataUrl(file) : undefined,
    posterUrl: isImage
      ? undefined
      : createSvgPlaceholder(
          file.name.replace(/\.[^.]+$/, ""),
          "视频在演示模式下使用占位封面展示",
          "#90B8F8",
        ),
    fileName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    memoryId: relation.memoryId ?? null,
    milestoneId: relation.milestoneId ?? null,
    createdAt: new Date().toISOString(),
  } satisfies MediaAsset;
}

function mapBaby(row: BabyRow): Baby {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    nickname: row.nickname ?? "",
    gender: row.gender ?? "unspecified",
    birthDate: row.birth_date,
    avatarUrl: row.avatar_url ?? "",
    notes: row.notes ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMedia(row: MediaRow): MediaAsset {
  return {
    id: row.id,
    userId: row.user_id,
    babyId: row.baby_id,
    kind: row.kind,
    fileUrl: row.file_url ?? undefined,
    posterUrl: row.poster_url ?? undefined,
    fileName: row.file_name,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    storagePath: row.storage_path ?? undefined,
    memoryId: row.memory_id ?? null,
    milestoneId: row.milestone_id ?? null,
    createdAt: row.created_at,
  };
}

function mapMemory(row: MemoryRow): MemoryRecord {
  return {
    id: row.id,
    userId: row.user_id,
    babyId: row.baby_id,
    title: row.title,
    recordedAt: row.recorded_at,
    content: row.content ?? "",
    tags:
      row.memory_tags
        ?.map((item) => item.tags?.name)
        .filter((tag): tag is string => Boolean(tag)) ?? [],
    mood: row.mood ?? undefined,
    isPinned: row.is_pinned ?? false,
    isFavorite: row.is_favorite ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    media: (row.media_assets ?? []).map(mapMedia),
  };
}

function mapMilestone(row: MilestoneRow): Milestone {
  return {
    id: row.id,
    userId: row.user_id,
    babyId: row.baby_id,
    title: row.title,
    happenedAt: row.happened_at,
    description: row.description ?? "",
    isImportant: row.is_important ?? false,
    tags: row.tags ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    media: (row.media_assets ?? []).map(mapMedia),
  };
}

function mapGrowthMetric(row: GrowthMetricRow): GrowthMetric {
  return {
    id: row.id,
    userId: row.user_id,
    babyId: row.baby_id,
    type: row.type,
    value: row.value,
    recordedOn: row.recorded_on,
    notes: row.notes ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapBabyMember(row: BabyMemberRow): BabyMember {
  return {
    id: row.id,
    babyId: row.baby_id,
    userId: row.user_id,
    inviteEmail: row.invite_email,
    displayName: row.display_name,
    role: row.role,
    status: row.status,
    invitedBy: row.invited_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getMockMutationStore(user: AuthUser) {
  return readMockGlobalStore(user);
}

function ensureMockCanEditContent(
  user: AuthUser,
  store: AppStoreSnapshot,
  babyId: string,
) {
  const baby = store.babies.find((item) => item.id === babyId);
  const role = resolveBabyRole(user, baby, store.babyMembers);

  if (role !== "owner" && role !== "editor") {
    throw new Error("当前共享角色只有查看权限，暂时不能编辑内容");
  }
}

function ensureMockCanManageBaby(
  user: AuthUser,
  store: AppStoreSnapshot,
  babyId: string,
) {
  const baby = store.babies.find((item) => item.id === babyId);
  const role = resolveBabyRole(user, baby, store.babyMembers);

  if (role !== "owner") {
    throw new Error("只有档案拥有者可以管理宝宝资料和家庭成员");
  }
}

function requireSupabase() {
  const client = getSupabaseBrowserClient();
  if (!client) {
    throw new Error("Supabase 环境变量未配置");
  }
  return client;
}

async function uploadToStorage(
  user: AuthUser,
  babyId: string,
  relationType: "memory" | "milestone" | "avatar",
  file: File,
) {
  const supabase = requireSupabase();
  const ext = file.name.split(".").pop() ?? "bin";
  const storagePath = `${babyId}/${user.id}/${relationType}/${safeId()}.${ext}`;
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
  return {
    storagePath,
    publicUrl: data.publicUrl,
  };
}

async function removeStoragePaths(paths: Array<string | null | undefined>) {
  const storagePaths = Array.from(
    new Set(paths.filter((path): path is string => Boolean(path))),
  );

  if (storagePaths.length === 0) {
    return;
  }

  const supabase = requireSupabase();
  try {
    await supabase.storage.from(STORAGE_BUCKET).remove(storagePaths);
  } catch (error) {
    console.warn("storage cleanup skipped", error);
  }
}

async function upsertMemoryTags(user: AuthUser, memoryId: string, tags: string[]) {
  const supabase = requireSupabase();

  await supabase.from("memory_tags").delete().eq("memory_id", memoryId);
  if (!tags.length) return;

  const payload = tags.map((name) => ({
    user_id: user.id,
    name,
    normalized_name: name.toLowerCase(),
    color: resolveTagColor(name),
  }));

  const { data: storedTags, error: tagError } = await supabase
    .from("tags")
    .upsert(payload, {
      onConflict: "user_id,normalized_name",
    })
    .select("id,name");

  if (tagError) {
    throw tagError;
  }

  const joinRows = (storedTags ?? []).map((tag) => ({
    memory_id: memoryId,
    tag_id: tag.id,
  }));

  if (joinRows.length > 0) {
    const { error: joinError } = await supabase.from("memory_tags").insert(joinRows);
    if (joinError) {
      throw joinError;
    }
  }
}

async function syncMemoryMedia(
  user: AuthUser,
  input: SaveMemoryInput,
  memoryId: string,
) {
  const supabase = requireSupabase();
  const retainedIds = input.existingMedia.map((item) => item.id);
  const { data: currentRows, error: currentError } = await supabase
    .from("media_assets")
    .select("id,storage_path")
    .eq("memory_id", memoryId);

  if (currentError) {
    throw currentError;
  }

  const removable = (currentRows ?? []).filter((row) => !retainedIds.includes(row.id));
  if (removable.length > 0) {
    const { error: deleteError } = await supabase
      .from("media_assets")
      .delete()
      .in(
        "id",
        removable.map((row) => row.id),
      );

    if (deleteError) {
      throw deleteError;
    }

    await removeStoragePaths(removable.map((row) => row.storage_path));
  }

  for (const file of input.newFiles) {
    const uploaded = await uploadToStorage(user, input.babyId, "memory", file);
    const isImage = file.type.startsWith("image/");
    const { error } = await supabase.from("media_assets").insert({
      id: safeId(),
      user_id: user.id,
      baby_id: input.babyId,
      memory_id: memoryId,
      milestone_id: null,
      kind: isImage ? "image" : "video",
      file_url: uploaded.publicUrl,
      poster_url: isImage ? null : uploaded.publicUrl,
      file_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
      storage_path: uploaded.storagePath,
    });

    if (error) {
      throw error;
    }
  }
}

async function syncMilestoneMedia(
  user: AuthUser,
  input: SaveMilestoneInput,
  milestoneId: string,
) {
  const supabase = requireSupabase();
  const retainedIds = input.existingMedia.map((item) => item.id);
  const { data: currentRows, error: currentError } = await supabase
    .from("media_assets")
    .select("id,storage_path")
    .eq("milestone_id", milestoneId);

  if (currentError) {
    throw currentError;
  }

  const removable = (currentRows ?? []).filter((row) => !retainedIds.includes(row.id));
  if (removable.length > 0) {
    const { error: deleteError } = await supabase
      .from("media_assets")
      .delete()
      .in(
        "id",
        removable.map((row) => row.id),
      );

    if (deleteError) {
      throw deleteError;
    }

    await removeStoragePaths(removable.map((row) => row.storage_path));
  }

  for (const file of input.newFiles) {
    const uploaded = await uploadToStorage(user, input.babyId, "milestone", file);
    const isImage = file.type.startsWith("image/");
    const { error } = await supabase.from("media_assets").insert({
      id: safeId(),
      user_id: user.id,
      baby_id: input.babyId,
      memory_id: null,
      milestone_id: milestoneId,
      kind: isImage ? "image" : "video",
      file_url: uploaded.publicUrl,
      poster_url: isImage ? null : uploaded.publicUrl,
      file_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
      storage_path: uploaded.storagePath,
    });

    if (error) {
      throw error;
    }
  }
}

export const authRepository = {
  isMockMode() {
    return getMockMode();
  },
  async getCurrentUser() {
    if (getMockMode()) {
      return readMockAuthUser();
    }

    const supabase = requireSupabase();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return normalizeUser(session?.user ?? null);
  },
  subscribe(callback: (event: AuthChangeEvent, user: AuthUser | null) => void) {
    if (getMockMode()) {
      return () => undefined;
    }

    const supabase = requireSupabase();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, normalizeUser(session?.user ?? null));
    });

    return () => subscription.unsubscribe();
  },
  async signIn(input: AuthFormInput) {
    if (getMockMode()) {
      const user = createMockUser(input);
      writeMockAuthUser(user);
      readMockGlobalStore(user);
      return user;
    }

    const supabase = requireSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) {
      throw error;
    }

    return normalizeUser(data.user)!;
  },
  async signUp(input: AuthFormInput) {
    if (getMockMode()) {
      const user = createMockUser(input);
      writeMockAuthUser(user);
      readMockGlobalStore(user);
      return user;
    }

    const supabase = requireSupabase();
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.fullName?.trim() || null,
        },
      },
    });

    if (error) {
      throw error;
    }

    return normalizeUser(data.user)!;
  },
  async signInWithGoogle() {
    if (getMockMode()) {
      const user = createMockUser({
        email: "google.parent@example.com",
        password: "google-oauth",
        fullName: "Google 家长",
      });
      writeMockAuthUser(user);
      readMockGlobalStore(user);
      return user;
    }

    const supabase = requireSupabase();
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/login?next=/dashboard`
        : undefined;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      throw error;
    }

    return null;
  },
  async signOut() {
    if (getMockMode()) {
      writeMockAuthUser(null);
      return;
    }

    const supabase = requireSupabase();
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  },
};

export const appRepository = {
  async getSnapshot(context: RepositoryContext): Promise<AppStoreSnapshot> {
    if (context.isMockMode) {
      return readMockStore(context.user);
    }

    const supabase = requireSupabase();
    const [babiesRes, memoriesRes, milestonesRes, growthRes, membersRes] = await Promise.all([
      supabase
        .from("babies")
        .select("*")
        .order("birth_date", { ascending: true }),
      supabase
        .from("memories")
        .select("*, media_assets(*), memory_tags(tags(id,name,color))")
        .order("recorded_at", { ascending: false }),
      supabase
        .from("milestones")
        .select("*, media_assets(*)")
        .order("happened_at", { ascending: false }),
      supabase
        .from("growth_metrics")
        .select("*")
        .order("recorded_on", { ascending: true }),
      supabase.from("baby_members").select("*").order("created_at", { ascending: true }),
    ]);

    if (babiesRes.error) throw babiesRes.error;
    if (memoriesRes.error) throw memoriesRes.error;
    if (milestonesRes.error) throw milestonesRes.error;
    if (growthRes.error) throw growthRes.error;
    if (membersRes.error) throw membersRes.error;

    return {
      babies: (babiesRes.data ?? []).map(mapBaby),
      memories: (memoriesRes.data ?? []).map(mapMemory),
      milestones: (milestonesRes.data ?? []).map(mapMilestone),
      growthMetrics: (growthRes.data ?? []).map(mapGrowthMetric),
      babyMembers: (membersRes.data ?? []).map(mapBabyMember),
    };
  },
  async saveBaby(context: RepositoryContext, input: SaveBabyInput) {
    if (context.isMockMode) {
      const store = getMockMutationStore(context.user);
      if (input.id) {
        ensureMockCanManageBaby(context.user, store, input.id);
      }
      const avatarUrl = input.avatarFile
        ? await fileToDataUrl(input.avatarFile)
        : (input.avatarUrl ?? undefined);
      const existing = store.babies.find((baby) => baby.id === input.id);
      const now = new Date().toISOString();
      const nextBaby: Baby = {
        id: input.id ?? safeId(),
        userId: context.user.id,
        name: input.name,
        nickname: input.nickname ?? "",
        gender: input.gender,
        birthDate: input.birthDate,
        avatarUrl: avatarUrl || existing?.avatarUrl,
        notes: input.notes ?? "",
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };

      const babies = existing
        ? store.babies.map((baby) => (baby.id === existing.id ? nextBaby : baby))
        : [nextBaby, ...store.babies];
      writeMockGlobalStore({ ...store, babies });
      return;
    }

    const supabase = requireSupabase();
    let avatarUrl = input.avatarUrl ?? null;
    const babyId = input.id ?? safeId();

    if (input.avatarFile) {
      const uploaded = await uploadToStorage(
        context.user,
        babyId,
        "avatar",
        input.avatarFile,
      );
      avatarUrl = uploaded.publicUrl;
    }

    const payload = {
      name: input.name,
      nickname: input.nickname || null,
      gender: input.gender,
      birth_date: input.birthDate,
      avatar_url: avatarUrl,
      notes: input.notes || null,
    };

    const query = input.id
      ? supabase
          .from("babies")
          .update(payload)
          .eq("id", input.id)
      : supabase.from("babies").insert({
          id: babyId,
          user_id: context.user.id,
          ...payload,
        });

    const { error } = await query;
    if (error) {
      throw error;
    }
  },
  async saveMemory(context: RepositoryContext, input: SaveMemoryInput) {
    if (context.isMockMode) {
      const store = getMockMutationStore(context.user);
      ensureMockCanEditContent(context.user, store, input.babyId);
      const existing = store.memories.find((memory) => memory.id === input.id);
      const memoryId = input.id ?? safeId();
      const media = [
        ...input.existingMedia,
        ...(await Promise.all(
          input.newFiles.map((file) =>
            mapFileToMedia(context.user, input.babyId, file, { memoryId }),
          ),
        )),
      ];
      const now = new Date().toISOString();
      const nextMemory: MemoryRecord = {
        id: memoryId,
        userId: context.user.id,
        babyId: input.babyId,
        title: input.title,
        recordedAt: input.recordedAt,
        content: input.content,
        tags: input.tags,
        mood: input.mood,
        isPinned: input.isPinned,
        isFavorite: input.isFavorite,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        media,
      };

      const memories = existing
        ? store.memories.map((memory) =>
            memory.id === existing.id ? nextMemory : memory,
          )
        : [nextMemory, ...store.memories];

      writeMockGlobalStore({ ...store, memories });
      return;
    }

    const supabase = requireSupabase();
    const payload = {
      baby_id: input.babyId,
      title: input.title,
      recorded_at: input.recordedAt,
      content: input.content,
      mood: input.mood ?? null,
      is_pinned: input.isPinned,
      is_favorite: input.isFavorite,
    };

    let memoryId = input.id;

    if (input.id) {
      const { error } = await supabase
        .from("memories")
        .update(payload)
        .eq("id", input.id);
      if (error) throw error;
    } else {
      memoryId = safeId();
      const { error } = await supabase
        .from("memories")
        .insert({ id: memoryId, user_id: context.user.id, ...payload });
      if (error) throw error;
    }

    await upsertMemoryTags(context.user, memoryId!, input.tags);
    await syncMemoryMedia(context.user, input, memoryId!);
  },
  async deleteMemory(context: RepositoryContext, memoryId: string) {
    if (context.isMockMode) {
      const store = getMockMutationStore(context.user);
      const target = store.memories.find((memory) => memory.id === memoryId);
      if (!target) {
        throw new Error("要删除的成长记录不存在");
      }

      ensureMockCanEditContent(context.user, store, target.babyId);
      writeMockGlobalStore({
        ...store,
        memories: store.memories.filter((memory) => memory.id !== memoryId),
        milestones: store.milestones.map((milestone) => ({
          ...milestone,
          media: milestone.media.filter((asset) => asset.memoryId !== memoryId),
        })),
      });
      return;
    }

    const supabase = requireSupabase();
    const { data: mediaRows } = await supabase
      .from("media_assets")
      .select("storage_path")
      .eq("memory_id", memoryId);
    const { error } = await supabase
      .from("memories")
      .delete()
      .eq("id", memoryId);
    if (error) throw error;

    await removeStoragePaths((mediaRows ?? []).map((row) => row.storage_path));
  },
  async inviteBabyMember(context: RepositoryContext, input: SaveBabyMemberInput) {
    const normalizedEmail = normalizeEmail(input.inviteEmail);

    if (normalizedEmail === normalizeEmail(context.user.email)) {
      throw new Error("当前账号已经是宝宝拥有者，不需要重复邀请");
    }

    if (context.isMockMode) {
      const store = getMockMutationStore(context.user);
      ensureMockCanManageBaby(context.user, store, input.babyId);
      const existing = store.babyMembers.find(
        (member) =>
          member.babyId === input.babyId &&
          normalizeEmail(member.inviteEmail) === normalizedEmail,
      );
      const now = new Date().toISOString();
      const nextMember: BabyMember = {
        id: existing?.id ?? safeId(),
        babyId: input.babyId,
        userId: existing?.userId ?? null,
        inviteEmail: normalizedEmail,
        displayName: input.displayName?.trim() || existing?.displayName || null,
        role: input.role,
        status: existing?.status ?? "invited",
        invitedBy: context.user.id,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };

      const babyMembers = existing
        ? store.babyMembers.map((member) =>
            member.id === existing.id ? nextMember : member,
          )
        : [...store.babyMembers, nextMember];
      writeMockGlobalStore({ ...store, babyMembers });
      return;
    }

    const supabase = requireSupabase();
    const { data: existing, error: existingError } = await supabase
      .from("baby_members")
      .select("id,user_id,status")
      .eq("baby_id", input.babyId)
      .eq("invite_email", normalizedEmail)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existing?.id) {
      const { error } = await supabase
        .from("baby_members")
        .update({
          display_name: input.displayName?.trim() || null,
          role: input.role,
          status: existing.user_id ? existing.status : "invited",
        })
        .eq("id", existing.id);

      if (error) {
        throw error;
      }
      return;
    }

    const { error } = await supabase.from("baby_members").insert({
      id: safeId(),
      baby_id: input.babyId,
      user_id: null,
      invite_email: normalizedEmail,
      display_name: input.displayName?.trim() || null,
      role: input.role,
      status: "invited",
      invited_by: context.user.id,
    });

    if (error) {
      throw error;
    }
  },
  async updateBabyMemberRole(
    context: RepositoryContext,
    input: UpdateBabyMemberRoleInput,
  ) {
    if (context.isMockMode) {
      const store = getMockMutationStore(context.user);
      const target = store.babyMembers.find((member) => member.id === input.memberId);
      if (!target) {
        throw new Error("要修改的家庭成员不存在");
      }

      ensureMockCanManageBaby(context.user, store, target.babyId);
      writeMockGlobalStore({
        ...store,
        babyMembers: store.babyMembers.map((member) =>
          member.id === target.id
            ? {
                ...member,
                role: input.role,
                updatedAt: new Date().toISOString(),
              }
            : member,
        ),
      });
      return;
    }

    const supabase = requireSupabase();
    const { error } = await supabase
      .from("baby_members")
      .update({ role: input.role })
      .eq("id", input.memberId);

    if (error) {
      throw error;
    }
  },
  async acceptBabyInvite(context: RepositoryContext, memberId: string) {
    if (context.isMockMode) {
      const store = getMockMutationStore(context.user);
      const target = store.babyMembers.find((member) => member.id === memberId);
      if (!target || normalizeEmail(target.inviteEmail) !== normalizeEmail(context.user.email)) {
        throw new Error("没有找到这条可接受的邀请");
      }

      writeMockGlobalStore({
        ...store,
        babyMembers: store.babyMembers.map((member) =>
          member.id === target.id
            ? {
                ...member,
                userId: context.user.id,
                status: "active",
                displayName: member.displayName || context.user.fullName || null,
                updatedAt: new Date().toISOString(),
              }
            : member,
        ),
      });
      return;
    }

    const supabase = requireSupabase();
    const { error } = await supabase
      .from("baby_members")
      .update({
        user_id: context.user.id,
        status: "active",
        display_name: context.user.fullName?.trim() || null,
      })
      .eq("id", memberId)
      .eq("status", "invited");

    if (error) {
      throw error;
    }
  },
  async declineBabyInvite(context: RepositoryContext, memberId: string) {
    if (context.isMockMode) {
      const store = getMockMutationStore(context.user);
      const target = store.babyMembers.find((member) => member.id === memberId);
      if (!target || normalizeEmail(target.inviteEmail) !== normalizeEmail(context.user.email)) {
        throw new Error("没有找到这条可拒绝的邀请");
      }

      writeMockGlobalStore({
        ...store,
        babyMembers: store.babyMembers.filter((member) => member.id !== target.id),
      });
      return;
    }

    const supabase = requireSupabase();
    const { error } = await supabase.from("baby_members").delete().eq("id", memberId);
    if (error) {
      throw error;
    }
  },
  async removeBabyMember(context: RepositoryContext, memberId: string) {
    if (context.isMockMode) {
      const store = getMockMutationStore(context.user);
      const target = store.babyMembers.find((member) => member.id === memberId);
      if (!target) {
        throw new Error("要移除的家庭成员不存在");
      }

      ensureMockCanManageBaby(context.user, store, target.babyId);
      writeMockGlobalStore({
        ...store,
        babyMembers: store.babyMembers.filter((member) => member.id !== memberId),
      });
      return;
    }

    const supabase = requireSupabase();
    const { error } = await supabase.from("baby_members").delete().eq("id", memberId);
    if (error) {
      throw error;
    }
  },
  async saveMilestone(context: RepositoryContext, input: SaveMilestoneInput) {
    if (context.isMockMode) {
      const store = getMockMutationStore(context.user);
      ensureMockCanEditContent(context.user, store, input.babyId);
      const existing = store.milestones.find((item) => item.id === input.id);
      const milestoneId = input.id ?? safeId();
      const media = [
        ...input.existingMedia,
        ...(await Promise.all(
          input.newFiles.map((file) =>
            mapFileToMedia(context.user, input.babyId, file, {
              milestoneId,
            }),
          ),
        )),
      ];

      const now = new Date().toISOString();
      const nextMilestone: Milestone = {
        id: milestoneId,
        userId: context.user.id,
        babyId: input.babyId,
        title: input.title,
        happenedAt: input.happenedAt,
        description: input.description ?? "",
        isImportant: input.isImportant,
        tags: input.tags,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        media,
      };

      const milestones = existing
        ? store.milestones.map((item) =>
            item.id === existing.id ? nextMilestone : item,
          )
        : [nextMilestone, ...store.milestones];
      writeMockGlobalStore({ ...store, milestones });
      return;
    }

    const supabase = requireSupabase();
    const payload = {
      baby_id: input.babyId,
      title: input.title,
      happened_at: input.happenedAt,
      description: input.description || null,
      is_important: input.isImportant,
      tags: input.tags,
    };

    let milestoneId = input.id;

    if (input.id) {
      const { error } = await supabase
        .from("milestones")
        .update(payload)
        .eq("id", input.id);
      if (error) throw error;
    } else {
      milestoneId = safeId();
      const { error } = await supabase
        .from("milestones")
        .insert({ id: milestoneId, user_id: context.user.id, ...payload });
      if (error) throw error;
    }

    await syncMilestoneMedia(context.user, input, milestoneId!);
  },
  async deleteMilestone(context: RepositoryContext, milestoneId: string) {
    if (context.isMockMode) {
      const store = getMockMutationStore(context.user);
      const target = store.milestones.find((milestone) => milestone.id === milestoneId);
      if (!target) {
        throw new Error("要删除的里程碑不存在");
      }

      ensureMockCanEditContent(context.user, store, target.babyId);
      writeMockGlobalStore({
        ...store,
        milestones: store.milestones.filter((item) => item.id !== milestoneId),
      });
      return;
    }

    const supabase = requireSupabase();
    const { data: mediaRows } = await supabase
      .from("media_assets")
      .select("storage_path")
      .eq("milestone_id", milestoneId);
    const { error } = await supabase
      .from("milestones")
      .delete()
      .eq("id", milestoneId);
    if (error) throw error;

    await removeStoragePaths((mediaRows ?? []).map((row) => row.storage_path));
  },
  async saveGrowthMetric(context: RepositoryContext, input: SaveGrowthMetricInput) {
    if (context.isMockMode) {
      const store = getMockMutationStore(context.user);
      ensureMockCanEditContent(context.user, store, input.babyId);
      const existing = store.growthMetrics.find((metric) => metric.id === input.id);
      const now = new Date().toISOString();
      const nextMetric: GrowthMetric = {
        id: input.id ?? safeId(),
        userId: context.user.id,
        babyId: input.babyId,
        type: input.type,
        value: input.value,
        recordedOn: input.recordedOn,
        notes: input.notes ?? "",
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };

      const growthMetrics = existing
        ? store.growthMetrics.map((metric) =>
            metric.id === existing.id ? nextMetric : metric,
          )
        : [...store.growthMetrics, nextMetric];
      writeMockGlobalStore({ ...store, growthMetrics });
      return;
    }

    const supabase = requireSupabase();
    const payload = {
      baby_id: input.babyId,
      type: input.type,
      value: input.value,
      recorded_on: input.recordedOn,
      notes: input.notes || null,
    };

    const query = input.id
      ? supabase
          .from("growth_metrics")
          .update(payload)
          .eq("id", input.id)
      : supabase
          .from("growth_metrics")
          .insert({ id: safeId(), user_id: context.user.id, ...payload });

    const { error } = await query;
    if (error) throw error;
  },
  async deleteGrowthMetric(context: RepositoryContext, metricId: string) {
    if (context.isMockMode) {
      const store = getMockMutationStore(context.user);
      const target = store.growthMetrics.find((metric) => metric.id === metricId);
      if (!target) {
        throw new Error("要删除的成长数据不存在");
      }

      ensureMockCanEditContent(context.user, store, target.babyId);
      writeMockGlobalStore({
        ...store,
        growthMetrics: store.growthMetrics.filter((metric) => metric.id !== metricId),
      });
      return;
    }

    const supabase = requireSupabase();
    const { error } = await supabase
      .from("growth_metrics")
      .delete()
      .eq("id", metricId);
    if (error) throw error;
  },
  async suggestTags(_context: RepositoryContext, content: string): Promise<TagOption[]> {
    // TODO: 这里预留未来 AI 自动打标签能力，后续可接入模型推理或 Edge Function。
    const simpleMatches = MEMORY_TAG_PRESETS.filter((tag) =>
      content.includes(tag.name),
    );
    return simpleMatches.slice(0, 3);
  },
};
