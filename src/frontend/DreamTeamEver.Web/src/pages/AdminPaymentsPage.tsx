import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  fetchAdminPaymentsPaged,
  type PaymentTransactionDto,
} from "../api/authApi";
import { useAuth } from "../auth/useAuth";
import { useLocale } from "../i18n/LocaleProvider";
import { paymentStatusLabel } from "../i18n/paymentStatusLabel";

const PAGE_SIZE = 25;

function formatAmount(amount: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value: string | null, locale: string, dash: string): string {
  if (!value) return dash;
  return new Date(value).toLocaleString(locale);
}

export function AdminPaymentsPage() {
  const { getAccessToken } = useAuth();
  const { locale, t } = useLocale();
  const [page, setPage] = useState(1);
  const paymentsQuery = useQuery({
    queryKey: ["admin", "payments", page, PAGE_SIZE],
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) throw new Error(t("errors.sessionExpired"));
      const result = await fetchAdminPaymentsPaged(token, page, PAGE_SIZE);
      if (!result.ok) throw new Error(result.message ?? t("admin.payments.loadFailed"));
      return result.data;
    },
    placeholderData: (prev) => prev,
  });

  const rows: PaymentTransactionDto[] = paymentsQuery.data?.items ?? [];
  const totalCount = paymentsQuery.data?.totalCount ?? 0;
  const totalPages = Math.max(1, paymentsQuery.data?.totalPages ?? 1);
  const loading = paymentsQuery.isLoading;
  const error = paymentsQuery.error instanceof Error ? paymentsQuery.error.message : null;

  const rangeText = useMemo(() => {
    if (totalCount === 0) return t("admin.payments.rangeZero");
    const start = (page - 1) * PAGE_SIZE + 1;
    const end = Math.min(page * PAGE_SIZE, totalCount);
    return t("admin.payments.range", { start, end, total: totalCount });
  }, [page, totalCount, t]);

  const dash = t("common.dash");
  return (
    <div className="font-dream-sans relative left-1/2 -ml-[50vw] w-screen max-w-[1200px] px-4 pt-2 text-left sm:-ml-[min(50vw,600px)] sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-dream-serif text-2xl font-semibold leading-tight text-stone-900 sm:text-3xl dark:text-white">
            {t("admin.payments.title")}
          </h1>
          <p className="mt-1 text-sm text-stone-500">{rangeText}</p>
        </div>
        <Link
          to="/students"
          className="inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200 dark:hover:bg-stone-900"
        >
          {t("admin.payments.back")}
        </Link>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 ring-1 ring-red-200/80 dark:bg-red-950/30 dark:text-red-200 dark:ring-red-900/40" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-4 overflow-x-auto rounded-2xl border border-stone-200/80 bg-white shadow-sm ring-1 ring-stone-100 dark:border-stone-800 dark:bg-stone-950 dark:ring-stone-900">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 dark:border-stone-800 dark:bg-stone-900/50 dark:text-stone-400">
              <th className="px-3 py-2 font-medium">{t("admin.payments.colCreated")}</th>
              <th className="px-3 py-2 font-medium">{t("admin.payments.colMember")}</th>
              <th className="px-3 py-2 font-medium">{t("admin.payments.colMethod")}</th>
              <th className="px-3 py-2 font-medium">{t("admin.payments.colAmount")}</th>
              <th className="px-3 py-2 font-medium">{t("admin.payments.colStatus")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-3 py-6 text-center text-sm text-stone-500" colSpan={5}>
                  {t("admin.payments.loading")}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-center text-sm text-stone-500" colSpan={5}>
                  {t("admin.payments.empty")}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-stone-100 last:border-0 dark:border-stone-800">
                  <td className="px-3 py-2 text-stone-700 dark:text-stone-300">{formatDate(row.createdAt, locale, dash)}</td>
                  <td className="px-3 py-2 text-stone-700 dark:text-stone-300">{row.memberFullName ?? dash}</td>
                  <td className="px-3 py-2 text-stone-800 dark:text-stone-200">{row.method}</td>
                  <td className="px-3 py-2 font-semibold text-stone-800 dark:text-stone-200">{formatAmount(row.amount, row.currency, locale)}</td>
                  <td className="px-3 py-2">
                    <span
                      className={
                        row.status === "Completed"
                          ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
                          : row.status === "Pending"
                            ? "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950/50 dark:text-amber-200"
                            : "rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-800 dark:bg-rose-950/50 dark:text-rose-200"
                      }
                    >
                      {paymentStatusLabel(t, row.status)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1 || loading}
        >
          {t("common.previous")}
        </button>
        <p className="text-sm text-stone-500">
          {t("admin.payments.pageOf", { page, total: totalPages })}
        </p>
        <button
          type="button"
          className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages || loading}
        >
          {t("common.next")}
        </button>
      </div>
    </div>
  );
}
