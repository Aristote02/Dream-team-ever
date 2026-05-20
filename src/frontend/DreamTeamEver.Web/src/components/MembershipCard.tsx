import { motion } from "framer-motion";
import { useLocale } from "@/i18n/LocaleProvider";
import { BrandLogo } from "@/components/BrandLogo";

interface MembershipCardProps {
  memberName: string;
  matricule?: string;
  memberSince?: string;
  status?: "active" | "pending";
}

export function MembershipCard({
  memberName,
  matricule,
  memberSince,
  status = "pending",
}: MembershipCardProps) {
  const { t } = useLocale();
  return (
    <div className="relative group [perspective:1200px] w-full max-w-md">
      {/* glow */}
      <motion.div
        aria-hidden
        className="absolute -inset-2 rounded-[2.2rem] bg-gradient-to-br from-amber-400/40 via-amber-600/30 to-amber-800/20 blur-2xl opacity-50 group-hover:opacity-80 transition-opacity duration-700"
      />
      <motion.div
        initial={{ opacity: 0, y: 16, rotateX: 8 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        whileHover={{ rotateY: 6, rotateX: -3, y: -6 }}
        transition={{ type: "spring", stiffness: 120, damping: 16 }}
        className="relative shimmer noise aspect-[1.6/1] w-full rounded-[2rem] gold-gradient p-6 sm:p-8 shadow-2xl shadow-amber-900/40 overflow-hidden [transform-style:preserve-3d]"
      >
        {/* radial blob */}
        <div className="absolute -top-24 -right-24 size-64 bg-white/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

        <div className="absolute top-6 right-6 text-stone-900/50 text-[10px] font-bold tracking-[0.3em] uppercase">
          Kinshasa · 2025
        </div>

        <div className="relative z-10 h-full flex flex-col justify-between text-stone-900">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest opacity-70 font-semibold">
                {t("home.memberName")}
              </p>
              <p className="font-display text-lg sm:text-xl font-bold leading-tight max-w-[14ch]">
                {memberName}
              </p>
            </div>
            <div className="size-11 overflow-hidden rounded-xl border border-stone-900/20 bg-stone-900/10 backdrop-blur grid place-items-center p-0.5">
              <BrandLogo className="size-full object-contain" alt="" />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest opacity-70 font-semibold">
                {t("home.matricule")}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl sm:text-3xl font-black tracking-tight">
                  {matricule || t("home.unissued")}
                </span>
                <span
                  className={`size-2 rounded-full ${
                    status === "active"
                      ? "bg-emerald-700 motion-safe:animate-pulse"
                      : "bg-stone-900/40"
                  }`}
                />
              </div>
            </div>
            <div className="flex justify-between items-end border-t border-stone-900/15 pt-3">
              <div>
                <p className="text-[9px] uppercase tracking-widest opacity-60 font-semibold">
                  {t("home.memberSince")}
                </p>
                <p className="text-xs font-bold">
                  {memberSince || "—"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-widest opacity-60 font-semibold">
                  {t("home.status")}
                </p>
                <p className="text-xs font-bold">
                  {status === "active"
                    ? t("home.statusIssued")
                    : t("home.statusPending")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}