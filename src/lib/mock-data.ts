import { canUserAccessBaby, isIncomingBabyInvite, matchesMemberUser } from "@/lib/access";
import type {
  AppStoreSnapshot,
  AuthUser,
  Baby,
  BabyMember,
  GrowthMetric,
  MediaAsset,
  MemoryRecord,
  Milestone,
} from "@/lib/types";
import { createSvgPlaceholder } from "@/lib/utils";

const MOCK_AUTH_KEY = "baby-growth-auth";
const MOCK_STORE_PREFIX = "baby-growth-store";
const MOCK_GLOBAL_STORE_KEY = "baby-growth-store-global";

function nowOffset(daysOffset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString();
}

function withDefaults(snapshot?: Partial<AppStoreSnapshot> | null): AppStoreSnapshot {
  return {
    babies: snapshot?.babies ?? [],
    memories: snapshot?.memories ?? [],
    milestones: snapshot?.milestones ?? [],
    growthMetrics: snapshot?.growthMetrics ?? [],
    babyMembers: snapshot?.babyMembers ?? [],
  };
}

function parseStore(raw: string | null) {
  if (!raw) return null;

  try {
    return withDefaults(JSON.parse(raw) as Partial<AppStoreSnapshot>);
  } catch {
    return null;
  }
}

function sampleMedia(userId: string, babyId: string): Record<string, MediaAsset> {
  return {
    clapImage: {
      id: "media-clap-image",
      userId,
      babyId,
      kind: "image",
      fileUrl: createSvgPlaceholder("第一次会拍手啦", "午睡醒来之后，对着镜头认真鼓掌"),
      fileName: "clap-moment.jpg",
      mimeType: "image/jpeg",
      sizeBytes: 328_000,
      memoryId: "memory-clap",
      milestoneId: null,
      createdAt: nowOffset(-2),
    },
    smileImage: {
      id: "media-smile-image",
      userId,
      babyId,
      kind: "image",
      fileUrl: createSvgPlaceholder("今天笑得特别甜", "洗完澡裹着毛巾，笑出了小酒窝", "#E28AD0"),
      fileName: "smile-bath.jpg",
      mimeType: "image/jpeg",
      sizeBytes: 284_000,
      memoryId: "memory-bath",
      milestoneId: null,
      createdAt: nowOffset(-5),
    },
    crawlVideo: {
      id: "media-crawl-video",
      userId,
      babyId,
      kind: "video",
      fileUrl: undefined,
      posterUrl: createSvgPlaceholder(
        "第一次往前爬",
        "视频示意图，正式接入 Supabase 后可播放原视频",
        "#90B8F8",
      ),
      fileName: "crawl-first.mp4",
      mimeType: "video/mp4",
      sizeBytes: 6_200_000,
      memoryId: null,
      milestoneId: "milestone-crawl",
      createdAt: nowOffset(-8),
    },
  };
}

function createSampleStore(user: AuthUser): AppStoreSnapshot {
  const primaryBabyId = "baby-yoyo";
  const siblingBabyId = "baby-xiaojiu";
  const assets = sampleMedia(user.id, primaryBabyId);

  const babies: Baby[] = [
    {
      id: primaryBabyId,
      userId: user.id,
      name: "柚柚",
      nickname: "小柚子",
      gender: "female",
      birthDate: "2025-08-17",
      avatarUrl: createSvgPlaceholder("柚柚", "8 个月", "#F4A26D"),
      notes: "很爱听音乐，看到镜子会主动挥手。",
      createdAt: nowOffset(-200),
      updatedAt: nowOffset(-3),
    },
    {
      id: siblingBabyId,
      userId: user.id,
      name: "小啾",
      nickname: "啾啾",
      gender: "male",
      birthDate: "2023-11-03",
      avatarUrl: createSvgPlaceholder("小啾", "2 岁 4 个月", "#7BC7A4"),
      notes: "作为哥哥档案，方便演示多宝宝切换。",
      createdAt: nowOffset(-600),
      updatedAt: nowOffset(-9),
    },
  ];

  const memories: MemoryRecord[] = [
    {
      id: "memory-clap",
      userId: user.id,
      babyId: primaryBabyId,
      title: "第一次会拍手啦",
      recordedAt: nowOffset(-2),
      content:
        "下午吃完苹果泥之后，我们一边唱拍手歌一边逗她，结果她真的自己拍了三下，小表情特别认真。",
      tags: ["第一次", "玩耍"],
      mood: "excited",
      isPinned: true,
      isFavorite: true,
      createdAt: nowOffset(-2),
      updatedAt: nowOffset(-2),
      media: [assets.clapImage],
    },
    {
      id: "memory-bath",
      userId: user.id,
      babyId: primaryBabyId,
      title: "洗澡后超开心",
      recordedAt: nowOffset(-5),
      content:
        "晚上洗澡后裹着小毛巾一直咯咯笑，抹润肤乳也很配合，今天整体状态很放松。",
      tags: ["洗澡", "开心"],
      mood: "happy",
      isPinned: false,
      isFavorite: true,
      createdAt: nowOffset(-5),
      updatedAt: nowOffset(-5),
      media: [assets.smileImage],
    },
    {
      id: "memory-sleep",
      userId: user.id,
      babyId: primaryBabyId,
      title: "午觉拉长到 1 小时 40 分",
      recordedAt: nowOffset(-9),
      content:
        "今天上午出门晒了一会儿太阳，中午入睡很快，睡醒后精神明显更好，下午也没有明显哭闹。",
      tags: ["睡觉"],
      mood: "calm",
      isPinned: false,
      isFavorite: false,
      createdAt: nowOffset(-9),
      updatedAt: nowOffset(-9),
      media: [],
    },
    {
      id: "memory-checkup",
      userId: user.id,
      babyId: siblingBabyId,
      title: "哥哥复查一切正常",
      recordedAt: nowOffset(-12),
      content: "体检完成，医生说发育指标都很好。这个档案主要用于演示多宝宝切换。",
      tags: ["体检"],
      mood: "calm",
      isPinned: false,
      isFavorite: false,
      createdAt: nowOffset(-12),
      updatedAt: nowOffset(-12),
      media: [],
    },
  ];

  const milestones: Milestone[] = [
    {
      id: "milestone-crawl",
      userId: user.id,
      babyId: primaryBabyId,
      title: "第一次往前爬",
      happenedAt: nowOffset(-8),
      description: "原本只是原地转圈，今天终于借着玩具的吸引力向前挪了两步。",
      isImportant: true,
      tags: ["第一次", "运动发育"],
      createdAt: nowOffset(-8),
      updatedAt: nowOffset(-8),
      media: [assets.crawlVideo],
    },
    {
      id: "milestone-sit",
      userId: user.id,
      babyId: primaryBabyId,
      title: "能稳定自己坐着 10 分钟",
      happenedAt: nowOffset(-21),
      description: "从需要扶着到现在可以自己坐着玩玩具，进步很明显。",
      isImportant: false,
      tags: ["成长", "动作"],
      createdAt: nowOffset(-21),
      updatedAt: nowOffset(-21),
      media: [],
    },
  ];

  const growthMetrics: GrowthMetric[] = [
    {
      id: "metric-height-1",
      userId: user.id,
      babyId: primaryBabyId,
      type: "height",
      value: 68.5,
      recordedOn: "2025-12-12",
      notes: "社区体检",
      createdAt: nowOffset(-90),
      updatedAt: nowOffset(-90),
    },
    {
      id: "metric-height-2",
      userId: user.id,
      babyId: primaryBabyId,
      type: "height",
      value: 70.1,
      recordedOn: "2026-01-16",
      notes: "家里测量",
      createdAt: nowOffset(-60),
      updatedAt: nowOffset(-60),
    },
    {
      id: "metric-height-3",
      userId: user.id,
      babyId: primaryBabyId,
      type: "height",
      value: 72.4,
      recordedOn: "2026-03-10",
      notes: "儿保检查",
      createdAt: nowOffset(-10),
      updatedAt: nowOffset(-10),
    },
    {
      id: "metric-weight-1",
      userId: user.id,
      babyId: primaryBabyId,
      type: "weight",
      value: 8.1,
      recordedOn: "2025-12-12",
      notes: "社区体检",
      createdAt: nowOffset(-90),
      updatedAt: nowOffset(-90),
    },
    {
      id: "metric-weight-2",
      userId: user.id,
      babyId: primaryBabyId,
      type: "weight",
      value: 8.5,
      recordedOn: "2026-01-16",
      notes: "家里测量",
      createdAt: nowOffset(-60),
      updatedAt: nowOffset(-60),
    },
    {
      id: "metric-weight-3",
      userId: user.id,
      babyId: primaryBabyId,
      type: "weight",
      value: 8.9,
      recordedOn: "2026-03-10",
      notes: "儿保检查",
      createdAt: nowOffset(-10),
      updatedAt: nowOffset(-10),
    },
    {
      id: "metric-head-1",
      userId: user.id,
      babyId: primaryBabyId,
      type: "head_circumference",
      value: 43.8,
      recordedOn: "2025-12-12",
      notes: "社区体检",
      createdAt: nowOffset(-90),
      updatedAt: nowOffset(-90),
    },
    {
      id: "metric-head-2",
      userId: user.id,
      babyId: primaryBabyId,
      type: "head_circumference",
      value: 44.6,
      recordedOn: "2026-03-10",
      notes: "儿保检查",
      createdAt: nowOffset(-10),
      updatedAt: nowOffset(-10),
    },
  ];

  const babyMembers: BabyMember[] = [
    {
      id: "member-dad",
      babyId: primaryBabyId,
      userId: null,
      inviteEmail: "dad@example.com",
      displayName: "爸爸",
      role: "editor",
      status: "invited",
      invitedBy: user.id,
      createdAt: nowOffset(-40),
      updatedAt: nowOffset(-18),
    },
    {
      id: "member-grandma",
      babyId: primaryBabyId,
      userId: null,
      inviteEmail: "grandma@example.com",
      displayName: "外婆",
      role: "viewer",
      status: "invited",
      invitedBy: user.id,
      createdAt: nowOffset(-6),
      updatedAt: nowOffset(-6),
    },
  ];

  return { babies, memories, milestones, growthMetrics, babyMembers };
}

function readLegacyMockUserStore(user: AuthUser) {
  if (typeof window === "undefined") {
    return null;
  }

  return parseStore(window.localStorage.getItem(mockStoreKey(user.id)));
}

export function getMockMode() {
  return (
    !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function readMockAuthUser() {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(MOCK_AUTH_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function writeMockAuthUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;

  if (user) {
    window.localStorage.setItem(MOCK_AUTH_KEY, JSON.stringify(user));
    return;
  }

  window.localStorage.removeItem(MOCK_AUTH_KEY);
}

export function mockStoreKey(userId: string) {
  return `${MOCK_STORE_PREFIX}:${userId}`;
}

export function readMockGlobalStore(seedUser: AuthUser): AppStoreSnapshot {
  if (typeof window === "undefined") {
    return createSampleStore(seedUser);
  }

  const existing = parseStore(window.localStorage.getItem(MOCK_GLOBAL_STORE_KEY));
  if (existing) {
    return existing;
  }

  const migrated = readLegacyMockUserStore(seedUser);
  const seed = migrated ?? createSampleStore(seedUser);
  writeMockGlobalStore(seed);
  return seed;
}

export function writeMockGlobalStore(store: AppStoreSnapshot) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MOCK_GLOBAL_STORE_KEY, JSON.stringify(store));
}

export function filterMockStoreForUser(
  store: AppStoreSnapshot,
  user: AuthUser,
): AppStoreSnapshot {
  const accessibleBabyIds = new Set(
    store.babies
      .filter((baby) => canUserAccessBaby(user, baby, store.babyMembers))
      .map((baby) => baby.id),
  );

  const visibleBabies = store.babies.filter(
    (baby) =>
      accessibleBabyIds.has(baby.id) ||
      store.babyMembers.some(
        (member) => member.babyId === baby.id && isIncomingBabyInvite(user, member),
      ),
  );

  const visibleMembers = store.babyMembers.filter((member) => {
    const isOwnerView = store.babies.some(
      (baby) => baby.id === member.babyId && baby.userId === user.id,
    );

    return (
      isOwnerView ||
      (member.status === "active" && matchesMemberUser(user, member)) ||
      isIncomingBabyInvite(user, member)
    );
  });

  return {
    babies: visibleBabies,
    memories: store.memories.filter((memory) => accessibleBabyIds.has(memory.babyId)),
    milestones: store.milestones.filter((milestone) =>
      accessibleBabyIds.has(milestone.babyId),
    ),
    growthMetrics: store.growthMetrics.filter((metric) =>
      accessibleBabyIds.has(metric.babyId),
    ),
    babyMembers: visibleMembers,
  };
}

export function readMockStore(user: AuthUser): AppStoreSnapshot {
  return filterMockStoreForUser(readMockGlobalStore(user), user);
}

export function writeMockStore(_user: AuthUser, store: AppStoreSnapshot) {
  writeMockGlobalStore(store);
}
