"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Check, Loader2 } from "lucide-react"
import { format, isSameDay } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface DoctorCardProps {
  doctor: any
  isSelected: boolean
  availableDates: Date[]
  isLoadingTimeSlots: boolean
  onSelect: (doctorId: string) => void
}

export function DoctorCard({ doctor, isSelected, availableDates, isLoadingTimeSlots, onSelect }: DoctorCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        "flex flex-col rounded-md border p-4 transition-all cursor-pointer hover:shadow-md",
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "hover:border-primary/50",
      )}
      onClick={() => onSelect(doctor.id.toString())}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="relative">
            <img
              src={doctor.avatar || "/placeholder.svg"}
              alt={doctor.name}
              className="h-16 w-16 rounded-full object-cover border-2 border-background shadow-sm"
            />
            {isSelected && (
              <div className="absolute -bottom-1 -right-1 rounded-full bg-primary text-primary-foreground p-0.5 shadow-sm">
                <Check className="h-3.5 w-3.5" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="font-medium text-base">{doctor.name}</div>
            <div className="text-sm font-medium text-primary">{doctor.specialty}</div>

            <div className="flex flex-wrap gap-2 mt-2">
              {/* Hiển thị thông tin kinh nghiệm */}
              {doctor.experience && (
                <div className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                  <span className="font-medium">Kinh nghiệm:</span> {doctor.experience} năm
                </div>
              )}

              {/* Hiển thị thông tin khoa */}
              {doctor.department && doctor.department !== 'Chưa cập nhật' && (
                <div className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                  <span className="font-medium">Khoa:</span> {doctor.department}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {/* Hiển thị số ngày có lịch trống */}
              {availableDates.length > 0 && (
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                  {availableDates.length} ngày có lịch trống
                </Badge>
              )}

              {/* Hiển thị số khung giờ trống nếu có */}
              {doctor.availableSlots > 0 && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {doctor.availableSlots} khung giờ trống
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Hiển thị thông tin lịch làm việc của bác sĩ khi được chọn */}
        {isSelected && (
          <div className="mt-3 pt-3 border-t border-dashed border-primary/20">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium text-primary">Thông tin lịch làm việc</div>
              {doctor.biography && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      Xem chi tiết
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Thông tin bác sĩ</DialogTitle>
                      <DialogDescription>
                        Thông tin chi tiết về bác sĩ {doctor.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-start gap-4 py-4">
                      <img
                        src={doctor.avatar || "/placeholder.svg"}
                        alt={doctor.name}
                        className="h-24 w-24 rounded-md object-cover border shadow-sm"
                      />
                      <div>
                        <h3 className="font-medium text-lg">{doctor.name}</h3>
                        <p className="text-sm text-primary font-medium">{doctor.specialty}</p>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
                          <div>
                            <h4 className="text-sm font-medium">Chuyên khoa</h4>
                            <p className="text-sm">{doctor.specialty}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Khoa</h4>
                            <p className="text-sm">{doctor.department}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Kinh nghiệm</h4>
                            <p className="text-sm">{doctor.experience} năm</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Học vấn</h4>
                            <p className="text-sm">{doctor.education || "Chưa cập nhật"}</p>
                          </div>
                        </div>

                        {doctor.biography && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium">Tiểu sử</h4>
                            <p className="text-sm whitespace-pre-line">{doctor.biography}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {isLoadingTimeSlots ? (
              <div className="flex items-center justify-center py-3 bg-muted/20 rounded-md">
                <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
                <span className="text-sm text-muted-foreground">Lấy thông tin lịch làm việc...</span>
              </div>
            ) : availableDates.length > 0 ? (
              <div>
                <div className="mb-2">
                  <div className="text-xs font-medium text-muted-foreground mb-1">Ngày làm việc trong tuần:</div>
                  <div className="flex flex-wrap gap-1">
                    {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'].map((day, index) => {
                      // Kiểm tra xem ngày này có trong danh sách ngày có sẵn không
                      const hasAvailability = availableDates.some(d => d.getDay() === (index + 1) % 7)
                      return (
                        <Badge key={index} variant="outline"
                          className={cn(
                            "text-[10px] h-5 px-1",
                            hasAvailability
                              ? "bg-primary/10 text-primary border-primary/20"
                              : "bg-muted text-muted-foreground"
                          )}>
                          {day}
                        </Badge>
                      )
                    })}
                  </div>
                </div>

                {/* Hiển thị các ngày có sẵn trong tháng hiện tại */}
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">Ngày có lịch trống trong tháng:</div>
                  <div className="flex flex-wrap gap-1">
                    {availableDates
                      .filter(d => d.getMonth() === new Date().getMonth())
                      .slice(0, 5) // Chỉ hiển thị tối đa 5 ngày để tránh quá dài
                      .map((d, i) => (
                        <Badge key={i} variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {format(d, 'dd/MM')}
                        </Badge>
                      ))}
                    {availableDates.filter(d => d.getMonth() === new Date().getMonth()).length > 5 && (
                      <Badge variant="outline" className="bg-muted text-muted-foreground">
                        +{availableDates.filter(d => d.getMonth() === new Date().getMonth()).length - 5}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground bg-muted/20 p-3 rounded-md text-center">
                Không có lịch làm việc trong thời gian tới
              </div>
            )}
          </div>
        )}
      </div>

      <input
        type="radio"
        name="doctor"
        value={doctor.id.toString()}
        checked={isSelected}
        onChange={() => onSelect(doctor.id.toString())}
        className="sr-only"
      />
    </motion.div>
  )
}
