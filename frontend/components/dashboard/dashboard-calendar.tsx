"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface CalendarEvent {
  id: string | number
  title: string
  date: Date
  time?: string
  status?: "scheduled" | "confirmed" | "completed" | "cancelled"
  type?: string
}

interface DashboardCalendarProps {
  title: string
  description?: string
  events: CalendarEvent[]
  onDateSelect?: (date: Date) => void
  onEventSelect?: (event: CalendarEvent) => void
  className?: string
}

export function DashboardCalendar({
  title,
  description,
  events,
  onDateSelect,
  onEventSelect,
  className,
}: DashboardCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    if (onDateSelect) {
      onDateSelect(date)
    }
  }

  const handleEventClick = (event: CalendarEvent) => {
    if (onEventSelect) {
      onEventSelect(event)
    }
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfMonth = getFirstDayOfMonth(year, month)

  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ]

  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]

  const getEventsForDate = (date: Date) => {
    return events.filter(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear(),
    )
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isSelected = (date: Date) => {
    return (
      selectedDate &&
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    )
  }

  const renderCalendarDays = () => {
    const days = []
    const previousMonthDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

    // Previous month days
    for (let i = previousMonthDays; i > 0; i--) {
      const date = new Date(year, month, 1 - i)
      days.push(
        <div key={`prev-${i}`} className="p-2 text-center text-muted-foreground opacity-50">
          {date.getDate()}
        </div>,
      )
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i)
      const dateEvents = getEventsForDate(date)
      const hasEvents = dateEvents.length > 0

      days.push(
        <div
          key={`current-${i}`}
          className={cn(
            "relative cursor-pointer p-2 text-center transition-colors hover:bg-muted",
            isToday(date) && "bg-accent text-accent-foreground",
            isSelected(date) && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
          )}
          onClick={() => handleDateClick(date)}
        >
          {i}
          {hasEvents && (
            <div className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary"></div>
          )}
        </div>,
      )
    }

    // Next month days
    const totalDaysDisplayed = days.length
    const remainingCells = 42 - totalDaysDisplayed // 6 rows x 7 columns

    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(year, month + 1, i)
      days.push(
        <div key={`next-${i}`} className="p-2 text-center text-muted-foreground opacity-50">
          {date.getDate()}
        </div>,
      )
    }

    return days
  }

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : []

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-24 text-center font-medium">
              {monthNames[month]} {year}
            </div>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {dayNames.map((day) => (
            <div key={day} className="p-2 text-center font-medium">
              {day}
            </div>
          ))}
          {renderCalendarDays()}
        </div>

        {selectedDate && (
          <div className="mt-4">
            <h4 className="mb-2 font-medium">
              Sự kiện ngày {selectedDate.getDate()}/{selectedDate.getMonth() + 1}/{selectedDate.getFullYear()}
            </h4>
            {selectedDateEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Không có sự kiện nào</p>
            ) : (
              <div className="space-y-2">
                {selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className={cn("cursor-pointer rounded-md border p-2 transition-colors hover:bg-muted", {
                      "border-l-4 border-l-green-500": event.status === "confirmed",
                      "border-l-4 border-l-blue-500": event.status === "scheduled",
                      "border-l-4 border-l-gray-500": event.status === "completed",
                      "border-l-4 border-l-red-500": event.status === "cancelled",
                    })}
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{event.title}</span>
                      {event.time && <span className="text-sm text-muted-foreground">{event.time}</span>}
                    </div>
                    {event.type && <div className="text-xs text-muted-foreground">{event.type}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
