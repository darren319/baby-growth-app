import type {
  AuthUser,
  Baby,
  BabyMember,
  BabyPermissions,
} from "@/lib/types";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function matchesMemberUser(user: AuthUser | null, member: BabyMember) {
  if (!user) return false;

  return (
    member.userId === user.id ||
    normalizeEmail(member.inviteEmail) === normalizeEmail(user.email)
  );
}

export function isIncomingBabyInvite(user: AuthUser | null, member: BabyMember) {
  if (!user) return false;

  return (
    member.status === "invited" &&
    normalizeEmail(member.inviteEmail) === normalizeEmail(user.email)
  );
}

export function resolveBabyRole(
  user: AuthUser | null,
  baby: Baby | null | undefined,
  members: BabyMember[],
): BabyPermissions["role"] {
  if (!user || !baby) return null;

  if (baby.userId === user.id) {
    return "owner";
  }

  const activeMember = members.find(
    (member) =>
      member.babyId === baby.id &&
      member.status === "active" &&
      matchesMemberUser(user, member),
  );

  return activeMember?.role ?? null;
}

export function resolveBabyPermissions(
  role: BabyPermissions["role"],
): BabyPermissions {
  return {
    role,
    canEditContent: role === "owner" || role === "editor",
    canEditProfile: role === "owner",
    canManageMembers: role === "owner",
    isReadOnly: role === "viewer",
  };
}

export function canUserAccessBaby(
  user: AuthUser | null,
  baby: Baby,
  members: BabyMember[],
) {
  return Boolean(resolveBabyRole(user, baby, members));
}
