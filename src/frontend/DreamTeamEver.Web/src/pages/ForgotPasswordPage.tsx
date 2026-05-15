import { useEffect, useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { forgotPasswordRequest, resetPasswordRequest } from "../api/authApi";
import { authInputClassName } from "../components/authInputClass";
import { AuthScreenLayout } from "../components/AuthScreenLayout";

type ResetValues = {
  email: string;
  newPassword: string;
  confirmPassword: string;
};

type ResetFieldErrors = Partial<Record<keyof ResetValues, string>>;

function validateReset(values: ResetValues): ResetFieldErrors {
  const errors: ResetFieldErrors = {};
  const email = values.email.trim();

  if (!email) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.newPassword) {
    errors.newPassword = "New password is required.";
  } else if (values.newPassword.length < 6) {
    errors.newPassword = "Password must be at least 6 characters.";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (values.confirmPassword !== values.newPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

function validateEmailOnly(email: string): string | undefined {
  const trimmed = email.trim();
  if (!trimmed) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "Please enter a valid email address.";
  return undefined;
}

export function ForgotPasswordPage() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token")?.trim() ?? "";
  const emailFromUrl = searchParams.get("email")?.trim() ?? "";
  const hasResetLink = Boolean(tokenFromUrl && emailFromUrl);

  const [email, setEmail] = useState(emailFromUrl);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ResetFieldErrors>({});
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestDone, setRequestDone] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  useEffect(() => {
    if (emailFromUrl) setEmail(emailFromUrl);
  }, [emailFromUrl]);

  const forgotMutation = useMutation({
    mutationFn: async (mail: string) => {
      const result = await forgotPasswordRequest(mail);
      if (!result.ok) {
        throw new Error(result.message ?? "Could not request reset email.");
      }
    },
    onSuccess: () => {
      setRequestDone(true);
    },
  });

  const resetMutation = useMutation({
    mutationFn: async (payload: { mail: string; code: string; password: string }) => {
      const result = await resetPasswordRequest(payload.mail, payload.code, payload.password);
      if (!result.ok) {
        throw new Error(result.message ?? "Could not reset your password.");
      }
    },
    onSuccess: () => {
      setResetDone(true);
      setNewPassword("");
      setConfirmPassword("");
    },
  });

  async function onRequestReset(e: FormEvent) {
    e.preventDefault();
    setRequestError(null);
    setResetDone(false);
    setRequestDone(false);

    const emailError = validateEmailOnly(email);
    if (emailError) {
      setFieldErrors({ email: emailError });
      return;
    }

    try {
      await forgotMutation.mutateAsync(email);
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : "Could not request reset email.");
    }
  }

  async function onResetPassword(e: FormEvent) {
    e.preventDefault();
    setRequestError(null);
    setResetDone(false);

    if (!tokenFromUrl) {
      setRequestError("Invalid or missing reset link. Please request a new password reset email.");
      return;
    }

    const nextErrors = validateReset({ email, newPassword, confirmPassword });
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await resetMutation.mutateAsync({
        mail: email,
        code: tokenFromUrl,
        password: newPassword,
      });
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : "Could not reset your password.");
    }
  }

  return (
    <AuthScreenLayout subtitle="Reset your password.">
      <div className="space-y-6">
        {!hasResetLink ? (
          <form className="space-y-4 sm:space-y-5" onSubmit={onRequestReset} noValidate>
            <div>
              <label htmlFor="forgot-email" className="mb-1.5 block text-left text-sm font-medium text-stone-700 dark:text-stone-300">
                Email
              </label>
              <input
                id="forgot-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                className={authInputClassName}
                placeholder="you@example.com"
                required
              />
              {fieldErrors.email ? <p className="mt-1 text-xs text-red-700">{fieldErrors.email}</p> : null}
            </div>

            <button
              type="submit"
              disabled={forgotMutation.isPending}
              className="w-full rounded-lg bg-gradient-to-b from-amber-500 to-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 disabled:opacity-60 sm:py-3"
            >
              {forgotMutation.isPending ? "Requesting…" : "Request reset email"}
            </button>
          </form>
        ) : null}

        {requestDone && !hasResetLink ? (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-left text-sm text-emerald-800 ring-1 ring-emerald-200/80" role="status">
            If this email exists, a reset link was sent. Check your inbox.
          </p>
        ) : null}

        {hasResetLink ? (
          <form className="space-y-4 sm:space-y-5" onSubmit={onResetPassword} noValidate>
            <p className="text-left text-sm text-stone-600 dark:text-stone-300">
              Set a new password for <span className="font-medium text-stone-800 dark:text-stone-100">{email}</span>.
            </p>

            <div>
              <label htmlFor="reset-new-password" className="mb-1.5 block text-left text-sm font-medium text-stone-700 dark:text-stone-300">
                New password
              </label>
              <input
                id="reset-new-password"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (fieldErrors.newPassword) {
                    setFieldErrors((prev) => ({ ...prev, newPassword: undefined }));
                  }
                }}
                className={authInputClassName}
                placeholder="••••••••"
                required
              />
              {fieldErrors.newPassword ? <p className="mt-1 text-xs text-red-700">{fieldErrors.newPassword}</p> : null}
            </div>

            <div>
              <label htmlFor="reset-confirm-password" className="mb-1.5 block text-left text-sm font-medium text-stone-700 dark:text-stone-300">
                Confirm password
              </label>
              <input
                id="reset-confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) {
                    setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }
                }}
                className={authInputClassName}
                placeholder="••••••••"
                required
              />
              {fieldErrors.confirmPassword ? <p className="mt-1 text-xs text-red-700">{fieldErrors.confirmPassword}</p> : null}
            </div>

            <button
              type="submit"
              disabled={resetMutation.isPending}
              className="w-full rounded-lg bg-gradient-to-b from-amber-500 to-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 disabled:opacity-60 sm:py-3"
            >
              {resetMutation.isPending ? "Resetting…" : "Reset password"}
            </button>
          </form>
        ) : null}

        {requestError ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-left text-sm text-red-800 ring-1 ring-red-200/80" role="alert">
            {requestError}
          </p>
        ) : null}

        {resetDone ? (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-left text-sm text-emerald-800 ring-1 ring-emerald-200/80" role="status">
            Password reset successful. You can now sign in with your new password.
          </p>
        ) : null}

        <p className="text-center text-sm text-stone-500">
          <Link to="/login" className="font-medium text-amber-800 underline-offset-4 hover:text-amber-950 hover:underline dark:text-amber-300 dark:hover:text-amber-200">
            Back to sign in
          </Link>
        </p>
      </div>
    </AuthScreenLayout>
  );
}
