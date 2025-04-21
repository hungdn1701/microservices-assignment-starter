"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Clock, Loader2, CalendarIcon, MapPin, Info } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface EnhancedTimeSlotSelectorProps {
  timeSlots: any[]
  selectedTimeSlot: string
  selectedLocation: string
  locations: any[]
  estimatedPrice: number
  isLoading: boolean
  onSelectTimeSlot: (timeSlotId: string) => void
  onSelectLocation: (locationId: string) => void
}

export function EnhancedTimeSlotSelector({
  timeSlots,
  selectedTimeSlot,
  selectedLocation,
  locations,
  estimatedPrice,
  isLoading,
  onSelectTimeSlot,
  onSelectLocation
}: EnhancedTimeSlotSelectorProps) {
  // Lấy ngày từ khung giờ đầu tiên nếu có
  const date = timeSlots.length > 0 ? new Date(timeSlots[0].date) : undefined
  const [activeTab, setActiveTab] = useState("all")
  const [showDetails, setShowDetails] = useState(false)
  const [selectedSlotDetails, setSelectedSlotDetails] = useState<any>(null)

  // Lọc khung giờ theo buổi
  const morningSlots = timeSlots.filter(slot => {
    if (typeof slot.start_time !== 'string') return false;
    const hour = parseInt(slot.start_time.split(':')[0])
    return hour < 12
  })

  const afternoonSlots = timeSlots.filter(slot => {
    if (typeof slot.start_time !== 'string') return false;
    const hour = parseInt(slot.start_time.split(':')[0])
    return hour >= 12 && hour < 17
  })

  const eveningSlots = timeSlots.filter(slot => {
    if (typeof slot.start_time !== 'string') return false;
    const hour = parseInt(slot.start_time.split(':')[0])
    return hour >= 17
  })

  // Sắp xếp khung giờ theo thời gian
  const sortTimeSlots = (slots: any[]) => {
    return [...slots].sort((a, b) => {
      return a.start_time.localeCompare(b.start_time)
    })
  }

  const sortedTimeSlots = sortTimeSlots(timeSlots)
  const sortedMorningSlots = sortTimeSlots(morningSlots)
  const sortedAfternoonSlots = sortTimeSlots(afternoonSlots)
  const sortedEveningSlots = sortTimeSlots(eveningSlots)

  // Xử lý khi chọn khung giờ
  const handleSelectTimeSlot = (slot: any) => {
    if (!slot.available) return
    onSelectTimeSlot(slot.id.toString())
  }

  // Xử lý khi xem chi tiết khung giờ
  const handleViewDetails = (slot: any) => {
    setSelectedSlotDetails(slot)
    setShowDetails(true)
  }

  return (
    <div className="space-y-4">
      {/* Hướng dẫn chọn khung giờ */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
        <div className="flex items-start">
          <Clock className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">Hướng dẫn chọn khung giờ</h3>
            <p className="text-xs text-blue-700 mt-1">
              1. Chọn khung giờ phù hợp với lịch của bạn từ danh sách bên dưới<br />
              2. Các khung giờ được phân theo buổi: Sáng (trước 12h), Chiều (12h-17h), Tối (sau 17h)<br />
              3. Chọn địa điểm khám phù hợp với bạn<br />
              4. Nhấn "Xác nhận đặt lịch" để hoàn tất quá trình đặt lịch
            </p>
          </div>
        </div>
      </div>

      {!date ? (
        <div className="rounded-md border border-dashed p-8 text-center">
          <CalendarIcon className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <h3 className="text-base font-medium">Chưa chọn ngày</h3>
          <p className="text-sm text-muted-foreground mt-1">Vui lòng chọn ngày khám trước</p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Đang tải khung giờ...</p>
          </div>
        </div>
      ) : timeSlots.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center">
          <Clock className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <h3 className="text-base font-medium">Không có khung giờ trống</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Không có khung giờ trống cho ngày {date ? format(date, "dd/MM/yyyy", { locale: vi }) : "đã chọn"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Vui lòng chọn ngày khác hoặc bác sĩ khác</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <Label className="text-base">Chọn khung giờ</Label>
            {date && (
              <div className="text-sm text-muted-foreground">
                {format(date, "EEEE, dd/MM/yyyy", { locale: vi })}
              </div>
            )}
          </div>

          <div className="mb-4">
            <div className="text-sm font-medium text-muted-foreground mb-2">Chọn địa điểm khám</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {locations.map((location) => (
                <div
                  key={location.id}
                  className={cn(
                    "flex flex-col rounded-md border p-3 cursor-pointer transition-all",
                    selectedLocation === location.id.toString()
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:border-primary/50",
                  )}
                  onClick={() => onSelectLocation(location.id.toString())}
                >
                  <div className="font-medium">{location.name}</div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-start">
                    <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                    <span>{location.address}</span>
                  </div>
                  {selectedLocation === location.id.toString() && (
                    <div className="absolute -top-2 -right-2 rounded-full bg-primary text-primary-foreground p-1 shadow-sm">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="all" className="text-sm">Tất cả</TabsTrigger>
              <TabsTrigger value="morning" className="flex items-center gap-1 text-sm">
                <span>Sáng</span>
                <Badge variant="outline" className="ml-1 h-5 px-1 bg-amber-50 text-amber-700 border-amber-200">
                  {morningSlots.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="afternoon" className="flex items-center gap-1 text-sm">
                <span>Chiều</span>
                <Badge variant="outline" className="ml-1 h-5 px-1 bg-blue-50 text-blue-700 border-blue-200">
                  {afternoonSlots.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="evening" className="flex items-center gap-1 text-sm">
                <span>Tối</span>
                <Badge variant="outline" className="ml-1 h-5 px-1 bg-indigo-50 text-indigo-700 border-indigo-200">
                  {eveningSlots.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                <AnimatePresence>
                  {sortedTimeSlots.map((slot) => (
                    <EnhancedTimeSlotCard
                      key={slot.id}
                      slot={slot}
                      isSelected={selectedTimeSlot === slot.id.toString()}
                      onSelect={() => handleSelectTimeSlot(slot)}
                      onViewDetails={() => handleViewDetails(slot)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </TabsContent>

            <TabsContent value="morning" className="mt-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                <AnimatePresence>
                  {sortedMorningSlots.map((slot) => (
                    <EnhancedTimeSlotCard
                      key={slot.id}
                      slot={slot}
                      isSelected={selectedTimeSlot === slot.id.toString()}
                      onSelect={() => handleSelectTimeSlot(slot)}
                      onViewDetails={() => handleViewDetails(slot)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </TabsContent>

            <TabsContent value="afternoon" className="mt-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                <AnimatePresence>
                  {sortedAfternoonSlots.map((slot) => (
                    <EnhancedTimeSlotCard
                      key={slot.id}
                      slot={slot}
                      isSelected={selectedTimeSlot === slot.id.toString()}
                      onSelect={() => handleSelectTimeSlot(slot)}
                      onViewDetails={() => handleViewDetails(slot)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </TabsContent>

            <TabsContent value="evening" className="mt-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                <AnimatePresence>
                  {sortedEveningSlots.map((slot) => (
                    <EnhancedTimeSlotCard
                      key={slot.id}
                      slot={slot}
                      isSelected={selectedTimeSlot === slot.id.toString()}
                      onSelect={() => handleSelectTimeSlot(slot)}
                      onViewDetails={() => handleViewDetails(slot)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </TabsContent>
          </Tabs>

          {/* Dialog hiển thị chi tiết khung giờ */}
          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Chi tiết khung giờ</DialogTitle>
                <DialogDescription>
                  Thông tin chi tiết về khung giờ bạn đã chọn
                </DialogDescription>
              </DialogHeader>

              {selectedSlotDetails && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-medium">
                      {format(new Date(`2000-01-01T${selectedSlotDetails.start_time}`), "HH:mm")} -
                      {format(new Date(`2000-01-01T${selectedSlotDetails.end_time}`), "HH:mm")}
                    </div>
                    <Badge variant={selectedSlotDetails.available ? "outline" : "secondary"}>
                      {selectedSlotDetails.available ? "Còn trống" : "Đã đặt"}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {date ? format(date, "EEEE, dd/MM/yyyy", { locale: vi }) : "Chưa chọn ngày"}
                      </span>
                    </div>

                    {selectedSlotDetails.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedSlotDetails.location}</span>
                      </div>
                    )}

                    {selectedSlotDetails.schedule_type && (
                      <div className="flex items-center gap-2 text-sm">
                        <Info className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Loại lịch: {selectedSlotDetails.schedule_type === 'REGULAR' ? 'Thường xuyên' : 'Đặc biệt'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setShowDetails(false)}>
                      Đóng
                    </Button>
                    <Button
                      onClick={() => {
                        handleSelectTimeSlot(selectedSlotDetails)
                        setShowDetails(false)
                      }}
                      disabled={!selectedSlotDetails.available}
                    >
                      Chọn khung giờ này
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}

interface EnhancedTimeSlotCardProps {
  slot: any
  isSelected: boolean
  onSelect: () => void
  onViewDetails: () => void
}

function EnhancedTimeSlotCard({ slot, isSelected, onSelect, onViewDetails }: EnhancedTimeSlotCardProps) {
  // Format thời gian
  let startTime = "";
  let endTime = "";

  try {
    // Đảm bảo start_time và end_time là chuỗi hợp lệ
    if (typeof slot.start_time === 'string') {
      startTime = format(new Date(`2000-01-01T${slot.start_time}`), "HH:mm")
    } else if (slot.time) {
      // Nếu có trường time, lấy phần đầu
      const timeParts = slot.time.split(' - ');
      startTime = timeParts[0];
    }

    if (typeof slot.end_time === 'string') {
      endTime = format(new Date(`2000-01-01T${slot.end_time}`), "HH:mm")
    } else if (slot.time) {
      // Nếu có trường time, lấy phần sau
      const timeParts = slot.time.split(' - ');
      endTime = timeParts.length > 1 ? timeParts[1] : "";
    }
  } catch (error) {
    console.error('Error formatting time:', error);
    // Sử dụng giá trị mặc định nếu có lỗi
    startTime = slot.time ? slot.time.split(' - ')[0] : "--:--";
    endTime = slot.time && slot.time.includes(' - ') ? slot.time.split(' - ')[1] : "--:--";
  }

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        whileHover={{ scale: slot.available ? 1.03 : 1 }}
      >
        <div
          className={cn(
            "relative flex flex-col rounded-md border p-3 transition-all",
            isSelected
              ? "border-primary bg-primary/5 ring-1 ring-primary"
              : "hover:border-primary/50",
            !slot.available && "cursor-not-allowed opacity-50 bg-muted",
          )}
          onClick={() => (slot.available !== false) && onSelect()}
        >
          <div className="flex justify-between items-center w-full">
            <div className="text-base font-medium">{startTime}</div>
            {slot.schedule_type && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-[10px] h-5 px-1 bg-primary/5">
                    {slot.schedule_type === 'REGULAR' ? 'Thường' : 'Đặc biệt'}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{slot.schedule_type === 'REGULAR' ? 'Lịch thường xuyên' : 'Lịch đặc biệt'}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          <div className="text-sm text-muted-foreground">đến {endTime}</div>

          {slot.location && (
            <div className="mt-1 flex items-center text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="truncate">{slot.location}</span>
            </div>
          )}

          {isSelected && (
            <div className="absolute -top-2 -right-2 rounded-full bg-primary text-primary-foreground p-1 shadow-sm">
              <Check className="h-3 w-3" />
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="mt-2 h-7 text-xs w-full"
            onClick={(e) => {
              e.stopPropagation()
              onViewDetails()
            }}
          >
            Chi tiết
          </Button>
        </div>
      </motion.div>
    </TooltipProvider>
  )
}
