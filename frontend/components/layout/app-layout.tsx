import type React from "react"
import { AppHeader } from "@/components/layout/header"
import { AppFooter } from "@/components/layout/footer"
import { AppSidebarLayout } from "@/components/layout/sidebar"
import { cn } from "@/lib/utils"

interface AppLayoutProps {
  children: React.ReactNode
  showHeader?: boolean
  showFooter?: boolean
  showSidebar?: boolean
  className?: string
}

export function AppLayout({
  children,
  showHeader = true,
  showFooter = true,
  showSidebar = true,
  className,
}: AppLayoutProps) {
  if (showSidebar) {
    return (
      <div className="flex min-h-screen flex-col">
        {showHeader && <AppHeader />}
        <div className="flex flex-1">
          <AppSidebarLayout>
            <main className={cn("flex-1", className)}>{children}</main>
          </AppSidebarLayout>
        </div>
        {showFooter && <AppFooter />}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      {showHeader && <AppHeader />}
      <main className={cn("flex-1", className)}>{children}</main>
      {showFooter && <AppFooter />}
    </div>
  )
}
