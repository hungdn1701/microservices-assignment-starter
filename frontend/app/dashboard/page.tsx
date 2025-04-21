"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Heart } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Giả lập kiểm tra vai trò người dùng
    // Trong thực tế, bạn sẽ lấy thông tin này từ API hoặc trạng thái xác thực
    const checkUserRole = async () => {
      try {
        // Giả lập gọi API để lấy thông tin người dùng
        await new Promise((resolve) => setTimeout(resolve, 1500))
        
        // Theo mặc định, chuyển hướng đến dashboard của bệnh nhân
        // Trong thực tế, bạn sẽ lấy vai trò từ API hoặc localStorage
        const role = localStorage.getItem("userRole") || "patient"
        setUserRole(role)
        
        // Chuyển hướng người dùng đến dashboard phù hợp
        switch (role) {
          case "patient":
            router.push("/dashboard/patient")
            break
          case "doctor":
            router.push("/dashboard/doctor")
            break
          case "pharmacist":
            router.push("/dashboard/pharmacist")
            break
          case "insurance":
            router.push("/dashboard/insurance")
            break
          case "admin":
            router.push("/dashboard/admin")
            break
          case "lab":
            router.push("/dashboard/lab")
            break
          default:
            router.push("/dashboard/patient")
        }
      } catch (err) {
        console.error("Lỗi khi kiểm tra vai trò người dùng:", err)
        setError("Có lỗi xảy ra. Vui lòng thử lại sau.")
        setLoading(false)
      }
    }

    checkUserRole()
  }, [router])

  // Hiển thị màn hình loading khi đang kiểm tra vai trò và chuyển hướng
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      {loading && (
        <div className="flex flex-col items-center justify-center space-y-4">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 360]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "loop"
            }}
            className="text-primary"
          >
            <Heart className="h-16 w-16" />
          </motion.div>
          <h1 className="text-2xl font-bold">Đang chuyển hướng...</h1>
          <p className="text-muted-foreground">Vui lòng đợi trong giây lát</p>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8 text-destructive"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Lỗi</h1>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Thử lại
          </button>
        </div>
      )}
    </div>
  )
}