import Link from "next/link"
import { HeartPulse } from "lucide-react"
import { cn } from "@/lib/utils"

interface AppFooterProps {
  className?: string
}

export function AppFooter({ className }: AppFooterProps) {
  return (
    <footer className={cn("border-t bg-background", className)}>
      <div className="container mx-auto px-4 py-6 md:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <HeartPulse className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">Hệ thống Y tế</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Cung cấp dịch vụ chăm sóc sức khỏe toàn diện và chất lượng cao cho mọi người.
            </p>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-medium">Dịch vụ</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  Đặt lịch khám
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  Tư vấn trực tuyến
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  Xét nghiệm
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  Dược phẩm
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-medium">Hỗ trợ</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  Trung tâm hỗ trợ
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-medium">Liên hệ</h3>
            <address className="not-italic">
              <p className="text-sm text-muted-foreground">
                123 Đường Y Tế, Quận Khỏe Mạnh
                <br />
                Thành phố Hồ Chí Minh, Việt Nam
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Email: info@hethongyte.vn
                <br />
                Điện thoại: (028) 1234 5678
              </p>
            </address>
          </div>
        </div>
        <div className="mt-8 border-t pt-6">
          <p className="text-center text-sm text-muted-foreground">© 2025 Hệ thống Y tế. Đã đăng ký bản quyền.</p>
        </div>
      </div>
    </footer>
  )
}
