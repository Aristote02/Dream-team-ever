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

export function ManageUsersPage() {
  const { user, logout, getAccessToken } = useAuth();
  const { t } = useLocale();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [message, setMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    matricule: "",
    phone: "",
  });

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


    const roleLabel = nextRole === "Admin" ? t("common.admin") : t("common.student");
    if (!window.confirm(t("admin.users.roleConfirm", { name: row.fullName, role: roleLabel }))) return;
    try {
      await roleMutation.mutateAsync({ userId: row.userId, role: nextRole });
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

  const sortedRows = useMemo(
    () =>
      [...rows].sort((a, b) =>
        a.fullName.localeCompare(b.fullName, undefined, {
          sensitivity: "base",
        }),
      ),
    [rows],
  );

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const name = filters.name.trim().toLowerCase();
    const email = filters.email.trim().toLowerCase();
    const matricule = filters.matricule.trim().toLowerCase();
    const phone = filters.phone.trim().toLowerCase();

    return sortedRows.filter((row) => {
      if (q) {
        const haystack = `${row.fullName} ${row.email} ${row.matriculeCode ?? ""} ${row.phone}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (name && !row.fullName.toLowerCase().includes(name)) return false;
      if (email && !row.email.toLowerCase().includes(email)) return false;
      if (matricule && !(row.matriculeCode ?? "").toLowerCase().includes(matricule)) return false;
      if (phone && !row.phone.toLowerCase().includes(phone)) return false;
      return true;
    });
  }, [sortedRows, filters, query]);

  const studentCount = useMemo(() => rows.filter((r) => r.role === "student").length, [rows]);

  return (
    <div className="font-dream-sans relative left-1/2 -ml-[50vw] w-screen max-w-[1200px] px-4 pt-2 text-left sm:-ml-[min(50vw,600px)] sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-dream-serif text-2xl font-semibold leading-tight text-stone-900 sm:text-3xl dark:text-white">{t("admin.users.title")}</h1>
          <p className="mt-1 text-sm text-stone-500">{t("admin.users.lead")}</p>
        </div>
        <div className="rounded-2xl border border-stone-200/80 bg-white px-4 py-3 shadow-sm ring-1 ring-stone-100 sm:min-w-[200px] dark:border-stone-800 dark:bg-stone-950 dark:ring-stone-900">
          <p className="text-xs uppercase tracking-wide text-stone-500">{t("admin.users.students")}</p>
          <p className="mt-1 text-3xl font-semibold text-stone-900 dark:text-white">{studentCount}</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-stone-200/80 bg-white p-3 shadow-sm ring-1 ring-stone-100 sm:p-4 dark:border-stone-800 dark:bg-stone-950 dark:ring-stone-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <input
              className="w-full rounded-xl border border-stone-200 bg-stone-50/70 px-3 py-2 text-sm text-stone-900 outline-none focus:border-amber-500 dark:border-stone-700 dark:bg-stone-900/50 dark:text-stone-100"
              placeholder={t("admin.users.searchPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
            onClick={() => setShowFilters((v) => !v)}
          >
            {showFilters ? t("common.hideFilters") : t("common.filter")}
          </button>
        </div>

        {showFilters ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-xs font-medium text-stone-600 dark:text-stone-400">
              {t("admin.users.colName")}
              <input
                className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-amber-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                placeholder={t("admin.users.filterByName")}
                value={filters.name}
                onChange={(e) => setFilters((prev) => ({ ...prev, name: e.target.value }))}
              />
            </label>
            <label className="text-xs font-medium text-stone-600 dark:text-stone-400">
              {t("admin.users.colEmail")}
              <input
                className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-amber-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                placeholder={t("admin.users.filterByEmail")}
                value={filters.email}
                onChange={(e) => setFilters((prev) => ({ ...prev, email: e.target.value }))}
              />
            </label>
            <label className="text-xs font-medium text-stone-600 dark:text-stone-400">
              {t("admin.users.colMatricule")}
              <input
                className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-amber-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                placeholder={t("admin.users.filterByMatricule")}
                value={filters.matricule}
                onChange={(e) => setFilters((prev) => ({ ...prev, matricule: e.target.value }))}
              />
            </label>
            <label className="text-xs font-medium text-stone-600 dark:text-stone-400">
              {t("admin.users.colPhone")}
              <input
                className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-amber-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                placeholder={t("admin.users.filterByPhone")}
                value={filters.phone}
                onChange={(e) => setFilters((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </label>
          </div>
        ) : null}
      </div>

      {message ? (
        <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 ring-1 ring-emerald-200/80 dark:bg-emerald-950/30 dark:text-emerald-200 dark:ring-emerald-900/40" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 ring-1 ring-red-200/80 dark:bg-red-950/30 dark:text-red-200 dark:ring-red-900/40" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-4 overflow-x-auto rounded-2xl border border-stone-200/80 bg-white shadow-sm ring-1 ring-stone-100 dark:border-stone-800 dark:bg-stone-950 dark:ring-stone-900">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 dark:border-stone-800 dark:bg-stone-900/50 dark:text-stone-400">
              <th className="px-3 py-2 font-medium">{t("admin.users.colName")}</th>
              <th className="px-3 py-2 font-medium">{t("admin.users.colEmail")}</th>
              <th className="px-3 py-2 font-medium">{t("admin.users.colMatricule")}</th>
              <th className="px-3 py-2 font-medium">{t("admin.users.colPhone")}</th>
              <th className="px-3 py-2 font-medium">{t("admin.users.colRole")}</th>
              <th className="px-3 py-2 font-medium text-right">{t("admin.users.colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {!loading && filteredRows.map((row) => (
              <tr key={row.userId} className="border-b border-stone-100 last:border-0 dark:border-stone-800">
                <td className="px-3 py-2 font-medium text-stone-900 dark:text-stone-100">{row.fullName}</td>
                <td className="px-3 py-2 text-stone-700 dark:text-stone-300">{row.email}</td>
                <td className="px-3 py-2 font-mono text-xs text-stone-800 dark:text-stone-200">{row.matriculeCode || t("common.dash")}</td>
                <td className="px-3 py-2 font-mono text-xs text-stone-700 dark:text-stone-300">{row.phone || t("common.dash")}</td>
                <td className="px-3 py-2">
                  <select
                    aria-label={t("admin.users.roleAria", { name: row.fullName })}
                    value={row.role === "admin" ? "Admin" : "Member"}
                    disabled={roleMutation.isPending && roleMutation.variables?.userId === row.userId}
                    onChange={(e) => onRoleChange(row, e.target.value as AdminUserRole)}
                    className={
                      row.role === "admin"
                        ? "rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-900 outline-none focus:border-amber-500 disabled:opacity-60 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100"
                        : "rounded-lg border border-stone-200 bg-stone-50 px-2 py-1 text-xs font-medium text-stone-700 outline-none focus:border-amber-500 disabled:opacity-60 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200"
                    }
                  >
                    <option value="Member">{t("common.student")}</option>
                    <option value="Admin">{t("common.admin")}</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap justify-end gap-1">
                    <button
                      type="button"
                      className="rounded-md border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-900 dark:bg-stone-950 dark:text-red-300 dark:hover:bg-red-950/40"
                      onClick={() => onDelete(row)}
                    >
                      {t("common.delete")}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {loading ? (
              <tr>
                <td className="px-3 py-6 text-center text-sm text-stone-500" colSpan={6}>
                  {t("admin.users.loading")}
                </td>
              </tr>
            ) : filteredRows.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-center text-sm text-stone-500" colSpan={6}>
                  {t("admin.users.empty")}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-end">

        <Link
          to="/admin/payments"
          aria-label={t("admin.users.viewPayments")}
          title={t("admin.users.viewPayments")}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm transition hover:bg-stone-50 hover:text-stone-900 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200 dark:hover:bg-stone-900"
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
    </div>
  );
}
