import type { Metadata } from "next";
import { Suspense } from "react";

import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Ricemania account to order and track deliveries.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-cream" />}>
      <LoginForm />
    </Suspense>
  );
}
