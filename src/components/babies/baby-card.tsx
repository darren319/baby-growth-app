import { Cake, NotebookPen, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Baby } from "@/lib/types";
import { calculateAgeLabel, cn, formatDate } from "@/lib/utils";

const genderLabelMap = {
  female: "女孩",
  male: "男孩",
  other: "其他",
  unspecified: "未填写",
};

export function BabyCard({
  baby,
  active,
  onSelect,
  onEdit,
}: {
  baby: Baby;
  active?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
}) {
  return (
    <Card
      className={cn(
        "flex flex-col gap-4 transition",
        active && "border-[#f0b698] shadow-[0_24px_60px_rgba(244,165,117,0.22)]",
      )}
    >
      <div className="flex items-start gap-4">
        <div className="h-18 w-18 overflow-hidden rounded-[26px] bg-[#fff1e8]">
          {baby.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={baby.name}
              className="h-full w-full object-cover"
              src={baby.avatarUrl}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#c87c57]">
              <UserRound className="h-8 w-8" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-xl font-black tracking-tight text-slate-900">
              {baby.name}
            </h3>
            <Badge>{genderLabelMap[baby.gender]}</Badge>
          </div>
          {baby.nickname ? (
            <p className="mt-1 text-sm text-slate-500">昵称：{baby.nickname}</p>
          ) : null}
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2">
              <Cake className="h-4 w-4 text-[#d28a63]" />
              {formatDate(baby.birthDate)}
            </span>
            <span className="inline-flex items-center gap-2">
              <NotebookPen className="h-4 w-4 text-[#d28a63]" />
              {calculateAgeLabel(baby.birthDate)}
            </span>
          </div>
        </div>
      </div>

      {baby.notes ? (
        <p className="rounded-2xl bg-[#fff8f2] px-3 py-3 text-sm leading-6 text-slate-600">
          {baby.notes}
        </p>
      ) : null}

      <div className="flex gap-2">
        {onSelect ? (
          <Button fullWidth onClick={onSelect} type="button" variant="secondary">
            {active ? "当前查看中" : "切换查看"}
          </Button>
        ) : null}
        {onEdit ? (
          <Button fullWidth onClick={onEdit} type="button">
            编辑档案
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
