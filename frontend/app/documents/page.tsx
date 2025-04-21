"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { FileText, Upload, Check, Download, Eye, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/providers/auth-provider"
import UserService from "@/lib/api/user-service"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface Document {
  id: number
  user: number
  document_type: string
  file: string
  description: string
  is_verified: boolean
  verification_notes: string
  uploaded_at: string
  verified_at: string
}

export default function DocumentsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [documents, setDocuments] = useState<Document[]>([])
  const [error, setError] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true)
      try {
        const data = await UserService.getDocuments()
        setDocuments(data)
      } catch (error) {
        console.error("Lỗi khi tải tài liệu:", error)
        setError("Không thể tải tài liệu. Vui lòng thử lại sau.")
        toast({
          title: "Lỗi",
          description: "Không thể tải tài liệu",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocuments()
  }, [toast])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile || !documentType) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn tệp và loại tài liệu",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("document_type", documentType)
      formData.append("description", description)

      const uploadedDocument = await UserService.uploadDocument(formData)
      setDocuments([uploadedDocument, ...documents])
      setUploadOpen(false)
      setSelectedFile(null)
      setDocumentType("")
      setDescription("")
      toast({
        title: "Thành công",
        description: "Tài liệu đã được tải lên",
      })
    } catch (error) {
      console.error("Lỗi khi tải lên tài liệu:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải lên tài liệu. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case "IDENTIFICATION":
        return "Giấy tờ tùy thân"
      case "MEDICAL":
        return "Hồ sơ y tế"
      case "INSURANCE":
        return "Bảo hiểm"
      case "PRESCRIPTION":
        return "Đơn thuốc"
      case "LAB_RESULT":
        return "Kết quả xét nghiệm"
      case "OTHER":
        return "Khác"
      default:
        return type
    }
  }

  const verifiedDocuments = documents.filter((doc) => doc.is_verified)
  const pendingDocuments = documents.filter((doc) => !doc.is_verified)

  return (
    <div className="container py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tài liệu</h1>
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Tải lên tài liệu
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tải lên tài liệu mới</DialogTitle>
              <DialogDescription>Tải lên tài liệu của bạn để lưu trữ và xác minh.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="document-type">Loại tài liệu</Label>
                <Select value={documentType} onValueChange={setDocumentType} required>
                  <SelectTrigger id="document-type">
                    <SelectValue placeholder="Chọn loại tài liệu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IDENTIFICATION">Giấy tờ tùy thân</SelectItem>
                    <SelectItem value="MEDICAL">Hồ sơ y tế</SelectItem>
                    <SelectItem value="INSURANCE">Bảo hiểm</SelectItem>
                    <SelectItem value="PRESCRIPTION">Đơn thuốc</SelectItem>
                    <SelectItem value="LAB_RESULT">Kết quả xét nghiệm</SelectItem>
                    <SelectItem value="OTHER">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  placeholder="Nhập mô tả cho tài liệu"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">Tệp</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  required
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                {selectedFile && (
                  <p className="text-xs text-muted-foreground">
                    Đã chọn: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setUploadOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? "Đang tải lên..." : "Tải lên"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="verified">
            Đã xác minh <Badge className="ml-2">{verifiedDocuments.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Chờ xác minh <Badge className="ml-2">{pendingDocuments.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="py-4 text-center text-red-500">{error}</div>
          ) : documents.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">Không có tài liệu nào</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {documents.map((document) => (
                <Card key={document.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <div>
                            <h3 className="font-medium">{getDocumentTypeLabel(document.document_type)}</h3>
                            <p className="text-xs text-muted-foreground">Tải lên: {formatDate(document.uploaded_at)}</p>
                          </div>
                        </div>
                        <Badge
                          variant={document.is_verified ? "default" : "outline"}
                          className={document.is_verified ? "bg-green-100 text-green-800" : ""}
                        >
                          {document.is_verified ? (
                            <span className="flex items-center gap-1">
                              <Check className="h-3 w-3" /> Đã xác minh
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Chờ xác minh
                            </span>
                          )}
                        </Badge>
                      </div>
                      {document.description && <p className="text-sm text-muted-foreground">{document.description}</p>}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          <span>Xem</span>
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 gap-1">
                          <Download className="h-3.5 w-3.5" />
                          <span>Tải xuống</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="verified" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="py-4 text-center text-red-500">{error}</div>
          ) : verifiedDocuments.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">Không có tài liệu đã xác minh</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {verifiedDocuments.map((document) => (
                <Card key={document.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <div>
                            <h3 className="font-medium">{getDocumentTypeLabel(document.document_type)}</h3>
                            <p className="text-xs text-muted-foreground">Tải lên: {formatDate(document.uploaded_at)}</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          <span className="flex items-center gap-1">
                            <Check className="h-3 w-3" /> Đã xác minh
                          </span>
                        </Badge>
                      </div>
                      {document.description && <p className="text-sm text-muted-foreground">{document.description}</p>}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          <span>Xem</span>
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 gap-1">
                          <Download className="h-3.5 w-3.5" />
                          <span>Tải xuống</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="py-4 text-center text-red-500">{error}</div>
          ) : pendingDocuments.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">Không có tài liệu chờ xác minh</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingDocuments.map((document) => (
                <Card key={document.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <div>
                            <h3 className="font-medium">{getDocumentTypeLabel(document.document_type)}</h3>
                            <p className="text-xs text-muted-foreground">Tải lên: {formatDate(document.uploaded_at)}</p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Chờ xác minh
                          </span>
                        </Badge>
                      </div>
                      {document.description && <p className="text-sm text-muted-foreground">{document.description}</p>}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          <span>Xem</span>
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 gap-1">
                          <Download className="h-3.5 w-3.5" />
                          <span>Tải xuống</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
