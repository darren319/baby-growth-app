import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { LoadingState } from "@/components/ui/loading-state";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingState label="正在准备登录页..." />}>
      <LoginForm />
    </Suspense>
  );
}
