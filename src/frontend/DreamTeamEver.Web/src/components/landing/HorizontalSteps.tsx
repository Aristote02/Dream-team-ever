import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale } from "@/i18n/LocaleProvider";
import "./how-it-works.css";

const STEP_DURATION_MS = 6000;

export function HorizontalSteps() {
  const { t } = useLocale();
  const [active, setActive] = useState(0);
  const [progressCycle, setProgressCycle] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const steps = useMemo(
    () => [
      { n: "01", title: t("landing.steps.step1"), desc: t("landing.steps.step1Desc") },
      { n: "02", title: t("landing.steps.step2"), desc: t("landing.steps.step2Desc") },
      { n: "03", title: t("landing.steps.step3"), desc: t("landing.steps.step3Desc") },
      { n: "04", title: t("landing.steps.step4"), desc: t("landing.steps.step4Desc") },
    ],
    [t],
  );

  const total = steps.length;
  const current = steps[active];

  const restartProgress = useCallback(() => {
    setProgressCycle((c) => c + 1);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const next = ((index % total) + total) % total;
      setActive(next);
      restartProgress();
    },
    [total, restartProgress],
  );

  const startAutoAdvance = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % total);
      restartProgress();
    }, STEP_DURATION_MS);
  }, [total, restartProgress]);

  useEffect(() => {
    startAutoAdvance();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startAutoAdvance]);

  const handleGoTo = (index: number) => {
    goTo(index);
    startAutoAdvance();
  };

  return (
    <section
      className="how-it-works border-t border-border/40"
      aria-label={t("landing.steps.ariaLabel")}
      style={{ ["--step-duration" as string]: `${STEP_DURATION_MS}ms` }}
    >
      <div className="how-it-works-glow" aria-hidden />
      <div className="how-it-works-inner">
        <div className="how-it-works-grid">
          <div className="how-it-works-side">
            <div>
              <p className="how-it-works-label">{t("landing.steps.label")}</p>
              <h2 className="how-it-works-title">
                {t("landing.steps.titleBefore")}{" "}
                <span className="how-it-works-title-highlight">
                  {t("landing.steps.titleHighlight")}
                </span>
                {t("landing.steps.titleEnd")}
              </h2>
            </div>

            <ul className="how-it-works-nav" role="tablist">
              {steps.map((step, index) => (
                <li key={step.n} className="how-it-works-nav-item">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={active === index}
                    aria-controls={`how-step-panel-${index}`}
                    className={`how-it-works-nav-btn${active === index ? " is-active" : ""}`}
                    onClick={() => handleGoTo(index)}
                  >
                    <span className="how-it-works-nav-num">{step.n}</span>
                    <span className="how-it-works-nav-text-wrap">
                      <span className="how-it-works-nav-title">{step.title}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="how-it-works-controls">
              <button
                type="button"
                className="how-it-works-arrow"
                aria-label={t("landing.steps.prevStep")}
                onClick={() => handleGoTo(active - 1)}
              >
                <ChevronLeft className="size-5" aria-hidden />
              </button>
              <button
                type="button"
                className="how-it-works-arrow"
                aria-label={t("landing.steps.nextStep")}
                onClick={() => handleGoTo(active + 1)}
              >
                <ChevronRight className="size-5" aria-hidden />
              </button>
              <span className="how-it-works-counter" aria-live="polite">
                {t("landing.steps.stepCounter", {
                  current: steps[active].n,
                  total: steps[total - 1].n,
                })}
              </span>
            </div>
          </div>

          <div
            id={`how-step-panel-${active}`}
            role="tabpanel"
            className="how-it-works-card"
            aria-labelledby={`how-step-tab-${active}`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              >
                <p className="how-it-works-card-num">{current.n}</p>
                <h3 className="how-it-works-card-title">{current.title}</h3>
                <p className="how-it-works-card-desc">{current.desc}</p>
              </motion.div>
            </AnimatePresence>

            <div className="how-it-works-progress-wrap">
              <div className="how-it-works-progress-track" aria-hidden>
                <div
                  key={`${active}-${progressCycle}`}
                  className="how-it-works-progress-fill"
                />
              </div>
              <p className="how-it-works-auto-label">{t("landing.steps.autoAdvancing")}</p>
            </div>
          </div>
        </div>

        <div className="how-it-works-dots" role="tablist" aria-label={t("landing.steps.ariaLabel")}>
          {steps.map((step, index) => (
            <button
              key={step.n}
              type="button"
              role="tab"
              aria-selected={active === index}
              aria-label={t("landing.steps.goToStep", { n: step.n })}
              className={`how-it-works-dot${active === index ? " is-active" : ""}`}
              onClick={() => handleGoTo(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
