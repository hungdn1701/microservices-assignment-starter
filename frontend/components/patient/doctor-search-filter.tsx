"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import userService from "@/lib/api/user-service"

interface DoctorSearchFilterProps {
  onFilter: (filters: { specialty?: string; name?: string }) => void
  className?: string
}

export function DoctorSearchFilter({ onFilter, className }: DoctorSearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all")
  const [specialties, setSpecialties] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Lấy danh sách chuyên khoa
  useEffect(() => {
    const fetchSpecialties = async () => {
      setIsLoading(true)
      try {
        const specialtiesResponse = await userService.getSpecialties()
        setSpecialties(specialtiesResponse)
      } catch (error) {
        console.error("Error fetching specialties:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSpecialties()
  }, [])

  const handleFilter = () => {
    const filters: { specialty?: string; name?: string } = {}

    if (selectedSpecialty && selectedSpecialty !== 'all') {
      filters.specialty = selectedSpecialty
    }

    if (searchTerm.trim()) {
      filters.name = searchTerm.trim()
    }

    onFilter(filters)
  }

  return (
    <div className={`${className}`}>
      <div className="bg-muted/30 p-4 rounded-lg border mb-4">
        <h3 className="text-sm font-medium mb-3">Tìm kiếm bác sĩ</h3>
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
          <div className="flex-1">
            <Label htmlFor="search" className="text-xs mb-1 block text-muted-foreground">Tên bác sĩ</Label>
            <div className="relative">
              <Input
                id="search"
                placeholder="Nhập tên bác sĩ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9"
              />
              <div className="absolute left-2.5 top-2.5 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <Label htmlFor="specialty" className="text-xs mb-1 block text-muted-foreground">Chuyên khoa</Label>
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger id="specialty" className="h-9">
                <SelectValue placeholder="Tất cả chuyên khoa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả chuyên khoa</SelectItem>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              variant="default"
              size="sm"
              onClick={handleFilter}
              disabled={isLoading}
              className="h-9 px-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tìm kiếm...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-filter mr-2 h-4 w-4"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                  Tìm kiếm
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
