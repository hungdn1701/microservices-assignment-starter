"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface SidebarItemProps {
  href: string
  icon?: React.ReactNode
  label: string
  isActive?: boolean
  isCollapsed?: boolean
  onClick?: () => void
}

function SidebarItem({ href, icon, label, isActive, isCollapsed, onClick }: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out",
        isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted hover:text-foreground",
        isCollapsed && "justify-center px-2",
      )}
      onClick={onClick}
    >
      {icon && <span className={cn("h-4 w-4 flex-shrink-0", isCollapsed && "h-5 w-5")}>{icon}</span>}
      {!isCollapsed && (
        <motion.span
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          exit={{ opacity: 0, width: 0 }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.span>
      )}
    </Link>
  )
}

interface AppSidebarProps {
  items: {
    href: string
    icon?: React.ReactNode
    label: string
  }[]
  className?: string
  header?: React.ReactNode
  footer?: React.ReactNode
}

export function AppSidebar({ items, className, header, footer }: AppSidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Kiểm tra kích thước màn hình và cập nhật trạng thái
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth < 1024) {
        setIsCollapsed(true)
      }
    }

    // Kiểm tra khi component mount
    checkScreenSize()

    // Thêm event listener
    window.addEventListener("resize", checkScreenSize)

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkScreenSize)
    }
  }, [])

  return (
    <aside
      className={cn(
        "relative flex h-full flex-col border-r bg-background transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64",
        isMobile ? "fixed left-0 top-0 z-40 h-full shadow-lg" : "hidden lg:flex",
        className,
      )}
    >
      <div className="flex h-full flex-col">
        {header && (
          <div
            className={cn(
              "flex items-center border-b p-4 transition-all duration-300",
              isCollapsed && "justify-center p-2",
            )}
          >
            {!isCollapsed ? header : null}
          </div>
        )}

        <nav className="flex-1 overflow-auto p-2">
          <ul className="grid gap-1">
            {items.map((item) => (
              <li key={item.href}>
                <SidebarItem
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isActive={pathname === item.href}
                  isCollapsed={isCollapsed}
                />
              </li>
            ))}
          </ul>
        </nav>

        {footer && (
          <div className={cn("border-t p-4 transition-all duration-300", isCollapsed && "flex justify-center p-2")}>
            {!isCollapsed ? footer : null}
          </div>
        )}
      </div>

      {/* Toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-background shadow-md"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>
    </aside>
  )
}
