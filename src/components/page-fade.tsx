"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/** 模板页通用渐入：配合路由切换减轻闪屏感 */
export function PageFade({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
