"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useAppData } from "@/components/providers/app-data-provider";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import {
  FieldError,
  FieldLabel,
  Input,
  Select,
  Textarea,
} from "@/components/ui/field";
import { GROWTH_TYPES } from "@/lib/constants";
import type { GrowthMetric } from "@/lib/types";
import { growthMetricSchema } from "@/lib/validation";

type GrowthMetricFormValues = z.input<typeof growthMetricSchema>;

function toDateInput(value?: string) {
  return value ? value.slice(0, 10) : "";
}

export function GrowthFormSheet({
  open,
  onClose,
  babyId,
  metric,
}: {
  open: boolean;
  onClose: () => void;
  babyId: string | null;
  metric?: GrowthMetric | null;
}) {
  const { saveGrowthMetric } = useAppData();

  const form = useForm<GrowthMetricFormValues>({
    resolver: zodResolver(growthMetricSchema),
    defaultValues: {
      type: "height",
      value: 0,
      recordedOn: "",
      notes: "",
    },
  });

  useEffect(() => {
    form.reset({
      type: metric?.type ?? "height",
      value: metric?.value ?? 0,
      recordedOn: toDateInput(metric?.recordedOn),
      notes: metric?.notes ?? "",
    });
  }, [form, metric, open]);

  return (
    <Drawer
      description="记录宝宝的身高、体重和头围，用趋势图观察阶段变化。"
      onClose={onClose}
      open={open}
      title={metric ? "编辑成长数据" : "新增成长数据"}
    >
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          if (!babyId) return;
          await saveGrowthMetric({
            id: metric?.id,
            babyId,
            type: values.type,
            value: Number(values.value),
            recordedOn: new Date(values.recordedOn).toISOString(),
            notes: values.notes,
          });
          onClose();
        })}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <FieldLabel htmlFor="metric-type">类型</FieldLabel>
            <Select id="metric-type" {...form.register("type")}>
              {GROWTH_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <FieldLabel htmlFor="metric-recorded-on">记录日期</FieldLabel>
            <Input id="metric-recorded-on" type="date" {...form.register("recordedOn")} />
            {form.formState.errors.recordedOn ? (
              <FieldError>{form.formState.errors.recordedOn.message}</FieldError>
            ) : null}
          </div>
        </div>

        <div>
          <FieldLabel htmlFor="metric-value">数值</FieldLabel>
          <Input
            id="metric-value"
            inputMode="decimal"
            step="0.1"
            type="number"
            {...form.register("value", { valueAsNumber: true })}
          />
          {form.formState.errors.value ? (
            <FieldError>{form.formState.errors.value.message}</FieldError>
          ) : null}
        </div>

        <div>
          <FieldLabel htmlFor="metric-notes">备注</FieldLabel>
          <Textarea
            id="metric-notes"
            placeholder="例如：儿保检查 / 家里测量"
            {...form.register("notes")}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button fullWidth onClick={onClose} type="button" variant="secondary">
            取消
          </Button>
          <Button
            disabled={form.formState.isSubmitting || !babyId}
            fullWidth
            type="submit"
          >
            {form.formState.isSubmitting ? "保存中..." : "保存数据"}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
