"use client";

import { useMemo, useState } from "react";
import {
  BellRing,
  Check,
  Copy,
  Download,
  ExternalLink,
  Link2,
  MailPlus,
  Trash2,
  UserCheck,
  UsersRound,
  X,
} from "lucide-react";

import { BabyMemberFormSheet } from "@/components/family/baby-member-form-sheet";
import { useAppData } from "@/components/providers/app-data-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/field";
import { LoadingState } from "@/components/ui/loading-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { APK_DOWNLOAD_URL, PUBLIC_SITE_URL } from "@/lib/constants";
import type { BabyMember } from "@/lib/types";

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
  const { showToast } = useToast();
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

  const collaborationAlerts = useMemo(() => {
    const alerts: Array<{ title: string; description: string }> = [];

    if (incomingInvites.length > 0) {
      alerts.push({
        title: `有 ${incomingInvites.length} 条邀请待处理`,
        description: "登录当前邮箱后确认加入，就能立即进入对应宝宝档案开始协作。",
      });
    }

    if (selectedBaby && permissions.canManageMembers && memberSummary.invited > 0) {
      alerts.push({
        title: `${memberSummary.invited} 位成员还在等待确认`,
        description: "可以复制邀请链接发给家人，减少他们找入口和重复注册的步骤。",
      });
    }

    if (selectedBaby && memberSummary.active > 1) {
      alerts.push({
        title: `${memberSummary.active} 位家庭成员正在共同记录`,
        description: "当前档案已经进入协作模式，适合一起整理相册、里程碑和成长数据。",
      });
    }

    if (selectedBaby && permissions.role === "viewer") {
      alerts.push({
        title: "你当前是只读成员",
        description: "如果需要补充记录或上传照片，可以请拥有者把你调整为编辑者。",
      });
    }

    return alerts;
  }, [incomingInvites.length, memberSummary.active, memberSummary.invited, permissions, selectedBaby]);

  const copyToClipboard = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(message, "success");
    } catch {
      showToast("复制失败，请稍后重试", "error");
    }
  };

  const buildFamilyLink = (member?: BabyMember) => {
    const url = new URL("/family", PUBLIC_SITE_URL);
    if (selectedBaby?.id) {
      url.searchParams.set("baby", selectedBaby.id);
    }
    if (member) {
      url.searchParams.set("invite", member.id);
    }
    return url.toString();
  };

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
                  3. 查看者保持只读，邀请链接和协作提醒已开放。
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

                <div className="rounded-[24px] border border-dashed border-[#e8d7cb] bg-[#fff8f2] p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-[18px] bg-white p-2 text-[#c97954]">
                      <Link2 className="h-5 w-5" />
                    </div>
                    <div className="w-full">
                      <h4 className="text-base font-bold text-slate-900">分享入口</h4>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        可以直接把家庭页链接或 APK 下载链接发给家人，减少他们找入口的成本。
                      </p>
                      <div className="mt-3 grid gap-3">
                        <Button
                          onClick={() =>
                            void copyToClipboard(buildFamilyLink(), "家庭共享入口已复制")
                          }
                          type="button"
                          variant="secondary"
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          复制家庭页链接
                        </Button>
                        <Button
                          onClick={() => window.open(APK_DOWNLOAD_URL, "_blank", "noopener,noreferrer")}
                          type="button"
                          variant="secondary"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          打开 APK 下载页
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {collaborationAlerts.length > 0 ? (
              <section className="space-y-4">
                <SectionHeading
                  description="这里会集中显示需要你处理的共享动作和最近的协作状态。"
                  title="协作提醒"
                />
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {collaborationAlerts.map((item) => (
                    <Card
                      key={item.title}
                      className="bg-[linear-gradient(160deg,#fff7f0_0%,#ffffff_48%,#f3f9f4_100%)]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-[16px] bg-white p-2 text-[#c97954] shadow-sm">
                          <BellRing className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            ) : null}

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
                        {permissions.canManageMembers && member.status === "invited" ? (
                          <Button
                            onClick={() =>
                              void copyToClipboard(
                                buildFamilyLink(member),
                                "邀请链接已复制",
                              )
                            }
                            type="button"
                            variant="secondary"
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            复制邀请链接
                          </Button>
                        ) : null}

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

                        {!permissions.canManageMembers && member.status === "invited" ? (
                          <Button
                            onClick={() =>
                              window.open(buildFamilyLink(member), "_blank", "noopener,noreferrer")
                            }
                            type="button"
                            variant="secondary"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            打开邀请页
                          </Button>
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
