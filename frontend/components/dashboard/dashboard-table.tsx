"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface DashboardTableProps<T> {
  title: string
  description?: string
  columns: {
    key: string
    header: string
    cell: (item: T) => React.ReactNode
    className?: string
  }[]
  data?: T[]
  keyField: keyof T
  className?: string
  emptyState?: React.ReactNode
  isLoading?: boolean
  pagination?: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
  }
  actions?: React.ReactNode
}

export function DashboardTable<T>({
  title,
  description,
  columns,
  data = [], // Provide default empty array
  keyField,
  className,
  emptyState,
  isLoading,
  pagination,
  actions,
}: DashboardTableProps<T>) {
  // Ensure data is an array
  const tableData = Array.isArray(data) ? data : []

  return (
    <Card className={className}>
      <CardHeader className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-40 w-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : tableData.length === 0 ? (
          <div className="flex h-40 w-full items-center justify-center">
            {emptyState || <p className="text-muted-foreground">Không có dữ liệu</p>}
          </div>
        ) : (
          <>
            <div className="rounded-md border">
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
                  {tableData.map((item) => (
                    <TableRow key={String(item[keyField])}>
                      {columns.map((column) => (
                        <TableCell key={`${String(item[keyField])}-${column.key}`} className={column.className}>
                          {column.cell(item)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  Trước
                </Button>
                <div className="text-sm">
                  Trang {pagination.currentPage} / {pagination.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Sau
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
