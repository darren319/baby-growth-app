"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldError, FieldHint, FieldLabel, Input } from "@/components/ui/field";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";
import { authSchema } from "@/lib/validation";

type AuthFormValues = z.input<typeof authSchema>;

export function LoginForm() {
  const { signIn, signUp, signInWithGoogle, isMockMode, status } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [googleLoading, setGoogleLoading] = useState(false);

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
    },
  });

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(searchParams.get("next") ?? "/dashboard");
    }
  }, [router, searchParams, status]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6">
      <div className="grid w-full gap-6 lg:grid-cols-[1.04fr_0.96fr]">
        <Card className="relative overflow-hidden bg-[linear-gradient(155deg,#fff4eb_0%,#fffdf8_48%,#eef7f1_100%)] p-8 sm:p-10">
          <div className="pointer-events-none absolute -right-16 top-8 h-48 w-48 rounded-full bg-[#f6b58e]/30 blur-3xl" />
          <div className="pointer-events-none absolute -left-10 bottom-0 h-44 w-44 rounded-full bg-[#b8dbc1]/30 blur-3xl" />

          <div className="relative max-w-xl">
            <span className="inline-flex rounded-full bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#c67b55]">
              Warm Family Memory
            </span>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              {APP_NAME}
            </h1>
            <p className="mt-4 max-w-lg text-base leading-8 text-slate-600">
              {APP_DESCRIPTION}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "记录每天的文字、图片和视频",
                "宝宝里程碑和第一次都能回看",
                "成长数据趋势图适合手机查看",
                "后续可扩展家庭共享、AI 周报、提醒",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[24px] border border-white/70 bg-white/75 p-4 text-sm leading-7 text-slate-600 shadow-[0_18px_42px_rgba(244,180,145,0.1)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                {mode === "sign-in" ? "欢迎回来" : "创建家庭空间"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {mode === "sign-in"
                  ? "登录后即可进入宝宝成长主页。"
                  : "先开通你的家长账号，后面可以继续扩展 Google 登录。"}
              </p>
            </div>
            <span className="rounded-full bg-[#fff3ea] px-3 py-1 text-xs font-semibold text-[#aa6d4b]">
              {isMockMode ? "演示模式" : "Supabase 模式"}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2 rounded-[24px] bg-[#fff6ef] p-1.5">
            <button
              className={`rounded-[18px] px-4 py-3 text-sm font-semibold transition ${
                mode === "sign-in"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500"
              }`}
              onClick={() => setMode("sign-in")}
              type="button"
            >
              登录
            </button>
            <button
              className={`rounded-[18px] px-4 py-3 text-sm font-semibold transition ${
                mode === "sign-up"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500"
              }`}
              onClick={() => setMode("sign-up")}
              type="button"
            >
              注册
            </button>
          </div>

          <form
            className="mt-6 space-y-4"
            onSubmit={form.handleSubmit(async (values) => {
              try {
                if (mode === "sign-in") {
                  await signIn(values);
                  showToast("登录成功", "success");
                } else {
                  await signUp(values);
                  showToast("账号创建成功", "success");
                }
                router.replace(searchParams.get("next") ?? "/dashboard");
              } catch (error) {
                showToast(
                  error instanceof Error ? error.message : "认证失败，请稍后再试",
                  "error",
                );
              }
            })}
          >
            {mode === "sign-up" ? (
              <div>
                <FieldLabel htmlFor="full-name">家长称呼</FieldLabel>
                <Input
                  id="full-name"
                  placeholder="例如：妈妈 / 爸爸 / Alex"
                  {...form.register("fullName")}
                />
                {form.formState.errors.fullName ? (
                  <FieldError>{form.formState.errors.fullName.message}</FieldError>
                ) : null}
              </div>
            ) : null}

            <div>
              <FieldLabel htmlFor="email">邮箱</FieldLabel>
              <Input
                autoComplete="email"
                id="email"
                placeholder="name@example.com"
                {...form.register("email")}
              />
              {form.formState.errors.email ? (
                <FieldError>{form.formState.errors.email.message}</FieldError>
              ) : null}
            </div>

            <div>
              <FieldLabel htmlFor="password">密码</FieldLabel>
              <Input
                autoComplete={
                  mode === "sign-in" ? "current-password" : "new-password"
                }
                id="password"
                placeholder="至少 6 位"
                type="password"
                {...form.register("password")}
              />
              {form.formState.errors.password ? (
                <FieldError>{form.formState.errors.password.message}</FieldError>
              ) : null}
            </div>

            <FieldHint>
              {isMockMode
                ? "当前没有配置 Supabase，会使用本地演示账号和示例数据，方便你立即预览。"
                : "已启用 Supabase Auth，邮箱登录和注册会写入真实认证系统。"}
            </FieldHint>

            <Button className="mt-2" disabled={form.formState.isSubmitting} fullWidth type="submit">
              {form.formState.isSubmitting
                ? mode === "sign-in"
                  ? "登录中..."
                  : "创建中..."
                : mode === "sign-in"
                  ? "登录并进入"
                  : "注册并开始记录"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 rounded-[24px] border border-dashed border-[#ead7ca] bg-[#fffaf6] p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-[#fff1e8] p-2 text-[#c97954]">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Google 登录</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {isMockMode
                    ? "演示模式下会直接进入一个 Google 模拟家长账号。"
                    : "在 Supabase 控制台开启 Google Provider 后，这里会直接跳转 OAuth 登录。"}
                </p>
                <Button
                  className="mt-3"
                  disabled={googleLoading}
                  onClick={async () => {
                    try {
                      setGoogleLoading(true);
                      await signInWithGoogle();
                      if (isMockMode) {
                        showToast("已使用 Google 演示账号登录", "success");
                        router.replace(searchParams.get("next") ?? "/dashboard");
                      } else {
                        showToast("正在跳转到 Google 登录...", "info");
                      }
                    } catch (error) {
                      showToast(
                        error instanceof Error ? error.message : "Google 登录暂时不可用",
                        "error",
                      );
                    } finally {
                      setGoogleLoading(false);
                    }
                  }}
                  type="button"
                  variant="secondary"
                >
                  {googleLoading ? "跳转中..." : "使用 Google 继续"}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
