"use client";

import { Bell, Bot, BookHeart, Users } from "lucide-react";

import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";

const placeholderItems = [
  {
    icon: Users,
    title: "家庭共享升级",
    description:
      "已落地基础共享成员管理，TODO: 继续补邮件邀请、接受邀请流程，以及更细的 owner / editor / viewer 权限能力。",
  },
  {
    icon: Bot,
    title: "AI 成长周报",
    description:
      "TODO: 根据本周文字、图片和视频自动生成成长总结，还可以扩展 AI 自动打标签和成长年册。",
  },
  {
    icon: Bell,
    title: "提醒中心",
    description:
      "TODO: 预留疫苗、体检、生日、重要纪念日提醒，MVP 先保留入口和数据结构扩展位。",
  },
  {
    icon: BookHeart,
    title: "成长年册导出",
    description:
      "TODO: 后续可按月份或年度整理精选记录，输出为可分享或可打印的回忆册。",
  },
];

export default function FuturePage() {
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Roadmap"
        description="这里集中放后续扩展项的占位卡片和 TODO，方便从 MVP 平滑演进成正式产品。"
        title="未来功能预留"
      />

      <div className="grid gap-4 md:grid-cols-2">
        {placeholderItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="border-dashed border-[#ead6ca] bg-white/74">
              <div className="flex items-start gap-4">
                <div className="rounded-[18px] bg-[#fff1e8] p-3 text-[#c97954]">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {item.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
