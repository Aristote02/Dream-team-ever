import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { fetchCurrentMember, updateMyProfileRequest } from "../api/authApi";
import { useAuth } from "../auth/useAuth";
import { authInputClassName } from "../components/authInputClass";
type MemberView = {
  fullName: string;
  phone: string;
  matriculeCode: string | null;
  matriculeIssuedAt: string | null;
  createdAt: string;
};

export function ViewPage() {
  const { user, getAccessToken, refreshSession } = useAuth();
  const [model, setModel] = useState<MemberView | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      const token = await getAccessToken();
      if (!token) {
        if (!cancelled) {
          setError("Session expired. Please sign in again.");
          setLoading(false);
        }
        return;
      }

      const me = await fetchCurrentMember(token);
      if (!cancelled) {
        if (!me.ok) {
          setError("Could not load your profile.");
          setLoading(false);
          return;
        }
        setModel(me.data);
        setFullName(me.data.fullName);
        setPhone(me.data.phone);
        setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [user, getAccessToken]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    if (!fullName.trim() || !phone.trim()) {
      setError("Full name and phone are required.");
      return;
    }

    setSaving(true);
    const token = await getAccessToken();
    if (!token) {
      setError("Session expired. Please sign in again.");
      setSaving(false);
      return;
    }

    const updated = await updateMyProfileRequest(token, fullName, phone);
    if (!updated.ok) {
      setError(updated.message ?? "Could not save your profile.");
      setSaving(false);
      return;
    }

    setModel(updated.data);
    setFullName(updated.data.fullName);
    setPhone(updated.data.phone);
    setSaved(true);
    await refreshSession();
    setSaving(false);
  }

  return (
    <div className="font-dream-sans -mx-6 -mt-2 text-left">
      <h1 className="font-dream-serif text-xl font-semibold text-stone-900">View</h1>
      <p className="mt-1 text-sm text-stone-500">Update your profile details below.</p>

      {!user ? (
        <p className="mt-6 text-sm text-stone-600">
          <Link to="/login" className="font-medium text-amber-800 underline-offset-4 hover:underline">
            Sign in
          </Link>{" "}
          to manage your profile.
        </p>
      ) : loading ? (
        <p className="mt-6 text-sm text-stone-500">Loading profile…</p>
      ) : (
        <>
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <label htmlFor="full-name" className="mb-1.5 block text-sm font-medium text-stone-700">
                Full name
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
                placeholder="Your full name"
              />
            </div>

            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-stone-700">
                Phone number
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
                placeholder="+243 …"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700">Matricule code</label>
              <input value={model?.matriculeCode ?? "—"} readOnly className={`${authInputClassName} cursor-not-allowed opacity-80`} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700">Matricule issued at</label>
              <input
                value={model?.matriculeIssuedAt ? new Date(model.matriculeIssuedAt).toLocaleString() : "—"}
                readOnly
                className={`${authInputClassName} cursor-not-allowed opacity-80`}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700">Created at</label>
              <input value={model?.createdAt ? new Date(model.createdAt).toLocaleString() : "—"} readOnly className={`${authInputClassName} cursor-not-allowed opacity-80`} />
            </div>

            {error ? (
              <p className="text-sm text-red-700" role="alert">
                {error}
              </p>
            ) : null}
            {saved ? (
              <p className="text-sm text-emerald-700" role="status">
                Profile updated.
              </p>
            ) : null}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-gradient-to-b from-amber-500 to-amber-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-stone-500">
            <Link to="/home" className="font-medium text-amber-800 underline-offset-4 hover:underline">
              Back to wallet
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
