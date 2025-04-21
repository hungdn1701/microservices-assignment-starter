"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Stethoscope, Repeat, MessageSquare, Scissors, Syringe, X, Filter, Heart, Brain, Bone, Pill, Eye } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface ServiceSelectionProps {
  services: any[]
  departments: any[]
  specialties: any[]
  selectedService: string
  selectedDepartment: string
  selectedSpecialty: string
  symptomDescription: string
  isLoading: {
    services: boolean
    departments: boolean
    specialties: boolean
  }
  onSelectService: (serviceId: string) => void
  onSelectDepartment: (departmentId: string) => void
  onSelectSpecialty: (specialtyId: string) => void
  onUpdateSymptomDescription: (description: string) => void
}

export function EnhancedServiceSelection({
  services,
  departments,
  specialties,
  selectedService,
  selectedDepartment,
  selectedSpecialty,
  symptomDescription,
  isLoading,
  onSelectService,
  onSelectDepartment,
  onSelectSpecialty,
  onUpdateSymptomDescription
}: ServiceSelectionProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Chuẩn bị dữ liệu khoa và chuyên khoa
  const departmentsList = departments
    .filter(dept => dept.id !== 'all')
    .map(dept => ({
      ...dept,
      type: 'department',
      description: dept.description || 'Khoa y tế',
      icon: getDepartmentIcon(dept.id),
      specialties: specialties
        .filter(spec => spec.id !== 'all' && spec.department === dept.id)
        .map(spec => ({
          ...spec,
          type: 'specialty',
          description: spec.description || 'Chuyên khoa y tế',
          icon: getSpecialtyIcon(spec.id)
        }))
    }))

  // Chuyên khoa không thuộc khoa nào
  const independentSpecialties = specialties
    .filter(spec => spec.id !== 'all' && (!spec.department || !departments.find(d => d.id === spec.department)))
    .map(spec => ({
      ...spec,
      type: 'specialty',
      description: spec.description || 'Chuyên khoa y tế',
      icon: getSpecialtyIcon(spec.id)
    }))

  // Lọc danh sách khoa theo từ khóa tìm kiếm
  const filteredDepartments = departmentsList.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    // Hiển thị khoa nếu có chuyên khoa phù hợp với từ khóa
    dept.specialties.some(spec =>
      spec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spec.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  // Lọc danh sách chuyên khoa độc lập theo từ khóa tìm kiếm
  const filteredIndependentSpecialties = independentSpecialties.filter(spec =>
    spec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spec.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Kiểm tra xem có kết quả tìm kiếm nào không
  const hasSearchResults = filteredDepartments.length > 0 || filteredIndependentSpecialties.length > 0

  // Lấy icon tương ứng với loại dịch vụ
  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case "Stethoscope": return <Stethoscope className="h-5 w-5" />
      case "Repeat": return <Repeat className="h-5 w-5" />
      case "MessageSquare": return <MessageSquare className="h-5 w-5" />
      case "Scissors": return <Scissors className="h-5 w-5" />
      case "Syringe": return <Syringe className="h-5 w-5" />
      default: return <Stethoscope className="h-5 w-5" />
    }
  }

  // Lấy icon cho chuyên khoa
  function getSpecialtyIcon(specialtyId: any) {
    if (!specialtyId || typeof specialtyId !== 'string') {
      return <Stethoscope className="h-5 w-5 text-primary" />
    }

    // Xử lý các chuyên khoa mới với tiền tố
    if (specialtyId.startsWith('NOI_')) {
      if (specialtyId === 'NOI_TIM_MACH') return <Heart className="h-5 w-5 text-red-500" />
      if (specialtyId === 'NOI_THAN_KINH') return <Brain className="h-5 w-5 text-blue-500" />
      return <Stethoscope className="h-5 w-5 text-green-500" />
    }

    if (specialtyId.startsWith('NGOAI_')) {
      if (specialtyId === 'NGOAI_CHINH_HINH') return <Bone className="h-5 w-5 text-amber-500" />
      if (specialtyId === 'NGOAI_THAN_KINH') return <Brain className="h-5 w-5 text-purple-500" />
      return <Scissors className="h-5 w-5 text-blue-500" />
    }

    if (specialtyId.startsWith('NHI_')) {
      return <Stethoscope className="h-5 w-5 text-cyan-500" />
    }

    // Xử lý các trường hợp đặc biệt
    switch (specialtyId) {
      case "MAT": return <Eye className="h-5 w-5 text-green-500" />
      case "TAI_MUI_HONG": return <Stethoscope className="h-5 w-5 text-yellow-500" />
      case "RANG_HAM_MAT": return <Stethoscope className="h-5 w-5 text-orange-500" />
      case "UNG_BUOU": return <Stethoscope className="h-5 w-5 text-red-500" />
      default: return <Stethoscope className="h-5 w-5 text-primary" />
    }
  }

  // Lấy icon cho khoa
  function getDepartmentIcon(departmentId: any) {
    if (!departmentId || typeof departmentId !== 'string') {
      return <Stethoscope className="h-5 w-5 text-primary" />
    }

    // Xử lý các khoa mới
    switch (departmentId) {
      case "KHOA_NOI": return <Heart className="h-5 w-5 text-red-500" />
      case "KHOA_NGOAI": return <Scissors className="h-5 w-5 text-blue-500" />
      case "KHOA_SAN": return <Stethoscope className="h-5 w-5 text-pink-500" />
      case "KHOA_NHI": return <Stethoscope className="h-5 w-5 text-cyan-500" />
      case "KHOA_CAP_CUU": return <Stethoscope className="h-5 w-5 text-orange-500" />
      case "KHOA_XET_NGHIEM": return <Stethoscope className="h-5 w-5 text-purple-500" />
      case "KHOA_CHAN_DOAN_HINH_ANH": return <Stethoscope className="h-5 w-5 text-indigo-500" />
      case "KHOA_MAT": return <Eye className="h-5 w-5 text-green-500" />
      case "KHOA_TMH": return <Stethoscope className="h-5 w-5 text-yellow-500" />
      case "KHOA_RHM": return <Stethoscope className="h-5 w-5 text-orange-500" />
      case "KHOA_UNG_BUOU": return <Stethoscope className="h-5 w-5 text-red-500" />
      case "KHOA_HOI_SUC": return <Stethoscope className="h-5 w-5 text-blue-500" />
      default: return <Stethoscope className="h-5 w-5 text-primary" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Chọn loại dịch vụ */}
      <div className="space-y-2">
        <Label className="text-base">Chọn loại dịch vụ</Label>

        {isLoading.services ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-md" />
            ))}
          </div>
        ) : (
          <RadioGroup
            value={selectedService}
            onValueChange={onSelectService}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
          >
            {services.map((service) => (
              <div key={service.id}>
                <RadioGroupItem
                  value={service.id}
                  id={`service-${service.id}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`service-${service.id}`}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary h-full cursor-pointer transition-all",
                    selectedService === service.id && "border-primary bg-primary/5"
                  )}
                >
                  <div className="rounded-full bg-primary/10 p-2 mb-2">
                    {getServiceIcon(service.icon)}
                  </div>
                  <div className="font-medium text-center">{service.name}</div>
                  <div className="text-xs text-muted-foreground text-center mt-1">
                    {service.description}
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
      </div>

      {/* Mô tả triệu chứng */}
      <div className="space-y-2">
        <Label htmlFor="symptoms" className="text-base">Mô tả triệu chứng hoặc lý do khám</Label>
        <Textarea
          id="symptoms"
          placeholder="Mô tả ngắn gọn về triệu chứng hoặc lý do bạn muốn đặt lịch khám..."
          className="min-h-[120px]"
          value={symptomDescription}
          onChange={(e) => onUpdateSymptomDescription(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          Mô tả chi tiết sẽ giúp bác sĩ chuẩn bị tốt hơn cho buổi khám của bạn.
        </p>
      </div>

      {/* Chọn khoa và chuyên khoa */}
      <div className="space-y-4">
        <Label className="text-base">Chọn khoa và chuyên khoa</Label>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm khoa, chuyên khoa hoặc mô tả triệu chứng..."
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
        </div>

        {isLoading.specialties || isLoading.departments ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-md" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : !hasSearchResults ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <Search className="h-8 w-8 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium">Không tìm thấy kết quả</h3>
            <p className="text-sm text-muted-foreground mt-1">Không có khoa hoặc chuyên khoa nào phù hợp với từ khóa tìm kiếm</p>
            <Button className="mt-4" variant="outline" onClick={() => setSearchTerm("")}>Xóa tìm kiếm</Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Hiển thị danh sách khoa và chuyên khoa thuộc khoa */}
            {filteredDepartments.length > 0 && (
              <div className="space-y-6">
                {filteredDepartments.map((dept) => (
                  <div key={dept.id} className="space-y-3">
                    {/* Tiêu đề khoa */}
                    <div
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all",
                        selectedDepartment === dept.id ? "bg-primary/10" : "hover:bg-muted"
                      )}
                      onClick={() => {
                        onSelectDepartment(dept.id)
                        onSelectSpecialty("") // Xóa chuyên khoa đã chọn
                      }}
                    >
                      <div className="rounded-full bg-primary/10 p-2">
                        {dept.icon}
                      </div>
                      <div>
                        <div className="font-medium text-lg">{dept.name}</div>
                        <div className="text-sm text-muted-foreground">{dept.description}</div>
                      </div>
                      {selectedDepartment === dept.id && (
                        <Badge className="ml-auto">Khoa đã chọn</Badge>
                      )}
                    </div>

                    {/* Danh sách chuyên khoa thuộc khoa */}
                    {dept.specialties.length > 0 && (
                      <div className="pl-6 border-l-2 border-muted ml-4">
                        <div className="text-sm font-medium text-muted-foreground mb-2">Chuyên khoa thuộc {dept.name}:</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {dept.specialties.map((spec) => (
                            <Card
                              key={spec.id}
                              className={cn(
                                "cursor-pointer transition-all hover:border-primary hover:shadow-sm",
                                selectedSpecialty === spec.id ? "border-primary bg-primary/5" : ""
                              )}
                              onClick={() => {
                                onSelectSpecialty(spec.id)
                                onSelectDepartment(dept.id) // Chọn khoa tương ứng
                              }}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-center gap-2">
                                  <div className="rounded-full bg-primary/10 p-1.5">
                                    {spec.icon}
                                  </div>
                                  <div>
                                    <div className="font-medium">{spec.name}</div>
                                    <div className="text-xs text-muted-foreground">{spec.description}</div>
                                  </div>
                                  {selectedSpecialty === spec.id && (
                                    <Badge size="sm" className="ml-auto">Chọn</Badge>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Hiển thị danh sách chuyên khoa độc lập */}
            {filteredIndependentSpecialties.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-base font-medium">Các chuyên khoa khác</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredIndependentSpecialties.map((spec) => (
                    <Card
                      key={spec.id}
                      className={cn(
                        "cursor-pointer transition-all hover:border-primary hover:shadow-sm",
                        selectedSpecialty === spec.id ? "border-primary bg-primary/5" : ""
                      )}
                      onClick={() => {
                        onSelectSpecialty(spec.id)
                        onSelectDepartment("") // Xóa khoa đã chọn
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="rounded-full bg-primary/10 p-2">
                            {spec.icon}
                          </div>
                          <div>
                            <div className="font-medium">{spec.name}</div>
                            <div className="text-xs text-muted-foreground">{spec.description}</div>
                          </div>
                          {selectedSpecialty === spec.id && (
                            <Badge size="sm" className="ml-auto">Chọn</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hiển thị lựa chọn đã chọn */}
      {(selectedService || selectedDepartment || selectedSpecialty) && (
        <div className="rounded-md border p-4 bg-muted/30">
          <div className="text-sm font-medium mb-2">Lựa chọn của bạn:</div>
          <div className="flex flex-wrap gap-2">
            {selectedService && (
              <Badge variant="outline" className="bg-primary/10 text-primary">
                Dịch vụ: {services.find(s => s.id === selectedService)?.name || selectedService}
              </Badge>
            )}
            {selectedDepartment && (
              <Badge variant="outline" className="bg-primary/10 text-primary">
                Khoa: {departments.find(d => d.id === selectedDepartment)?.name || selectedDepartment}
              </Badge>
            )}
            {selectedSpecialty && (
              <Badge variant="outline" className="bg-primary/10 text-primary">
                Chuyên khoa: {specialties.find(s => s.id === selectedSpecialty)?.name || selectedSpecialty}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
