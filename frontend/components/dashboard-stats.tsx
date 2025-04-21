import { Card, CardContent } from "@/components/ui/card"
import type { ReactNode } from "react"

interface DashboardStatsProps {
  title: string
  value: string
  trend?: string
  icon: ReactNode
  className?: string
}

export default function DashboardStats({ title, value, trend, icon, className }: DashboardStatsProps) {
  const isPositive = trend?.startsWith("+")

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <div className="text-teal-600">{icon}</div>
        </div>
        <div className="mt-2 flex items-baseline">
          <h3 className="text-2xl font-bold">{value}</h3>
          {trend && (
            <span className={`ml-2 text-xs font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
              {trend}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
