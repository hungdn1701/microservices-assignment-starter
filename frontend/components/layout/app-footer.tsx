import type React from "react"
import { cn } from "@/lib/utils"

interface AppFooterProps {
  className?: string
  children?: React.ReactNode
}

export function AppFooter({ className, children }: AppFooterProps) {
  return (
    <footer className={cn("border-t bg-background", className)}>
      <div className="container flex h-16 items-center justify-between px-4 py-4">
        {children || <p className="text-sm text-muted-foreground">© 2025 Hệ Thống Y Tế. Đã đăng ký bản quyền.</p>}
      </div>
    </footer>
  )
}
