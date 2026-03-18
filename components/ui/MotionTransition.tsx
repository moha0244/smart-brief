// components/ui/MotionTransition.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface MotionTransitionProps {
  children: ReactNode;
  type?: "fade" | "slide" | "scale" | "bounce";
  direction?: "up" | "down" | "left" | "right";
  duration?: number;
  delay?: number;
  className?: string;
}

export function MotionTransition({ 
  children, 
  type = "fade",
  direction = "up",
  duration = 0.3,
  delay = 0,
  className = ""
}: MotionTransitionProps) {
  const getVariants = () => {
    const baseVariants = {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    };

    switch (type) {
      case "slide":
        const slideOffset = 20;
        const slideDirection = {
          up: { y: slideOffset },
          down: { y: -slideOffset },
          left: { x: slideOffset },
          right: { x: -slideOffset }
        };
        
        return {
          initial: { opacity: 0, ...slideDirection[direction] },
          animate: { opacity: 1, x: 0, y: 0 },
          exit: { opacity: 0, ...slideDirection[direction] }
        };
        
      case "scale":
        return {
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.8 }
        };
        
      case "bounce":
        return {
          initial: { opacity: 0, scale: 0.3 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.3 }
        };
        
      default: // fade
        return baseVariants;
    }
  };

  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={getVariants()}
      transition={{ 
        duration, 
        delay,
        type: type === "bounce" ? "spring" : "tween",
        stiffness: type === "bounce" ? 400 : undefined
      }}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedListProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
}

export function AnimatedList({ 
  children, 
  className = "",
  staggerDelay = 0.1
}: AnimatedListProps) {
  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      variants={{
        initial: { opacity: 0 },
        animate: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 }
          }}
          transition={{ delay: index * staggerDelay }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
