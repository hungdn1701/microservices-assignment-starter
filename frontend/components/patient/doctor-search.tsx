"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, Star, MapPin, Calendar, Clock, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
import { DoctorCard } from "./doctor-card"
import userService from "@/lib/api/user-service"
import appointmentService from "@/lib/api/appointment-service"

interface DoctorSearchProps {
  doctors: any[]
  availableDates: Date[]
  selectedDoctor: string
  selectedDate: Date | undefined
  selectedDepartment: string
  selectedSpecialty: string
  isLoading: {
    doctors: boolean
  }
  onSelectDoctor: (doctorId: string) => void
  onSelectDate: (date: Date) => void
  onFilter: (filters: { specialty?: string; name?: string }) => void
}

export function DoctorSearch({
  doctors,
  availableDates,
  selectedDoctor,
  selectedDate,
  selectedDepartment,
  selectedSpecialty,
  isLoading,
  onSelectDoctor,
  onSelectDate,
  onFilter
}: DoctorSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [specialty, setSpecialty] = useState(selectedSpecialty || "")
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [specialties, setSpecialties] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("all")

  // Tải danh sách chuyên khoa
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        // Sử dụng API mới từ appointment-service
        const specialtiesData = await appointmentService.getSpecialties()
        setSpecialties(specialtiesData)
      } catch (error) {
        console.error("Error fetching specialties:", error)
      }
    }
    fetchSpecialties()
  }, [])

  // Lọc bác sĩ theo tìm kiếm và bộ lọc
  const filteredDoctors = doctors.filter(doctor => {
    // Lọc theo tìm kiếm
    const matchesSearch = searchTerm === "" ||
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())

    // Lọc theo chuyên khoa
    const matchesSpecialty = specialty === "" || specialty === "ALL" || doctor.specialty === specialty

    // Lọc theo tab
    const matchesTab = activeTab === "all" ||
      (activeTab === "top-rated" && doctor.rating >= 4.5) ||
      (activeTab === "available-today" && doctor.availableToday)

    return matchesSearch && matchesSpecialty && matchesTab
  })

  // Thêm bộ lọc
  const addFilter = (type: string, value: string) => {
    if (type === "specialty") {
      setSpecialty(value)
      if (value === "ALL") {
        // Nếu chọn "Tất cả chuyên khoa", xóa bộ lọc chuyên khoa
        setActiveFilters(activeFilters.filter(f => !f.startsWith("Chuyên khoa:")))
      } else {
        // Thêm bộ lọc chuyên khoa mới
        setActiveFilters([...activeFilters.filter(f => !f.startsWith("Chuyên khoa:")), `Chuyên khoa: ${value}`])
      }
    }
  }

  // Xóa bộ lọc
  const removeFilter = (filter: string) => {
    if (filter.startsWith("Chuyên khoa:")) {
      setSpecialty("")
    }
    setActiveFilters(activeFilters.filter(f => f !== filter))
  }

  // Xóa tất cả bộ lọc
  const clearFilters = () => {
    setSearchTerm("")
    setSpecialty("")
    setActiveFilters([])
    setActiveTab("all")
  }

  return (
    <div className="space-y-6">
      {/* Thanh tìm kiếm và bộ lọc */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên bác sĩ hoặc chuyên khoa..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Select value={specialty} onValueChange={(value) => addFilter("specialty", value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chuyên khoa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả chuyên khoa</SelectItem>
              {specialties.map((spec) => (
                <SelectItem key={spec.id} value={spec.name}>
                  {spec.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={clearFilters} disabled={activeFilters.length === 0 && activeTab === "all" && searchTerm === ""}>
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Hiển thị bộ lọc đang áp dụng */}
      {(activeFilters.length > 0 || activeTab !== "all" || searchTerm) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Bộ lọc:</span>

          {searchTerm && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Tìm kiếm: {searchTerm}
              <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0" onClick={() => setSearchTerm("")}>
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {activeTab !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {activeTab === "top-rated" ? "Đánh giá cao" : "Có lịch hôm nay"}
              <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0" onClick={() => setActiveTab("all")}>
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {activeFilters.map((filter) => (
            <Badge key={filter} variant="secondary" className="flex items-center gap-1">
              {filter}
              <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0" onClick={() => removeFilter(filter)}>
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}

          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clearFilters}>
            Xóa tất cả
          </Button>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="all" className="flex-1 sm:flex-initial">Tất cả</TabsTrigger>
          <TabsTrigger value="top-rated" className="flex-1 sm:flex-initial">Đánh giá cao</TabsTrigger>
          <TabsTrigger value="available-today" className="flex-1 sm:flex-initial">Có lịch hôm nay</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Thông tin hướng dẫn */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
        <div className="flex items-start">
          <Calendar className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">Hướng dẫn chọn bác sĩ và ngày khám</h3>
            <p className="text-xs text-blue-700 mt-1">
              1. Chọn bác sĩ phù hợp với nhu cầu của bạn từ danh sách bên dưới<br />
              2. Sau khi chọn bác sĩ, bạn sẽ thấy thông tin về các ngày có lịch trống<br />
              3. Chọn một ngày khám phù hợp với lịch của bạn<br />
              4. Nhấn "Tiếp theo" để chuyển sang bước chọn giờ khám
            </p>
          </div>
        </div>
      </div>

      {/* Danh sách bác sĩ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading.doctors ? (
          // Skeleton loading
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-2 mt-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredDoctors.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <Search className="h-8 w-8 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium">Không tìm thấy bác sĩ</h3>
            <p className="text-sm text-muted-foreground mt-1">Không có bác sĩ nào phù hợp với tiêu chí tìm kiếm của bạn</p>
            <Button className="mt-4" variant="outline" onClick={clearFilters}>
              Xóa bộ lọc
            </Button>
          </div>
        ) : (
          <AnimatePresence>
            {filteredDoctors.map((doctor) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <DoctorCard
                  doctor={doctor}
                  isSelected={selectedDoctor === doctor.id.toString()}
                  availableDates={availableDates}
                  isLoadingTimeSlots={isLoading.doctors}
                  onSelect={onSelectDoctor}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Hướng dẫn chọn ngày */}
      {selectedDoctor && (
        <div className="mt-6 p-4 border rounded-md bg-primary/5">
          <h3 className="text-base font-medium mb-3 flex items-center">
            <Calendar className="h-4 w-4 text-primary mr-2" />
            Chọn ngày khám
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Vui lòng chọn ngày khám phù hợp với lịch của bạn. Các ngày có lịch trống sẽ được hiển thị đậm hơn.
          </p>

          {selectedDate && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-3">
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-600 mr-2" />
                <div className="text-sm font-medium text-green-800">
                  Bạn đã chọn ngày: {format(selectedDate, "EEEE, dd/MM/yyyy", { locale: vi })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
