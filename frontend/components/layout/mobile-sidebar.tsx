"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MobileSidebarProps {
  items: {
    href: string
    icon?: React.ReactNode
    label: string
  }[]
  isOpen: boolean
  onClose: () => void
  header?: React.ReactNode
  footer?: React.ReactNode
}

export function MobileSidebar({ items, isOpen, onClose, header, footer }: MobileSidebarProps) {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-background"
          >
            <div className="flex h-full flex-col">
              <div className="flex h-16 items-center justify-between border-b px-4">
                {header || <div className="text-lg font-semibold">Menu</div>}
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                  <span className="sr-only">Đóng menu</span>
                </Button>
              </div>
              <nav className="flex-1 overflow-auto p-4">
                <motion.ul
                  className="grid gap-1"
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.05,
                      },
                    },
                  }}
                >
                  {items.map((item, index) => (
                    <motion.li
                      key={item.href}
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        show: { opacity: 1, x: 0 },
                      }}
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          pathname === item.href
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted hover:text-foreground",
                        )}
                        onClick={onClose}
                      >
                        {item.icon && <span className="h-4 w-4">{item.icon}</span>}
                        {item.label}
                      </Link>
                    </motion.li>
                  ))}
                </motion.ul>
              </nav>
              {footer && <div className="border-t p-4">{footer}</div>}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
