"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, UserCheck, UsersRound } from "lucide-react";

import { BabyMemberFormSheet } from "@/components/family/baby-member-form-sheet";
import { useAppData } from "@/components/providers/app-data-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
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
    removeBabyMember,
  } = useAppData();
  const [sheetOpen, setSheetOpen] = useState(false);

  const isOwner = selectedBaby?.userId === user?.id;
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

  if (!selectedBaby) {
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
            isOwner ? (
              <Button onClick={() => setSheetOpen(true)} type="button">
                <Plus className="mr-2 h-4 w-4" />
                邀请成员
              </Button>
            ) : null
          }
          eyebrow="Family"
          description="基础共享版支持维护家庭成员列表、角色和邀请状态；下一步再接邮件通知和更细权限。"
          title={`${selectedBaby.name} 的家庭共享`}
        />

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
                  {isOwner
                    ? "你当前是档案拥有者，可以维护共享成员和邀请状态。"
                    : "你当前通过家庭共享查看这个宝宝档案，成员管理仍由拥有者处理。"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <StatCard label="拥有者" value="1 位" />
              <StatCard label="已加入" value={`${memberSummary.active} 位`} />
              <StatCard label="待接受" value={`${memberSummary.invited} 位`} />
            </div>

            <div className="rounded-[24px] bg-[#fff8f2] p-4 text-sm leading-6 text-slate-500">
              当前共享策略：
              <br />
              1. 已接入共享成员数据结构和邀请记录。
              <br />
              2. 共享查看可作为正式版权限系统的基础。
              <br />
              3. TODO: 接受邀请、通知触达、编辑权限细化。
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-[18px] bg-[#eef6ff] p-2 text-[#5c7cab]">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight text-slate-900">拥有者</h3>
                <p className="text-sm text-slate-500">
                  {user?.fullName || user?.email || "当前登录用户"}
                </p>
              </div>
            </div>
            <div className="rounded-[24px] border border-[#e8d7cb] bg-[#fffdf9] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {isOwner ? user?.fullName || "当前家长" : "档案拥有者"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {isOwner
                      ? user?.email
                      : "当前基础版仅对拥有者显示完整资料，后续会补全成员资料映射。"}
                  </p>
                </div>
                <Badge className="bg-[#eef6ff] text-[#4e74a8]">拥有者</Badge>
              </div>
            </div>
          </Card>
        </div>

        <section className="space-y-4">
          <SectionHeading title="共享成员列表" />
          {selectedBabyMembers.length > 0 ? (
            <div className="space-y-3">
              {selectedBabyMembers.map((member) => (
                <Card key={member.id} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{member.inviteEmail}</p>
                  </div>

                  {isOwner ? (
                    <Button
                      onClick={() => void removeBabyMember(member.id)}
                      type="button"
                      variant="danger"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      移除
                    </Button>
                  ) : null}
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              actionLabel={isOwner ? "邀请第一位成员" : undefined}
              description="这里会展示和这个宝宝档案有关的共享成员、角色和邀请状态。"
              onAction={isOwner ? () => setSheetOpen(true) : undefined}
              title="还没有共享成员"
            />
          )}
        </section>
      </div>

      <BabyMemberFormSheet
        babyId={selectedBaby.id}
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
