"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowDown, ArrowUp, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string
  description?: string
  icon?: React.ReactNode
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  className?: string
}

export function StatCard({ title, value, description, icon, trend, trendValue, className }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="mt-1"
              >
                <p className="text-2xl font-bold">{value}</p>
              </motion.div>
              {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
              {trend && trendValue && (
                <div className="mt-2 flex items-center gap-1">
                  <div
                    className={cn(
                      "flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-medium",
                      trend === "up" && "bg-green-100 text-green-800",
                      trend === "down" && "bg-red-100 text-red-800",
                      trend === "neutral" && "bg-gray-100 text-gray-800",
                    )}
                  >
                    {trend === "up" && <ArrowUp className="h-3 w-3" />}
                    {trend === "down" && <ArrowDown className="h-3 w-3" />}
                    {trend === "neutral" && <Minus className="h-3 w-3" />}
                    {trendValue}
                  </div>
                </div>
              )}
            </div>
            {icon && (
              <motion.div
                initial={{ opacity: 0, rotate: -10 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"
              >
                {icon}
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
