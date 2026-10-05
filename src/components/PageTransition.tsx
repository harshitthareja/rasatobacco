import { AnimatePresence, motion } from "framer-motion";
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

/**
 * PageTransition — cinematic smoke curtain between routes.
 * Triggers on pathname change. Two stacked panels wipe up + smoke fades.
 */
export function PageTransition() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [key, setKey] = useState(pathname);

  useEffect(() => {
    setKey(pathname);
  }, [pathname]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        className="pointer-events-none fixed inset-0 z-[60]"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        exit={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ willChange: "opacity, transform" }}
      >
        <motion.div
          className="absolute inset-0"
          initial={{ y: 0 }}
          animate={{ y: "-100%" }}
          exit={{ y: 0 }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, oklch(0.18 0.01 60) 0%, oklch(0.06 0.004 60) 70%), oklch(0.06 0.004 60)",
          }}
        />
        <motion.div
          className="absolute inset-0"
          initial={{ scaleX: 0, transformOrigin: "left" }}
          animate={{ scaleX: 1, transformOrigin: "right" }}
          transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
          style={{
            background:
              "linear-gradient(90deg, transparent, oklch(0.78 0.09 48 / 0.18), transparent)",
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
