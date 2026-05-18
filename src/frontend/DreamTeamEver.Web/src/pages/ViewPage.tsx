import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchCurrentMember, updateMyProfileRequest } from "../api/authApi";
import { useAuth } from "../auth/useAuth";
import { authInputClassName } from "../components/authInputClass";
import { useLocale } from "../i18n/LocaleProvider";

type MemberView = {
  fullName: string;
  phone: string;
  matriculeCode: string | null;
  matriculeIssuedAt: string | null;
  createdAt: string;
};

export function ViewPage() {
  const { user, getAccessToken, refreshSession } = useAuth();
  const { locale, t } = useLocale();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const profileQuery = useQuery<MemberView, Error>({
    queryKey: ["member", "profile", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) {
        throw new Error(t("errors.sessionExpired"));
      }
      const me = await fetchCurrentMember(token);
      if (!me.ok) throw new Error(t("view.loadFailed"));
      return me.data;
    },
  });

  useEffect(() => {
    const profile = profileQuery.data;
    if (!profile) return;
    setFullName(profile.fullName);
    setPhone(profile.phone);
  }, [profileQuery.data]);

  const updateMutation = useMutation({
    mutationFn: async ({ nextFullName, nextPhone }: { nextFullName: string; nextPhone: string }) => {
      const token = await getAccessToken();
      if (!token) throw new Error(t("errors.sessionExpired"));
      const updated = await updateMyProfileRequest(token, nextFullName, nextPhone);
      if (!updated.ok) throw new Error(updated.message ?? t("view.saveFailed"));
      return updated.data;
    },
    onSuccess: async (updatedProfile) => {
      queryClient.setQueryData(["member", "profile", user?.id], updatedProfile);
      setSaved(true);
      await refreshSession();
    },
  });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    if (!fullName.trim() || !phone.trim()) {
      setError(t("validation.fullNamePhoneRequired"));
      return;
    }

    try {
      await updateMutation.mutateAsync({ nextFullName: fullName, nextPhone: phone });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("view.saveFailed"));
    }
  }

  const model = profileQuery.data ?? null;
  const loading = profileQuery.isLoading;
  const saving = updateMutation.isPending;
  const queryError = profileQuery.error instanceof Error ? profileQuery.error.message : null;
  const effectiveError = error ?? queryError;
  const dash = t("common.dash");

  return (
    <div className="font-dream-sans -mx-6 -mt-2 text-left">
      <h1 className="font-dream-serif text-xl font-semibold text-stone-900 dark:text-white">{t("view.title")}</h1>
      <p className="mt-1 text-sm text-stone-500">{t("view.lead")}</p>

      {!user ? (
        <p className="mt-6 text-sm text-stone-600 dark:text-stone-300">
          <Link to="/login" className="font-medium text-amber-800 underline-offset-4 hover:underline dark:text-amber-300">
            {t("common.signIn")}
          </Link>{" "}
          {t("view.signInToManage")}
        </p>
      ) : loading ? (
        <p className="mt-6 text-sm text-stone-500">{t("view.loading")}</p>
      ) : (
        <>
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <label htmlFor="full-name" className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
                {t("common.fullName")}
              </label>
              <input
                id="full-name"
                name="fullName"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setSaved(false);
                }}
                className={authInputClassName}
                placeholder={t("view.fullNamePlaceholder")}
              />
            </div>

            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
                {t("view.phoneNumber")}
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setSaved(false);
                }}
                className={authInputClassName}
                placeholder={t("view.phonePlaceholder")}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">{t("view.matriculeCode")}</label>
              <input value={model?.matriculeCode ?? dash} readOnly className={`${authInputClassName} cursor-not-allowed opacity-80`} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">{t("view.matriculeIssuedAt")}</label>
              <input
                value={model?.matriculeIssuedAt ? new Date(model.matriculeIssuedAt).toLocaleString(locale) : dash}
                readOnly
                className={`${authInputClassName} cursor-not-allowed opacity-80`}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">{t("view.createdAt")}</label>
              <input value={model?.createdAt ? new Date(model.createdAt).toLocaleString(locale) : dash} readOnly className={`${authInputClassName} cursor-not-allowed opacity-80`} />
            </div>

            {effectiveError ? (
              <p className="text-sm text-red-700" role="alert">
                {effectiveError}
              </p>
            ) : null}
            {saved ? (
              <p className="text-sm text-emerald-700 dark:text-emerald-400" role="status">
                {t("view.updated")}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-gradient-to-b from-amber-500 to-amber-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 disabled:opacity-60"
            >
              {saving ? t("view.saving") : t("view.saveChanges")}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-stone-500">
            <Link to="/home" className="font-medium text-amber-800 underline-offset-4 hover:underline dark:text-amber-300">
              {t("common.backToWallet")}
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
