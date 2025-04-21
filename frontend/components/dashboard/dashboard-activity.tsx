import type React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ActivityItem {
  id: string | number
  title: string
  description: string
  timestamp: string
  icon?: React.ReactNode
  user?: {
    name: string
    avatar?: string
    role?: string
  }
  status?: "success" | "warning" | "error" | "info"
}

interface DashboardActivityProps {
  title: string
  description?: string
  items: ActivityItem[]
  className?: string
  emptyState?: React.ReactNode
}

export function DashboardActivity({ title, description, items, className, emptyState }: DashboardActivityProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          emptyState || (
            <div className="flex h-40 items-center justify-center">
              <p className="text-sm text-muted-foreground">Không có hoạt động nào</p>
            </div>
          )
        ) : (
          <div className="space-y-8">
            {items.map((item) => (
              <div key={item.id} className="flex items-start">
                {item.icon ? (
                  <div
                    className={cn("mr-4 flex h-10 w-10 items-center justify-center rounded-full", {
                      "bg-green-100": item.status === "success",
                      "bg-amber-100": item.status === "warning",
                      "bg-red-100": item.status === "error",
                      "bg-blue-100": item.status === "info",
                      "bg-muted": !item.status,
                    })}
                  >
                    <div
                      className={cn("h-5 w-5", {
                        "text-green-700": item.status === "success",
                        "text-amber-700": item.status === "warning",
                        "text-red-700": item.status === "error",
                        "text-blue-700": item.status === "info",
                        "text-muted-foreground": !item.status,
                      })}
                    >
                      {item.icon}
                    </div>
                  </div>
                ) : item.user ? (
                  <Avatar className="mr-4 h-10 w-10">
                    <AvatarImage src={item.user.avatar || "/placeholder.svg"} alt={item.user.name} />
                    <AvatarFallback>
                      {item.user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : null}
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
