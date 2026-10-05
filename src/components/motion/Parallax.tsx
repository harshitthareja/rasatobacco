import { motion, useMotionValueEvent, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** translate range in px; negative moves up faster */
  range?: number;
  scale?: boolean;
};

export function Parallax({ children, className, range = 80, scale = false }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [range, -range]);
  const s = useTransform(scrollYProgress, [0, 0.5, 1], scale ? [1.08, 1.0, 1.08] : [1, 1, 1]);
  const [active, setActive] = useState(false);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const inRange = v > 0 && v < 1;
    setActive((prev) => (prev === inRange ? prev : inRange));
  });
  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ y, scale: s, willChange: active ? "transform" : "auto" }}
    >
      {children}
    </motion.div>
  );
}
