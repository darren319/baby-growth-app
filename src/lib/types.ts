export type Gender = "female" | "male" | "other" | "unspecified";
export type MemoryMood =
  | "happy"
  | "calm"
  | "fussy"
  | "excited"
  | "sleepy"
  | "sick";
export type MediaKind = "image" | "video";
export type GrowthMetricType = "height" | "weight" | "head_circumference";

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string | null;
}

export interface Baby {
  id: string;
  userId: string;
  name: string;
  nickname?: string;
  gender: Gender;
  birthDate: string;
  avatarUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaAsset {
  id: string;
  userId: string;
  babyId: string;
  kind: MediaKind;
  fileUrl?: string;
  posterUrl?: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath?: string;
  memoryId?: string | null;
  milestoneId?: string | null;
  createdAt: string;
}

export interface MemoryRecord {
  id: string;
  userId: string;
  babyId: string;
  title: string;
  recordedAt: string;
  content: string;
  tags: string[];
  mood?: MemoryMood;
  isPinned: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  media: MediaAsset[];
}

export interface Milestone {
  id: string;
  userId: string;
  babyId: string;
  title: string;
  happenedAt: string;
  description?: string;
  isImportant: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  media: MediaAsset[];
}

export interface GrowthMetric {
  id: string;
  userId: string;
  babyId: string;
  type: GrowthMetricType;
  value: number;
  recordedOn: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TagOption {
  id: string;
  name: string;
  color: string;
}

export interface BabyMember {
  id: string;
  babyId: string;
  userId?: string | null;
  inviteEmail: string;
  displayName?: string | null;
  role: "owner" | "editor" | "viewer";
  status: "active" | "invited";
  invitedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppStoreSnapshot {
  babies: Baby[];
  memories: MemoryRecord[];
  milestones: Milestone[];
  growthMetrics: GrowthMetric[];
  babyMembers: BabyMember[];
}

export interface AppErrorState {
  message: string;
  code?: string;
}

export interface MemoryFilters {
  query: string;
  tag: string;
  month: string;
  favoritesOnly: boolean;
  pinnedOnly: boolean;
}

export interface SaveBabyInput {
  id?: string;
  name: string;
  nickname?: string;
  gender: Gender;
  birthDate: string;
  avatarFile?: File | null;
  avatarUrl?: string;
  notes?: string;
}

export interface SaveMemoryInput {
  id?: string;
  babyId: string;
  title: string;
  recordedAt: string;
  content: string;
  tags: string[];
  mood?: MemoryMood;
  isPinned: boolean;
  isFavorite: boolean;
  existingMedia: MediaAsset[];
  newFiles: File[];
}

export interface SaveMilestoneInput {
  id?: string;
  babyId: string;
  title: string;
  happenedAt: string;
  description?: string;
  isImportant: boolean;
  tags: string[];
  existingMedia: MediaAsset[];
  newFiles: File[];
}

export interface SaveGrowthMetricInput {
  id?: string;
  babyId: string;
  type: GrowthMetricType;
  value: number;
  recordedOn: string;
  notes?: string;
}

export interface SaveBabyMemberInput {
  id?: string;
  babyId: string;
  inviteEmail: string;
  displayName?: string;
  role: BabyMember["role"];
}

export interface AuthFormInput {
  email: string;
  password: string;
  fullName?: string;
}

export interface RepositoryContext {
  user: AuthUser;
  isMockMode: boolean;
}
