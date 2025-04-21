"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Clock, Loader2, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface TimeSlotSelectorProps {
  date: Date | undefined
  timeSlots: any[]
  selectedTimeSlot: string | undefined
  isLoading: boolean
  onSelectTimeSlot: (timeSlotId: string) => void
}

export function TimeSlotSelector({ date, timeSlots, selectedTimeSlot, isLoading, onSelectTimeSlot }: TimeSlotSelectorProps) {
  const [activeTab, setActiveTab] = useState("all")

  // Lọc khung giờ theo buổi
  const morningSlots = timeSlots.filter(slot => {
    // Đảm bảo start_time là chuỗi và có định dạng h:mm:ss
    if (typeof slot.start_time !== 'string') return false;
    const hour = parseInt(slot.start_time.split(':')[0])
    return hour < 12
  })

  const afternoonSlots = timeSlots.filter(slot => {
    // Đảm bảo start_time là chuỗi và có định dạng h:mm:ss
    if (typeof slot.start_time !== 'string') return false;
    const hour = parseInt(slot.start_time.split(':')[0])
    return hour >= 12
  })

  // Sắp xếp khung giờ theo thời gian
  const sortedTimeSlots = [...timeSlots].sort((a, b) => a.start_time.localeCompare(b.start_time))
  const sortedMorningSlots = [...morningSlots].sort((a, b) => a.start_time.localeCompare(b.start_time))
  const sortedAfternoonSlots = [...afternoonSlots].sort((a, b) => a.start_time.localeCompare(b.start_time))

  // Hiển thị thông tin khung giờ đã chọn
  const selectedSlot = timeSlots.find(slot => slot.id.toString() === selectedTimeSlot)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base">Chọn khung giờ</Label>
        {date && (
          <div className="text-sm text-muted-foreground flex items-center">
            <CalendarIcon className="h-3.5 w-3.5 mr-1" />
            {format(date, "dd/MM/yyyy", { locale: vi })}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Đang tải khung giờ...</span>
        </div>
      ) : !date ? (
        <div className="rounded-md border border-dashed p-8 text-center">
          <CalendarIcon className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <div className="text-sm text-muted-foreground">Vui lòng chọn ngày khám trước</div>
        </div>
      ) : timeSlots.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center">
          <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <div className="text-sm text-muted-foreground">Không có khung giờ nào cho ngày này</div>
          <div className="text-xs text-muted-foreground mt-1">Vui lòng chọn ngày khác hoặc bác sĩ khác</div>
        </div>
      ) : (
        <>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">Tất cả ({timeSlots.length})</TabsTrigger>
              <TabsTrigger value="morning">Buổi sáng ({morningSlots.length})</TabsTrigger>
              <TabsTrigger value="afternoon">Buổi chiều ({afternoonSlots.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-2">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {sortedTimeSlots.map((slot) => (
                  <TimeSlotCard
                    key={slot.id}
                    slot={slot}
                    isSelected={selectedTimeSlot === slot.id.toString()}
                    onSelect={onSelectTimeSlot}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="morning" className="mt-2">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {sortedMorningSlots.map((slot) => (
                  <TimeSlotCard
                    key={slot.id}
                    slot={slot}
                    isSelected={selectedTimeSlot === slot.id.toString()}
                    onSelect={onSelectTimeSlot}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="afternoon" className="mt-2">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {sortedAfternoonSlots.map((slot) => (
                  <TimeSlotCard
                    key={slot.id}
                    slot={slot}
                    isSelected={selectedTimeSlot === slot.id.toString()}
                    onSelect={onSelectTimeSlot}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Hiển thị thông tin khung giờ đã chọn */}
          {selectedSlot && (
            <div className="mt-4 rounded-lg border-l-4 border-primary border-t border-r border-b p-4 bg-primary/5">
              <h4 className="font-medium flex items-center">
                <Clock className="h-4 w-4 text-primary mr-2" />
                Thông tin khung giờ đã chọn
              </h4>
              <div className="mt-2 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground">Ngày:</span>
                    <p className="font-medium">{format(new Date(selectedSlot.date), "dd/MM/yyyy", { locale: vi })}</p>
                    {selectedSlot.weekday_name && (
                      <Badge variant="outline" className="mt-1 bg-primary/5 text-xs">
                        {selectedSlot.weekday_name}
                      </Badge>
                    )}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Giờ:</span>
                    <p className="font-medium">{selectedSlot.time}</p>
                    <p className="text-xs text-muted-foreground mt-1">{selectedSlot.duration || 30} phút</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {selectedSlot.department && (
                    <div>
                      <span className="text-muted-foreground">Khoa/phòng:</span>
                      <p className="font-medium">{selectedSlot.department}</p>
                    </div>
                  )}
                  {selectedSlot.room && (
                    <div>
                      <span className="text-muted-foreground">Phòng khám:</span>
                      <p className="font-medium">{selectedSlot.room}</p>
                    </div>
                  )}
                </div>

                {/* Thông tin từ lịch làm việc của bác sĩ */}
                {selectedSlot.availability_id && (
                  <div className="border-t pt-2 mt-1">
                    <div className="text-muted-foreground mb-1">Thông tin lịch làm việc:</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedSlot.schedule_type && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {selectedSlot.schedule_type === 'REGULAR' ? 'Lịch thường xuyên' : 'Lịch đặc biệt'}
                        </Badge>
                      )}
                      {selectedSlot.location && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {selectedSlot.location}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

interface TimeSlotCardProps {
  slot: any
  isSelected: boolean
  onSelect: (timeSlotId: string) => void
}

function TimeSlotCard({ slot, isSelected, onSelect }: TimeSlotCardProps) {
  // Xử lý hiển thị thời gian
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    // Chuyển đổi 24h sang 12h và thêm AM/PM
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Kiểm tra xem slot có khả dụng không
  const isAvailable = slot.is_available !== false; // Mặc định là true nếu không có trường is_available

  // Hiển thị thời gian
  const displayTime = slot.time || formatTime(slot.start_time);

  return (
    <motion.div whileHover={{ scale: isAvailable ? 1.05 : 1 }}>
      <div
        className={cn(
          "flex flex-col rounded-md border p-3 transition-all",
          isSelected
            ? "border-primary bg-primary/5 ring-1 ring-primary"
            : "hover:border-primary/50",
          !isAvailable && "cursor-not-allowed opacity-50 bg-muted",
        )}
        onClick={() => isAvailable && onSelect(slot.id.toString())}
      >
        <div className="flex justify-between items-center w-full">
          <div className="text-base font-medium">{displayTime}</div>
          {slot.status && (
            <Badge variant="outline" className="text-[10px] h-5 px-1 bg-primary/5">
              {slot.status === 'AVAILABLE' ? 'Còn trống' : slot.status === 'BOOKED' ? 'Đã đặt' : slot.status}
            </Badge>
          )}
        </div>

        <div className="text-xs text-muted-foreground mt-1 w-full flex justify-between items-center">
          <span>
            {slot.duration ||
              (slot.start_time && slot.end_time ?
                calculateDuration(slot.start_time, slot.end_time) : 30)} phút
          </span>
          {slot.room && <span className="text-primary text-xs">P.{slot.room}</span>}
        </div>

        {isSelected && (
          <div className="mt-2 w-full pt-2 border-t flex justify-center">
            <Check className="h-4 w-4 text-primary" />
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Hàm tính thời lượng giữa hai thời điểm
function calculateDuration(startTime: string, endTime: string): number {
  try {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    const startMinutesTotal = startHours * 60 + startMinutes;
    const endMinutesTotal = endHours * 60 + endMinutes;

    // Xử lý trường hợp end time là ngày hôm sau
    let duration = endMinutesTotal - startMinutesTotal;
    if (duration < 0) {
      duration += 24 * 60; // Thêm 24 giờ nếu end time là ngày hôm sau
    }

    return duration;
  } catch (error) {
    console.error('Error calculating duration:', error);
    return 30; // Giá trị mặc định
  }
}
