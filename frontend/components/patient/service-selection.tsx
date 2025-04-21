"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Stethoscope, Repeat, MessageSquare, Scissors, Syringe, X, Filter } from "lucide-react"
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

export function ServiceSelection({
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
  const [activeTab, setActiveTab] = useState("departments")

  // Kết hợp khoa và chuyên khoa thành một danh sách duy nhất
  const combinedSpecialties = [
    ...specialties.map(spec => ({
      ...spec,
      type: 'specialty',
      description: spec.description || 'Chuyên khoa y tế'
    })),
    ...departments.map(dept => ({
      ...dept,
      type: 'department',
      description: dept.description || 'Khoa y tế'
    }))
  ].filter(item => item.id !== 'all')

  // Lọc danh sách kết hợp theo từ khóa tìm kiếm
  const filteredSpecialties = combinedSpecialties.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

      {/* Chọn khoa/chuyên khoa */}
      <div className="space-y-2">
        <Label className="text-base">Chọn khoa/chuyên khoa</Label>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm khoa hoặc chuyên khoa..."
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

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="departments" className="flex-1 sm:flex-initial">Khoa</TabsTrigger>
              <TabsTrigger value="specialties" className="flex-1 sm:flex-initial">Chuyên khoa</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Tabs value={activeTab} className="mt-0">
          <TabsContent value="departments">
          {isLoading.departments ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-20 rounded-md" />
              ))}
            </div>
          ) : filteredDepartments.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <Search className="h-8 w-8 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">Không tìm thấy khoa</h3>
              <p className="text-sm text-muted-foreground mt-1">Không có khoa nào phù hợp với từ khóa tìm kiếm</p>
              <Button className="mt-4" variant="outline" onClick={() => setSearchTerm("")}>
                Xóa tìm kiếm
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredDepartments.map((department) => (
                <Card
                  key={department.id}
                  className={cn(
                    "cursor-pointer transition-all hover:border-primary hover:shadow-sm",
                    selectedDepartment === department.id && "border-primary bg-primary/5"
                  )}
                  onClick={() => {
                    onSelectDepartment(department.id)
                    onSelectSpecialty("")
                  }}
                >
                  <CardContent className="p-4">
                    <div className="font-medium">{department.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {department.description}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

          <TabsContent value="specialties">
          {isLoading.specialties ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-20 rounded-md" />
              ))}
            </div>
          ) : filteredSpecialties.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <Search className="h-8 w-8 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">Không tìm thấy chuyên khoa</h3>
              <p className="text-sm text-muted-foreground mt-1">Không có chuyên khoa nào phù hợp với từ khóa tìm kiếm</p>
              <Button className="mt-4" variant="outline" onClick={() => setSearchTerm("")}>
                Xóa tìm kiếm
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredSpecialties.map((specialty) => (
                <Card
                  key={specialty.id}
                  className={cn(
                    "cursor-pointer transition-all hover:border-primary hover:shadow-sm",
                    selectedSpecialty === specialty.id && "border-primary bg-primary/5"
                  )}
                  onClick={() => {
                    onSelectSpecialty(specialty.id)
                    onSelectDepartment("")
                  }}
                >
                  <CardContent className="p-4">
                    <div className="font-medium">{specialty.name}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        </Tabs>
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
