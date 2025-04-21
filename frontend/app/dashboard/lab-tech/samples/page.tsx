"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Beaker, Search, Plus, Check, X, Clock } from "lucide-react"
import LaboratoryService from "@/lib/api/laboratory-service"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

export default function SamplesManagementPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [samples, setSamples] = useState<any[]>([])
  const [filteredSamples, setFilteredSamples] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTest, setSelectedTest] = useState<any>(null)
  const [pendingTests, setPendingTests] = useState<any[]>([])

  const [newSample, setNewSample] = useState({
    lab_test: "",
    collected_by: "", // Will be set from current user
    collected_at: new Date().toISOString(),
    sample_type: "BLOOD",
    sample_container: "",
    sample_volume: "",
    status: "COLLECTED",
    notes: "",
  })

  useEffect(() => {
    fetchSamples()
    fetchPendingTests()
  }, [])

  useEffect(() => {
    filterSamples()
  }, [searchTerm, statusFilter, samples])

  const fetchSamples = async () => {
    try {
      setLoading(true)
      const samplesData = await LaboratoryService.getAllSampleCollections()
      setSamples(samplesData)
      setFilteredSamples(samplesData)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching samples:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách mẫu xét nghiệm. Vui lòng thử lại sau.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const fetchPendingTests = async () => {
    try {
      const testsData = await LaboratoryService.getAllLabTests()
      // Filter tests that don't have samples yet
      const pending = testsData.filter(
        (test) => test.status === "ORDERED" && !samples.some((sample) => sample.lab_test === test.id),
      )
      setPendingTests(pending)
    } catch (error) {
      console.error("Error fetching pending tests:", error)
    }
  }

  const filterSamples = () => {
    let filtered = [...samples]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (sample) =>
          sample.sample_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sample.sample_container.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sample.notes?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((sample) => sample.status === statusFilter)
    }

    setFilteredSamples(filtered)
  }

  const handleNewSampleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewSample((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCreateSample = async () => {
    try {
      // Validate required fields
      if (!newSample.lab_test || !newSample.sample_type || !newSample.sample_container) {
        toast({
          title: "Thiếu thông tin",
          description: "Vui lòng nhập đầy đủ thông tin mẫu xét nghiệm.",
          variant: "destructive",
        })
        return
      }

      // Get current user ID
      const currentUser = await LaboratoryService.getCurrentUser()

      // Create sample
      const sampleData = {
        ...newSample,
        collected_by: currentUser.id.toString(),
      }

      await LaboratoryService.createSampleCollection(sampleData)

      // Update lab test status
      await LaboratoryService.updateLabTest(Number.parseInt(newSample.lab_test), {
        status: "SAMPLE_COLLECTED",
      })

      toast({
        title: "Thành công",
        description: "Đã tạo mẫu xét nghiệm thành công",
      })

      // Reset form and refresh data
      setNewSample({
        lab_test: "",
        collected_by: "",
        collected_at: new Date().toISOString(),
        sample_type: "BLOOD",
        sample_container: "",
        sample_volume: "",
        status: "COLLECTED",
        notes: "",
      })

      setIsDialogOpen(false)
      fetchSamples()
      fetchPendingTests()
    } catch (error) {
      console.error("Error creating sample:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tạo mẫu xét nghiệm. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateSampleStatus = async (sampleId: number, newStatus: string) => {
    try {
      // Update sample status
      await LaboratoryService.updateSampleCollection(sampleId, {
        status: newStatus,
      })

      // If sample is processed, update lab test status
      const sample = samples.find((s) => s.id === sampleId)
      if (newStatus === "PROCESSED" && sample) {
        await LaboratoryService.updateLabTest(sample.lab_test, {
          status: "IN_PROGRESS",
        })
      }

      toast({
        title: "Thành công",
        description: "Đã cập nhật trạng thái mẫu xét nghiệm",
      })

      fetchSamples()
    } catch (error) {
      console.error("Error updating sample status:", error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái mẫu. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    }
  }

  const openCreateDialog = (test: any) => {
    setSelectedTest(test)
    setNewSample((prev) => ({
      ...prev,
      lab_test: test.id.toString(),
    }))
    setIsDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COLLECTED":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Đã thu thập
          </Badge>
        )
      case "PROCESSING":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
            Đang xử lý
          </Badge>
        )
      case "PROCESSED":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Đã xử lý
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700">
            Bị từ chối
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Quản lý mẫu xét nghiệm</h1>
          <p className="text-muted-foreground">Quản lý thu thập và xử lý mẫu xét nghiệm</p>
        </div>
      </div>

      <Tabs defaultValue="samples">
        <TabsList className="mb-4">
          <TabsTrigger value="samples">Mẫu xét nghiệm</TabsTrigger>
          <TabsTrigger value="pending">Chờ thu thập ({pendingTests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="samples">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách mẫu xét nghiệm</CardTitle>
              <CardDescription>Quản lý tất cả các mẫu xét nghiệm</CardDescription>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm mẫu xét nghiệm..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Lọc theo trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="COLLECTED">Đã thu thập</SelectItem>
                    <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
                    <SelectItem value="PROCESSED">Đã xử lý</SelectItem>
                    <SelectItem value="REJECTED">Bị từ chối</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Beaker className="h-8 w-8 animate-pulse text-muted-foreground" />
                </div>
              ) : filteredSamples.length === 0 ? (
                <div className="text-center py-8">
                  <Beaker className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Không có mẫu xét nghiệm nào</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {searchTerm || statusFilter !== "all"
                      ? "Không tìm thấy mẫu xét nghiệm phù hợp với bộ lọc"
                      : "Chưa có mẫu xét nghiệm nào được tạo"}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã mẫu</TableHead>
                      <TableHead>Loại mẫu</TableHead>
                      <TableHead>Thông tin mẫu</TableHead>
                      <TableHead>Thời gian thu thập</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSamples.map((sample) => (
                      <TableRow key={sample.id}>
                        <TableCell className="font-medium">{sample.id}</TableCell>
                        <TableCell>{sample.sample_type}</TableCell>
                        <TableCell>
                          <div>
                            <p>{sample.sample_container}</p>
                            <p className="text-xs text-muted-foreground">{sample.sample_volume}</p>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(sample.collected_at).toLocaleString("vi-VN")}</TableCell>
                        <TableCell>{getStatusBadge(sample.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {sample.status === "COLLECTED" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateSampleStatus(sample.id, "PROCESSING")}
                                >
                                  <Clock className="h-4 w-4 mr-1" />
                                  Xử lý
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-500 border-red-200 hover:bg-red-50"
                                  onClick={() => handleUpdateSampleStatus(sample.id, "REJECTED")}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Từ chối
                                </Button>
                              </>
                            )}
                            {sample.status === "PROCESSING" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-500 border-green-200 hover:bg-green-50"
                                onClick={() => handleUpdateSampleStatus(sample.id, "PROCESSED")}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Hoàn thành
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/dashboard/lab-tech/samples/${sample.id}`)}
                            >
                              Chi tiết
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Xét nghiệm chờ thu thập mẫu</CardTitle>
              <CardDescription>Danh sách các xét nghiệm cần thu thập mẫu</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingTests.length === 0 ? (
                <div className="text-center py-8">
                  <Check className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-medium">Không có xét nghiệm nào đang chờ</h3>
                  <p className="text-sm text-muted-foreground mt-1">Tất cả các xét nghiệm đã được thu thập mẫu</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã xét nghiệm</TableHead>
                      <TableHead>Bệnh nhân</TableHead>
                      <TableHead>Loại xét nghiệm</TableHead>
                      <TableHead>Thời gian yêu cầu</TableHead>
                      <TableHead>Độ ưu tiên</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingTests.map((test) => (
                      <TableRow key={test.id}>
                        <TableCell className="font-medium">{test.id}</TableCell>
                        <TableCell>
                          {test.patient?.first_name} {test.patient?.last_name}
                        </TableCell>
                        <TableCell>{test.test_type_details?.name || test.test_name}</TableCell>
                        <TableCell>{new Date(test.ordered_at).toLocaleString("vi-VN")}</TableCell>
                        <TableCell>
                          {test.priority === "URGENT" ? (
                            <Badge variant="destructive">Khẩn cấp</Badge>
                          ) : test.priority === "HIGH" ? (
                            <Badge variant="secondary">Cao</Badge>
                          ) : (
                            <Badge variant="outline">Thường</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => openCreateDialog(test)}>
                            <Plus className="h-4 w-4 mr-1" />
                            Thu thập mẫu
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Thu thập mẫu xét nghiệm mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin mẫu xét nghiệm cho yêu cầu xét nghiệm #{selectedTest?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sample_type">Loại mẫu</Label>
                <Select
                  value={newSample.sample_type}
                  onValueChange={(value) => setNewSample({ ...newSample, sample_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại mẫu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BLOOD">Máu</SelectItem>
                    <SelectItem value="URINE">Nước tiểu</SelectItem>
                    <SelectItem value="STOOL">Phân</SelectItem>
                    <SelectItem value="SPUTUM">Đờm</SelectItem>
                    <SelectItem value="TISSUE">Mô</SelectItem>
                    <SelectItem value="CSF">Dịch não tủy</SelectItem>
                    <SelectItem value="OTHER">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="collected_at">Thời gian thu thập</Label>
                <Input
                  type="datetime-local"
                  id="collected_at"
                  name="collected_at"
                  value={newSample.collected_at.slice(0, 16)}
                  onChange={handleNewSampleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sample_container">Loại ống đựng</Label>
                <Input
                  id="sample_container"
                  name="sample_container"
                  value={newSample.sample_container}
                  onChange={handleNewSampleChange}
                  placeholder="Ví dụ: Ống EDTA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sample_volume">Thể tích mẫu</Label>
                <Input
                  id="sample_volume"
                  name="sample_volume"
                  value={newSample.sample_volume}
                  onChange={handleNewSampleChange}
                  placeholder="Ví dụ: 5ml"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                name="notes"
                value={newSample.notes}
                onChange={handleNewSampleChange}
                placeholder="Ghi chú về mẫu xét nghiệm"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreateSample}>Lưu mẫu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
