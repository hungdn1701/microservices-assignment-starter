import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Calendar, Plus, ShoppingCart } from "lucide-react"

export default function PharmacistInventory() {
  const inventory = [
    {
      id: 1,
      name: "Lisinopril 10mg",
      category: "Thuốc hạ huyết áp",
      currentStock: 120,
      minStock: 50,
      maxStock: 200,
      expirationDate: "15/12/2025",
      status: "Bình thường",
      stockPercentage: 60,
    },
    {
      id: 2,
      name: "Metformin 500mg",
      category: "Thuốc tiểu đường",
      currentStock: 35,
      minStock: 40,
      maxStock: 150,
      expirationDate: "30/11/2025",
      status: "Sắp hết",
      stockPercentage: 23,
    },
    {
      id: 3,
      name: "Atorvastatin 20mg",
      category: "Thuốc hạ mỡ máu",
      currentStock: 85,
      minStock: 30,
      maxStock: 120,
      expirationDate: "10/06/2025",
      status: "Sắp hết hạn",
      stockPercentage: 71,
    },
    {
      id: 4,
      name: "Amoxicillin 500mg",
      category: "Kháng sinh",
      currentStock: 15,
      minStock: 30,
      maxStock: 100,
      expirationDate: "20/09/2025",
      status: "Nguy cấp",
      stockPercentage: 15,
    },
    {
      id: 5,
      name: "Ibuprofen 200mg",
      category: "Giảm đau",
      currentStock: 200,
      minStock: 50,
      maxStock: 200,
      expirationDate: "05/10/2025",
      status: "Dư thừa",
      stockPercentage: 100,
    },
  ]

  return (
    <div className="space-y-4">
      {inventory.map((item) => (
        <div key={item.id} className="rounded-lg border p-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{item.name}</h4>
                <Badge
                  variant={
                    item.status === "Nguy cấp" || item.status === "Sắp hết"
                      ? "destructive"
                      : item.status === "Sắp hết hạn"
                        ? "outline"
                        : item.status === "Dư thừa"
                          ? "secondary"
                          : "default"
                  }
                  className={
                    item.status === "Sắp hết hạn"
                      ? "bg-amber-50 text-amber-700 hover:bg-amber-50 hover:text-amber-700"
                      : ""
                  }
                >
                  {item.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{item.category}</p>
            </div>
            <div className="flex items-center gap-2">
              {(item.status === "Nguy cấp" || item.status === "Sắp hết") && (
                <Button variant="outline" size="sm" className="gap-1">
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Đặt hàng
                </Button>
              )}
              <Button variant="outline" size="sm" className="gap-1">
                <Plus className="h-3.5 w-3.5" />
                Thêm kho
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span>
                Tồn kho: {item.currentStock} / {item.maxStock}
              </span>
              <span className="text-muted-foreground">Tối thiểu: {item.minStock}</span>
            </div>
            <Progress
              value={item.stockPercentage}
              className={
                item.status === "Nguy cấp" || item.status === "Sắp hết"
                  ? "bg-red-100"
                  : item.status === "Sắp hết hạn"
                    ? "bg-amber-100"
                    : "bg-gray-100"
              }
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>Hết hạn: {item.expirationDate}</span>
            </div>
            {item.status === "Sắp hết hạn" && (
              <div className="flex items-center gap-1 text-amber-600">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Kiểm tra hạn sử dụng</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
