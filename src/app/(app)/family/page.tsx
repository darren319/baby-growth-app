"use client";

import { useMemo, useState } from "react";
import {
  Check,
  MailPlus,
  Trash2,
  UserCheck,
  UsersRound,
  X,
} from "lucide-react";

import { BabyMemberFormSheet } from "@/components/family/baby-member-form-sheet";
import { useAppData } from "@/components/providers/app-data-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/field";
import { LoadingState } from "@/components/ui/loading-state";
import { SectionHeading } from "@/components/ui/section-heading";

const roleLabelMap = {
  owner: "拥有者",
  editor: "编辑者",
  viewer: "查看者",
};

const statusLabelMap = {
  active: "已加入",
  invited: "待接受",
};

export default function FamilyPage() {
  const { user } = useAuth();
  const {
    status,
    selectedBaby,
    selectedBabyMembers,
    incomingInvites,
    permissions,
    acceptBabyInvite,
    declineBabyInvite,
    updateBabyMemberRole,
    removeBabyMember,
  } = useAppData();
  const [sheetOpen, setSheetOpen] = useState(false);

  const memberSummary = useMemo(
    () => ({
      active: selectedBabyMembers.filter((member) => member.status === "active").length,
      invited: selectedBabyMembers.filter((member) => member.status === "invited").length,
    }),
    [selectedBabyMembers],
  );

  if (status === "loading" || status === "idle") {
    return <LoadingState label="正在整理家庭共享信息..." />;
  }

  const hasSharedContent = Boolean(selectedBaby);
  const hasIncomingInvites = incomingInvites.length > 0;

  if (!hasSharedContent && !hasIncomingInvites) {
    return (
      <EmptyState
        description="先创建一个宝宝档案，才能邀请另一位家长或家庭成员共享查看。"
        title="还没有可共享的宝宝档案"
      />
    );
  }

  return (
    <>
      <div className="space-y-6">
        <SectionHeading
          action={
            permissions.canManageMembers && selectedBaby ? (
              <Button onClick={() => setSheetOpen(true)} type="button">
                <MailPlus className="mr-2 h-4 w-4" />
                邀请成员
              </Button>
            ) : null
          }
          eyebrow="Family"
          description="现在支持收件箱式接受邀请、成员角色调整和拥有者侧共享管理。"
          title={selectedBaby ? `${selectedBaby.name} 的家庭共享` : "家庭共享收件箱"}
        />

        {incomingInvites.length > 0 ? (
          <section className="space-y-4">
            <SectionHeading
              description="收到邀请后需要你手动确认加入，这样共享范围和权限更清晰。"
              title="待处理邀请"
            />
            <div className="space-y-3">
              {incomingInvites.map(({ member, baby }) => (
                <Card
                  key={member.id}
                  className="bg-[linear-gradient(160deg,#fff4eb_0%,#ffffff_55%,#eef7f1_100%)]"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-black tracking-tight text-slate-900">
                          {baby?.name ? `${baby.name} 的共享邀请` : "新的宝宝档案共享邀请"}
                        </h3>
                        <Badge>{roleLabelMap[member.role]}</Badge>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        邀请邮箱：{member.inviteEmail}
                        {member.displayName ? ` · 预设称呼：${member.displayName}` : ""}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => void declineBabyInvite(member.id)}
                        type="button"
                        variant="secondary"
                      >
                        <X className="mr-2 h-4 w-4" />
                        稍后再说
                      </Button>
                      <Button onClick={() => void acceptBabyInvite(member.id)} type="button">
                        <Check className="mr-2 h-4 w-4" />
                        接受邀请
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        ) : null}

        {selectedBaby ? (
          <>
            <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <Card className="space-y-4 bg-[linear-gradient(160deg,#fff4eb_0%,#ffffff_55%,#eef7f1_100%)]">
                <div className="flex items-start gap-4">
                  <div className="rounded-[24px] bg-[#fff1e8] p-3 text-[#c97954]">
                    <UsersRound className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-slate-900">
                      家庭成员概览
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {permissions.canManageMembers
                        ? "你当前是档案拥有者，可以邀请成员、调整角色和移除共享权限。"
                        : permissions.canEditContent
                          ? "你当前以编辑者身份参与记录，可以新增和整理内容，但成员管理仍由拥有者处理。"
                          : "你当前以查看者身份加入这个档案，适合陪伴式浏览和回顾。"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <StatCard label="当前角色" value={roleLabelMap[permissions.role ?? "viewer"]} />
                  <StatCard label="已加入" value={`${memberSummary.active} 位`} />
                  <StatCard label="待接受" value={`${memberSummary.invited} 位`} />
                </div>

                <div className="rounded-[24px] bg-[#fff8f2] p-4 text-sm leading-6 text-slate-500">
                  当前共享策略：
                  <br />
                  1. 拥有者可邀请、调角色、移除成员。
                  <br />
                  2. 编辑者可维护记录、里程碑和成长数据。
                  <br />
                  3. 查看者保持只读，后续继续补通知和更细权限。
                </div>
              </Card>

              <Card className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-[18px] bg-[#eef6ff] p-2 text-[#5c7cab]">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-slate-900">
                      当前身份
                    </h3>
                    <p className="text-sm text-slate-500">
                      {user?.fullName || user?.email || "当前登录用户"}
                    </p>
                  </div>
                </div>
                <div className="rounded-[24px] border border-[#e8d7cb] bg-[#fffdf9] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {user?.fullName || "当前家长"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
                    </div>
                    <Badge
                      className={
                        permissions.role === "owner"
                          ? "bg-[#eef6ff] text-[#4e74a8]"
                          : permissions.role === "editor"
                            ? "bg-[#eef8f0] text-[#4d8a64]"
                            : "bg-[#fff3ea] text-[#a76446]"
                      }
                    >
                      {roleLabelMap[permissions.role ?? "viewer"]}
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>

            <section className="space-y-4">
              <SectionHeading title="共享成员列表" />
              {selectedBabyMembers.length > 0 ? (
                <div className="space-y-3">
                  {selectedBabyMembers.map((member) => (
                    <Card
                      key={member.id}
                      className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">
                            {member.displayName || member.inviteEmail}
                          </h3>
                          <Badge>{roleLabelMap[member.role]}</Badge>
                          <Badge
                            className={
                              member.status === "active"
                                ? "bg-[#eef8f0] text-[#4d8a64]"
                                : "bg-[#fff3ea] text-[#a76446]"
                            }
                          >
                            {statusLabelMap[member.status]}
                          </Badge>
                          {member.userId === user?.id ? <Badge>你</Badge> : null}
                        </div>
                        <p className="mt-2 text-sm text-slate-500">{member.inviteEmail}</p>
                      </div>

                      <div className="flex flex-col gap-3 md:min-w-[240px]">
                        {permissions.canManageMembers ? (
                          <Select
                            onChange={(event) => {
                              const nextRole = event.target.value as "editor" | "viewer";
                              if (nextRole === member.role) return;
                              void updateBabyMemberRole({
                                memberId: member.id,
                                role: nextRole,
                              });
                            }}
                            value={member.role === "owner" ? "editor" : member.role}
                          >
                            <option value="editor">编辑者</option>
                            <option value="viewer">查看者</option>
                          </Select>
                        ) : null}

                        {permissions.canManageMembers ? (
                          <Button
                            onClick={() => void removeBabyMember(member.id)}
                            type="button"
                            variant="danger"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            移除成员
                          </Button>
                        ) : null}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState
                  actionLabel={permissions.canManageMembers ? "邀请第一位成员" : undefined}
                  description="这里会展示和这个宝宝档案有关的共享成员、角色和邀请状态。"
                  onAction={permissions.canManageMembers ? () => setSheetOpen(true) : undefined}
                  title="还没有共享成员"
                />
              )}
            </section>
          </>
        ) : (
          <EmptyState
            description="接受上方邀请后，这里会出现你加入的宝宝档案成员信息。"
            title="还没有已加入的共享档案"
          />
        )}
      </div>

      <BabyMemberFormSheet
        babyId={selectedBaby?.id ?? null}
        onClose={() => setSheetOpen(false)}
        open={sheetOpen}
      />
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/70 bg-white/82 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">{value}</p>
    </div>
  );
}
