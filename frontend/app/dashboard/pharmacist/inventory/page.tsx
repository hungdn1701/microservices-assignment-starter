"use client"

import { useState } from "react"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Search, RefreshCw } from "lucide-react"

// Giả lập dữ liệu thuốc trong kho
const inventoryData = [
  {
    id: "MED001",
    name: "Paracetamol",
    category: "Giảm đau",
    dosage: "500mg",
    form: "Viên",
    stock: 1250,
    unit: "Viên",
    expiryDate: "12/2024",
    supplier: "Dược phẩm ABC",
    status: "inStock",
  },
  {
    id: "MED002",
    name: "Amoxicillin",
    category: "Kháng sinh",
    dosage: "500mg",
    form: "Viên",
    stock: 850,
    unit: "Viên",
    expiryDate: "06/2024",
    supplier: "Dược phẩm XYZ",
    status: "inStock",
  },
  {
    id: "MED003",
    name: "Omeprazole",
    category: "Dạ dày",
    dosage: "20mg",
    form: "Viên",
    stock: 320,
    unit: "Viên",
    expiryDate: "09/2024",
    supplier: "Dược phẩm DEF",
    status: "inStock",
  },
  {
    id: "MED004",
    name: "Losartan",
    category: "Huyết áp",
    dosage: "50mg",
    form: "Viên",
    stock: 120,
    unit: "Viên",
    expiryDate: "03/2024",
    supplier: "Dược phẩm GHI",
    status: "lowStock",
  },
  {
    id: "MED005",
    name: "Insulin",
    category: "Đái tháo đường",
    dosage: "100IU/ml",
    form: "Dung dịch",
    stock: 45,
  },
]

const InventoryPage = () => {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [open, setOpen] = useState(false)

  const columns = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "name",
      header: "Tên thuốc",
    },
    {
      accessorKey: "category",
      header: "Loại",
    },
    {
      accessorKey: "dosage",
      header: "Hàm lượng",
    },
    {
      accessorKey: "form",
      header: "Dạng bào chế",
    },
    {
      accessorKey: "stock",
      header: "Số lượng",
    },
    {
      accessorKey: "unit",
      header: "Đơn vị",
    },
    {
      accessorKey: "expiryDate",
      header: "Hạn sử dụng",
    },
    {
      accessorKey: "supplier",
      header: "Nhà cung cấp",
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => <StatusBadge status={row.status} />,
    },
  ]

  const filteredData = inventoryData.filter((item) => {
    const searchRegex = new RegExp(search, "i")
    const statusMatch = status ? item.status === status : true
    return searchRegex.test(item.name) && statusMatch
  })

  return (
    <PageContainer>
      <PageHeader title="Quản lý kho thuốc">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm thuốc
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Thêm thuốc mới</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Tên thuốc
                </Label>
                <Input id="name" placeholder="Tên thuốc" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Loại
                </Label>
                <Input id="category" placeholder="Loại" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dosage" className="text-right">
                  Hàm lượng
                </Label>
                <Input id="dosage" placeholder="Hàm lượng" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="form" className="text-right">
                  Dạng bào chế
                </Label>
                <Input id="form" placeholder="Dạng bào chế" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stock" className="text-right">
                  Số lượng
                </Label>
                <Input id="stock" placeholder="Số lượng" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="unit" className="text-right">
                  Đơn vị
                </Label>
                <Input id="unit" placeholder="Đơn vị" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="expiryDate" className="text-right">
                  Hạn sử dụng
                </Label>
                <Input id="expiryDate" placeholder="Hạn sử dụng" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="supplier" className="text-right">
                  Nhà cung cấp
                </Label>
                <Input id="supplier" placeholder="Nhà cung cấp" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Thêm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Danh sách thuốc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Input
                type="search"
                placeholder="Tìm kiếm thuốc..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search className="h-4 w-4 -ml-6 text-gray-500" />
            </div>
            <Select onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="inStock">Còn hàng</SelectItem>
                <SelectItem value="lowStock">Sắp hết hàng</SelectItem>
                <SelectItem value="outOfStock">Hết hàng</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Làm mới
            </Button>
          </div>
          <DataTable columns={columns} data={filteredData} />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

export default InventoryPage
