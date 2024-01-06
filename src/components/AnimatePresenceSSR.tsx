import { AnimatePresence } from "framer-motion";
import type { ComponentProps } from "react";
import React from "react";

export const AnimatePresenceSSR = (
  props: ComponentProps<typeof AnimatePresence>,
) => {
  return typeof window !== "undefined" ? (
    <AnimatePresence {...props} />
  ) : (
    <>{props.children}</>
  );
};
