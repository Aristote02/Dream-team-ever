import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    n: "01",
    t: "Create your account",
    d: "Sign up with your name, email and phone in under a minute.",
  },
  {
    n: "02",
    t: "Pay your registration fee",
    d: "Use M-Pesa or Orange Money. We confirm the payment in real time.",
  },
  {
    n: "03",
    t: "Receive your matricule",
    d: "Your official member ID is issued instantly and stored in your wallet.",
  },
  {
    n: "04",
    t: "Carry it forever",
    d: "Access your card, profile and payment history any time, anywhere.",
  },
];

export function HorizontalSteps() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);

  return (
    <section
      ref={ref}
      className="relative h-[400vh]"
      aria-label="How it works"
    >
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 mb-10">
          <p className="text-xs uppercase tracking-[0.3em] gold-text font-bold">
            How it works
          </p>
          <h2 className="font-display text-4xl sm:text-6xl mt-3 leading-tight">
            Four steps to your <span className="gold-text">matricule</span>.
          </h2>
        </div>
        <motion.div style={{ x }} className="flex gap-8 px-[8vw]">
          {steps.map((s) => (
            <div
              key={s.n}
              className="relative shrink-0 w-[80vw] sm:w-[60vw] lg:w-[44vw] h-[55vh] glass-card rounded-[2rem] p-10 sm:p-14 overflow-hidden"
            >
              <div
                aria-hidden
                className="absolute -top-32 -right-32 size-[400px] rounded-full blur-3xl opacity-30"
                style={{
                  background:
                    "radial-gradient(circle, var(--amber-glow), transparent 60%)",
                }}
              />
              <p className="relative font-display text-7xl sm:text-9xl gold-text leading-none">
                {s.n}
              </p>
              <h3 className="relative font-display text-3xl sm:text-4xl mt-8">
                {s.t}
              </h3>
              <p className="relative text-muted-foreground mt-4 text-lg max-w-md">
                {s.d}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}