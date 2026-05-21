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
import "./admin-page.css";

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

function paymentStatusClass(status: string): string {
  switch (status) {
    case "Completed":
      return "admin-page-status-badge--completed";
    case "Pending":
      return "admin-page-status-badge--pending";
    case "Cancelled":
      return "admin-page-status-badge--cancelled";
    default:
      return "admin-page-status-badge--failed";
  }
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
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{t("admin.payments.title")}</h1>
          <p className="admin-page-lead">{rangeText}</p>
        </div>
        <Link to="/students" className="admin-page-back-btn">
          {t("admin.payments.back")}
        </Link>
      </header>

      {error ? (
        <p className="admin-page-alert admin-page-alert--error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="admin-page-panel">
        <div className="admin-page-table-wrap">
          <table className="admin-page-table">
            <thead>
              <tr>
                <th>{t("admin.payments.colCreated")}</th>
                <th>{t("admin.payments.colMember")}</th>
                <th>{t("admin.payments.colMethod")}</th>
                <th>{t("admin.payments.colAmount")}</th>
                <th>{t("admin.payments.colStatus")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="admin-page-empty">
                    {t("admin.payments.loading")}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-page-empty">
                    {t("admin.payments.empty")}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td>{formatDate(row.createdAt, locale, dash)}</td>
                    <td className="admin-page-cell-strong">{row.memberFullName ?? dash}</td>
                    <td>{row.method}</td>
                    <td className="admin-page-cell-strong">
                      {formatAmount(row.amount, row.currency, locale)}
                    </td>
                    <td>
                      <span
                        className={`admin-page-status-badge ${paymentStatusClass(row.status)}`}
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
      </div>

      <div className="admin-page-pagination">
        <button
          type="button"
          className="admin-page-pagination-btn"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1 || loading}
        >
          {t("common.previous")}
        </button>
        <p className="admin-page-pagination-info">
          {t("admin.payments.pageOf", { page, total: totalPages })}
        </p>
        <button
          type="button"
          className="admin-page-pagination-btn"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages || loading}
        >
          {t("common.next")}
        </button>
      </div>
    </div>
  );
}
