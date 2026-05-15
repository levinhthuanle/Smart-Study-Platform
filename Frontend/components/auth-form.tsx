"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail } from "lucide-react";

import { authApi } from "@/lib/api";

type AuthMode = "login" | "register";

interface AuthFormProps {
  mode: AuthMode;
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegister = mode === "register";
  const title = isRegister ? "Create your account" : "Welcome back";
  const subtitle = isRegister
    ? "Start a calm workspace for tasks, notes, and realtime chat."
    : "Sign in to continue into your workspace.";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload = isRegister
        ? await authApi.register(email, password, confirmPassword)
        : await authApi.login(email, password);

      if (typeof window !== "undefined") {
        window.localStorage.setItem("smart-study-access-token", payload.access_token);
        window.localStorage.setItem("smart-study-refresh-token", payload.refresh_token);
      }

      router.push("/dashboard");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="panel animate-rise">
      <div className="mb-8 space-y-3">
        <p className="muted-label">{isRegister ? "Create account" : "Sign in"}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-ink">{title}</h1>
        <p className="text-sm leading-7 text-slate-600">{subtitle}</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 focus-within:border-teal-700">
            <Mail className="size-4 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 focus-within:border-teal-700">
            <Lock className="size-4 text-slate-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
        </label>

        {isRegister ? (
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Confirm password</span>
            <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 focus-within:border-teal-700">
              <Lock className="size-4 text-slate-400" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repeat your password"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>
          </label>
        ) : null}

        {error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button type="submit" className="primary-button w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Please wait
            </>
          ) : isRegister ? (
            "Create account"
          ) : (
            "Sign in"
          )}
        </button>
      </form>
    </div>
  );
}
