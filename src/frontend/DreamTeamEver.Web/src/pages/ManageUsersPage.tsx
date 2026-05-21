import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { useLocale } from "../i18n/LocaleProvider";
import {
  changeAdminUserRole,
  deleteAdminUser,
  fetchAdminMembers,
  type AdminMemberSummaryDto,
  type AdminUserRole,
} from "../api/authApi";
import "./admin-page.css";

type Role = "admin" | "student";

type MemberRow = {
  memberId: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  matriculeCode: string | null;
};

function memberInitials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function memberPaymentStatus(row: MemberRow): "active" | "unpaid" {
  return row.matriculeCode ? "active" : "unpaid";
}

export function ManageUsersPage() {
  const { user, logout, getAccessToken } = useAuth();
  const { t } = useLocale();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [message, setMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [manageRow, setManageRow] = useState<MemberRow | null>(null);

  const loadMembers = useCallback(async (): Promise<MemberRow[]> => {
    const token = await getAccessToken();
    if (!token) {
      throw new Error(t("errors.sessionExpired"));
    }

    const result = await fetchAdminMembers(token);
    if (!result.ok) {
      throw new Error(result.message ?? t("admin.users.loadFailed"));
    }

    return result.data.map((m: AdminMemberSummaryDto) => ({
      memberId: m.memberId,
      userId: m.userId,
      fullName: m.fullName,
      email: m.email,
      phone: m.phone,
      role: m.role === "Admin" ? "admin" : "student",
      matriculeCode: m.matriculeCode,
    }));
  }, [getAccessToken, t]);

  const membersQuery = useQuery<MemberRow[], Error>({
    queryKey: ["admin", "members"],
    queryFn: loadMembers,
  });

  const roleMutation = useMutation({
    mutationFn: async (payload: { userId: string; role: AdminUserRole }) => {
      const token = await getAccessToken();
      if (!token) throw new Error(t("errors.sessionExpired"));
      const result = await changeAdminUserRole(token, payload.userId, payload.role);
      if (!result.ok) throw new Error(result.message ?? t("admin.users.roleChangeFailed"));
      return payload;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "members"] });
      setMessage(t("admin.users.roleUpdated"));
      window.setTimeout(() => setMessage(null), 3000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const token = await getAccessToken();
      if (!token) throw new Error(t("errors.sessionExpired"));
      const result = await deleteAdminUser(token, userId);
      if (!result.ok) throw new Error(result.message ?? t("admin.users.deleteFailed"));
      return userId;
    },
    onSuccess: async (deletedUserId) => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "members"] });
      setManageRow(null);
      if (user?.id === deletedUserId) {
        void logout().then(() => navigate("/login", { replace: true }));
        return;
      }
      setMessage(t("admin.users.userDeleted"));
      window.setTimeout(() => setMessage(null), 3000);
    },
  });

  async function onRoleChange(row: MemberRow, nextRole: AdminUserRole) {
    const currentRole: AdminUserRole = row.role === "admin" ? "Admin" : "Member";
    if (currentRole === nextRole) return;

    const roleLabel = nextRole === "Admin" ? t("admin.users.roleAdmin") : t("admin.users.roleMember");
    if (!window.confirm(t("admin.users.roleConfirm", { name: row.fullName, role: roleLabel }))) return;
    try {
      await roleMutation.mutateAsync({ userId: row.userId, role: nextRole });
      setManageRow((prev) =>
        prev?.userId === row.userId
          ? { ...prev, role: nextRole === "Admin" ? "admin" : "student" }
          : prev,
      );
    } catch (err) {
      window.alert(err instanceof Error ? err.message : t("admin.users.roleChangeFailed"));
    }
  }

  async function onDelete(row: MemberRow) {
    if (!window.confirm(t("admin.users.deleteConfirm", { name: row.fullName, email: row.email }))) return;
    try {
      await deleteMutation.mutateAsync(row.userId);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : t("admin.users.deleteFailed"));
    }
  }

  const rows = membersQuery.data ?? [];
  const loading = membersQuery.isLoading;
  const error = membersQuery.error?.message ?? null;

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...rows].sort((a, b) =>
      a.fullName.localeCompare(b.fullName, undefined, { sensitivity: "base" }),
    );
    if (!q) return sorted;
    return sorted.filter((row) => {
      const haystack = `${row.fullName} ${row.email} ${row.matriculeCode ?? ""} ${row.phone}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [rows, query]);

  const dash = t("common.dash");

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{t("admin.users.title")}</h1>
          <p className="admin-page-lead">{t("admin.users.lead")}</p>
        </div>
        <div className="admin-page-toolbar">
          <input
            type="search"
            className="admin-page-search"
            placeholder={t("admin.users.searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={t("admin.users.searchPlaceholder")}
          />
          <Link
            to="/admin/payments"
            className="admin-page-payments-link"
            aria-label={t("admin.users.viewPayments")}
            title={t("admin.users.viewPayments")}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h7" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 14v6m-3-3h6" />
            </svg>
          </Link>
        </div>
      </header>

      {message ? (
        <p className="admin-page-alert admin-page-alert--success" role="status">
          {message}
        </p>
      ) : null}
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
                <th>{t("admin.users.colFullName")}</th>
                <th>{t("admin.users.colMatricule")}</th>
                <th>{t("admin.users.colRole")}</th>
                <th>{t("admin.users.colStatus")}</th>
                <th>{t("admin.users.colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="admin-page-empty">
                    {t("admin.users.loading")}
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-page-empty">
                    {t("admin.users.empty")}
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const status = memberPaymentStatus(row);
                  return (
                    <tr key={row.userId}>
                      <td>
                        <div className="admin-page-name-cell">
                          <span className="admin-page-avatar" aria-hidden>
                            {memberInitials(row.fullName)}
                          </span>
                          <div className="min-w-0">
                            <p className="admin-page-name">{row.fullName}</p>
                            <p className="admin-page-email">{row.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        {row.matriculeCode ? (
                          <span className="admin-page-matricule">{row.matriculeCode}</span>
                        ) : (
                          <span className="admin-page-matricule admin-page-matricule--empty">
                            {dash}
                          </span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`admin-page-badge ${
                            row.role === "admin"
                              ? "admin-page-badge--admin"
                              : "admin-page-badge--member"
                          }`}
                        >
                          {row.role === "admin"
                            ? t("admin.users.roleAdmin")
                            : t("admin.users.roleMember")}
                        </span>
                      </td>
                      <td>
                        <span
                          className={
                            status === "active"
                              ? "admin-page-status--active"
                              : "admin-page-status--unpaid"
                          }
                        >
                          {status === "active"
                            ? t("admin.users.statusActive")
                            : t("admin.users.statusUnpaid")}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="admin-page-manage"
                          onClick={() => setManageRow(row)}
                        >
                          {t("admin.users.manage")}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {manageRow ? (
        <div
          className="admin-page-modal-backdrop"
          role="presentation"
          onClick={() => setManageRow(null)}
        >
          <div
            className="admin-page-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-manage-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="admin-manage-title" className="admin-page-modal-title">
              {t("admin.users.manageTitle")}
            </h2>
            <p className="admin-page-modal-sub">
              {manageRow.fullName} · {manageRow.email}
            </p>
            <label className="admin-page-modal-field">
              <span>{t("admin.users.colRole")}</span>
              <select
                aria-label={t("admin.users.roleAria", { name: manageRow.fullName })}
                value={manageRow.role === "admin" ? "Admin" : "Member"}
                disabled={
                  roleMutation.isPending && roleMutation.variables?.userId === manageRow.userId
                }
                onChange={(e) => void onRoleChange(manageRow, e.target.value as AdminUserRole)}
              >
                <option value="Member">{t("admin.users.roleMember")}</option>
                <option value="Admin">{t("admin.users.roleAdmin")}</option>
              </select>
            </label>
            <div className="admin-page-modal-actions">
              <button
                type="button"
                className="admin-page-modal-btn"
                onClick={() => setManageRow(null)}
              >
                {t("admin.users.close")}
              </button>
              <button
                type="button"
                className="admin-page-modal-btn admin-page-modal-btn--danger"
                disabled={deleteMutation.isPending}
                onClick={() => void onDelete(manageRow)}
              >
                {t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
