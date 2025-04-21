import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface DashboardStatProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  description?: string
  trend?: {
    value: string
    positive?: boolean
  }
  className?: string
}

export function DashboardStat({ title, value, icon, description, trend, className }: DashboardStatProps) {
  return (
    <Card className={cn("dashboard-card", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="dashboard-stat-title">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent className="p-0 pt-2">
        <div className="dashboard-stat-value">{value}</div>
        {trend && <p className={cn("text-xs", trend.positive ? "text-green-600" : "text-red-600")}>{trend.value}</p>}
        {description && <p className="dashboard-stat-description">{description}</p>}
      </CardContent>
    </Card>
  )
}

export function DashboardStatsGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{children}</div>
}
