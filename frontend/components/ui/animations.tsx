"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface FadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function FadeIn({ children, delay = 0, duration = 0.5, className = "" }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function SlideIn({ children, delay = 0, duration = 0.5, className = "" }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function SlideInFromLeft({ children, delay = 0, duration = 0.5, className = "" }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function SlideInFromRight({ children, delay = 0, duration = 0.5, className = "" }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function ScaleIn({ children, delay = 0, duration = 0.5, className = "" }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function Pulse({ children, className = "" }: Omit<FadeInProps, "delay" | "duration">) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.02, 1],
      }}
      transition={{
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "loop",
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggeredContainer({
  children,
  delay = 0,
  staggerDelay = 0.1,
  className = "",
}: FadeInProps & { staggerDelay?: number }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delayChildren: delay,
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggeredItem({ children, className = "" }: Omit<FadeInProps, "delay" | "duration">) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5 },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function BouncingDot() {
  return (
    <motion.div
      className="w-2 h-2 bg-primary rounded-full inline-block mx-0.5"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatType: "loop" }}
    />
  )
}

export function LoadingDots() {
  return (
    <div className="flex items-center justify-center space-x-1">
      <BouncingDot />
      <motion.div
        className="w-2 h-2 bg-primary rounded-full"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatType: "loop", delay: 0.1 }}
      />
      <motion.div
        className="w-2 h-2 bg-primary rounded-full"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatType: "loop", delay: 0.2 }}
      />
    </div>
  )
}

export function SkeletonPulse({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`bg-muted rounded ${className}`}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatType: "loop" }}
    />
  )
}
