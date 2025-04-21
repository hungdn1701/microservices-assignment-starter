"use client"

import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  // Normalize status to uppercase for consistency
  const normalizedStatus = status.toUpperCase();
  
  // Define styles for different statuses
  const styles = {
    CONFIRMED: "bg-green-100 text-green-800 hover:bg-green-100",
    PENDING: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    COMPLETED: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    CANCELLED: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    NO_SHOW: "bg-red-100 text-red-800 hover:bg-red-100",
    IN_PROGRESS: "bg-purple-100 text-purple-800 hover:bg-purple-100",
    RESCHEDULED: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  };

  // Define text for different statuses
  const statusText = {
    CONFIRMED: "Đã xác nhận",
    PENDING: "Chờ xác nhận",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
    NO_SHOW: "Không đến",
    IN_PROGRESS: "Đang khám",
    RESCHEDULED: "Đã đổi lịch",
  };

  // Get the style and text for the current status, or use defaults
  const style = styles[normalizedStatus as keyof typeof styles] || "bg-gray-100 text-gray-800";
  const text = statusText[normalizedStatus as keyof typeof statusText] || status;
  
  return (
    <Badge className={cn(style, className)} variant="outline">
      {text}
    </Badge>
  );
}
