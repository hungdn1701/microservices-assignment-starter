"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface DataTableProps<T> {
  columns: {
    key: string
    header: string
    cell: (item: T) => React.ReactNode
    className?: string
    sortable?: boolean
  }[]
  data: T[]
  keyField: keyof T
  className?: string
  emptyState?: React.ReactNode
  isLoading?: boolean
  searchable?: boolean
  pagination?: boolean
  pageSize?: number
}

export function DataTable<T>({
  columns,
  data,
  keyField,
  className,
  emptyState,
  isLoading = false,
  searchable = false,
  pagination = false,
  pageSize = 10,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null)

  // Đảm bảo data là một mảng
  const safeData = Array.isArray(data) ? data : [];

  // Xử lý tìm kiếm
  const filteredData =
    searchable && searchQuery
      ? safeData.filter((item) =>
          Object.values(item).some(
            (value) => value && value.toString().toLowerCase().includes(searchQuery.toLowerCase()),
          ),
        )
      : safeData

  // Xử lý sắp xếp
  const sortedData = sortConfig
    ? [...filteredData].sort((a: any, b: any) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1
        }
        return 0
      })
    : filteredData

  // Xử lý phân trang
  const totalPages = pagination ? Math.ceil(sortedData.length / pageSize) : 1
  const paginatedData = pagination ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize) : sortedData

  // Xử lý sắp xếp
  const handleSort = (key: string) => {
    setSortConfig(
      sortConfig?.key === key
        ? { key, direction: sortConfig.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    )
  }

  // Skeleton loading
  if (isLoading) {
    return (
      <div className={cn("rounded-md border", className)}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key} className={column.className}>
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={`${index}-${column.key}`} className={column.className}>
                      <div className="h-6 w-full animate-pulse rounded bg-muted"></div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  // Empty state
  if (!filteredData || filteredData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex h-40 w-full items-center justify-center rounded-md border"
      >
        {emptyState || <p className="text-muted-foreground">Không có dữ liệu</p>}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("rounded-md border", className)}
    >
      {searchable && (
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1) // Reset về trang đầu khi tìm kiếm
              }}
              className="pl-10"
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(column.className, column.sortable && "cursor-pointer hover:bg-muted/50")}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    {column.header}
                    {sortConfig?.key === column.key && sortConfig?.direction && (
                      <span className="text-xs">{sortConfig.direction === "asc" ? "▲" : "▼"}</span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Kiểm tra paginatedData là một mảng trước khi gọi map */}
              {Array.isArray(paginatedData) && paginatedData.map((item, index) => (
                <motion.tr
                  key={String(item[keyField])}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  {columns.map((column) => (
                    <TableCell key={`${String(item[keyField])}-${column.key}`} className={column.className}>
                      {column.cell(item)}
                    </TableCell>
                  ))}
                </motion.tr>
              ))}
            {/* Kết thúc danh sách các hàng */}
          </TableBody>
        </Table>
      </div>

      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-2">
          <div className="text-sm text-muted-foreground">
            Hiển thị {(currentPage - 1) * pageSize + 1} đến {Math.min(currentPage * pageSize, sortedData.length)} trong
            tổng số {sortedData.length} bản ghi
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium">
              Trang {currentPage} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
