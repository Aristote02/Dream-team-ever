import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { authInputClassName } from "../components/authInputClass";
import { AuthScreenLayout } from "../components/AuthScreenLayout";

type LoginValues = {
  email: string;
  password: string;
};

type LoginFieldErrors = Partial<Record<keyof LoginValues, string>>;

function validateLogin(values: LoginValues): LoginFieldErrors {
  const errors: LoginFieldErrors = {};
  const mail = values.email.trim();
  if (!mail) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  } else if (values.password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  return errors;
}

export function LoginPage() {
  const navigate = useNavigate();
  const { user, login, authReady } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authReady && user) navigate("/home", { replace: true });
  }, [user, authReady, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const nextErrors = validateLogin({ email, password });
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSubmitting(true);
    try {
      const result = await login(email, password);
      if (result === "ok") {
        navigate("/home", { replace: true });
      } else if (result === "invalid") {
        setError("Invalid email or password.");
      } else {
        setError("Could not reach the server. Is the API running?");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!authReady) {
    return (
      <AuthScreenLayout subtitle="Sign in to continue. Kinshasa · Estd 2026">
        <p className="text-center text-sm text-stone-500">Loading…</p>
      </AuthScreenLayout>
    );
  }

  return (
    <AuthScreenLayout subtitle="Sign in to continue. Kinshasa · Estd 2025">
      <form className="space-y-4 sm:space-y-5" onSubmit={onSubmit} noValidate>
        <div>
          <label htmlFor="login-email" className="mb-1.5 block text-left text-sm font-medium text-stone-700 dark:text-stone-300">
            Email
          </label>
          <input
            id="login-email"
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
        <div>
          <label htmlFor="login-password" className="mb-1.5 block text-left text-sm font-medium text-stone-700 dark:text-stone-300">
            Password
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) {
                setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }
            }}
            className={authInputClassName}
            placeholder="••••••••"
            required
          />
          {fieldErrors.password ? <p className="mt-1 text-xs text-red-700">{fieldErrors.password}</p> : null}
        </div>

        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-left text-sm text-red-800 ring-1 ring-red-200/80" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-gradient-to-b from-amber-500 to-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 disabled:opacity-60 sm:py-3"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-stone-500 sm:mt-8">
        <Link to="/register" className="font-medium text-amber-800 underline-offset-4 hover:text-amber-950 hover:underline dark:text-amber-300 dark:hover:text-amber-200">
          Create account
        </Link>
      </p>
    </AuthScreenLayout>
  );
}
