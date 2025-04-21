"use client"

import { useState, useEffect } from "react"
import { format, addDays, isSameDay, isWeekend, isBefore, startOfDay } from "date-fns"
import { vi } from "date-fns/locale"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

interface AppointmentDatePickerProps {
  selectedDate: Date | undefined
  availableDates: Date[]
  isLoading: boolean
  onSelectDate: (date: Date) => void
}

export function AppointmentDatePicker({ selectedDate, availableDates, isLoading, onSelectDate }: AppointmentDatePickerProps) {
  const [view, setView] = useState<"quick" | "calendar">("quick")
  const today = new Date()
  
  // Tạo danh sách 14 ngày tới để hiển thị trong chế độ xem nhanh
  const next14Days = Array.from({ length: 14 }, (_, i) => addDays(today, i))
  
  // Lọc ra các ngày có sẵn trong 14 ngày tới
  const availableNext14Days = next14Days.filter(date => 
    availableDates.some(availableDate => isSameDay(availableDate, date))
  )

  return (
    <div className="space-y-4">
      <Tabs value={view} onValueChange={(v) => setView(v as "quick" | "calendar")}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="quick" className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>Ngày gần đây</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>Lịch</span>
            </TabsTrigger>
          </TabsList>
          
          {selectedDate && (
            <div className="text-sm font-medium text-primary">
              Đã chọn: {format(selectedDate, "EEEE, dd/MM/yyyy", { locale: vi })}
            </div>
          )}
        </div>
        
        <TabsContent value="quick" className="mt-4">
          {isLoading ? (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-24 flex-shrink-0 rounded-md" />
              ))}
            </div>
          ) : availableNext14Days.length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-center">
              <CalendarIcon className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <h3 className="text-base font-medium">Không có ngày trống</h3>
              <p className="text-sm text-muted-foreground mt-1">Không tìm thấy ngày trống trong 14 ngày tới</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setView("calendar")}>
                Xem lịch đầy đủ
              </Button>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {availableNext14Days.map((date) => {
                const isSelected = selectedDate ? isSameDay(date, selectedDate) : false
                const isToday = isSameDay(date, today)
                const isAvailable = availableDates.some(availableDate => isSameDay(availableDate, date))
                
                return (
                  <motion.div
                    key={date.toISOString()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      className={cn(
                        "h-auto min-w-24 flex-col py-3 px-4 hover:bg-primary/5",
                        isSelected && "border-primary bg-primary/5 text-primary",
                        isToday && !isSelected && "border-blue-200 bg-blue-50",
                        !isAvailable && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => isAvailable && onSelectDate(date)}
                    >
                      <div className="text-xs font-medium uppercase">
                        {format(date, "EEEE", { locale: vi })}
                      </div>
                      <div className="text-2xl font-bold my-1">
                        {format(date, "dd")}
                      </div>
                      <div className="text-xs">
                        {format(date, "MM/yyyy")}
                      </div>
                      {isAvailable && (
                        <div className="mt-1 text-xs text-primary font-medium">
                          Có lịch trống
                        </div>
                      )}
                    </Button>
                  </motion.div>
                )
              })}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="calendar" className="mt-4">
          <div className="border rounded-md p-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && onSelectDate(date)}
              disabled={(date) => 
                isBefore(date, startOfDay(today)) || 
                !availableDates.some(availableDate => isSameDay(availableDate, date))
              }
              modifiers={{
                available: (date) => availableDates.some(availableDate => isSameDay(availableDate, date)),
                today: (date) => isSameDay(date, today)
              }}
              modifiersClassNames={{
                available: "bg-primary/10 font-medium text-primary",
                today: "bg-blue-50 text-blue-600 font-bold"
              }}
              className="rounded-md"
            />
            
            <div className="mt-3 flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-sm bg-primary/20"></div>
                <span>Có lịch trống</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-sm bg-blue-50"></div>
                <span>Hôm nay</span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
