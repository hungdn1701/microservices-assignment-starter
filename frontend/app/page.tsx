"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Heart, Shield, Activity, Users, Calendar, FileText, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const [isHovered, setIsHovered] = useState<number | null>(null)

  const features = [
    {
      icon: <Calendar className="h-10 w-10 text-primary" />,
      title: "Đặt lịch hẹn trực tuyến",
      description: "Dễ dàng đặt lịch hẹn với bác sĩ mọi lúc, mọi nơi thông qua hệ thống đặt lịch trực tuyến.",
    },
    {
      icon: <FileText className="h-10 w-10 text-primary" />,
      title: "Hồ sơ y tế điện tử",
      description: "Truy cập hồ sơ y tế của bạn bất cứ khi nào, theo dõi lịch sử khám chữa bệnh và đơn thuốc.",
    },
    {
      icon: <Activity className="h-10 w-10 text-primary" />,
      title: "Theo dõi sức khỏe",
      description: "Theo dõi các chỉ số sức khỏe quan trọng và nhận thông báo khi có bất thường.",
    },
    {
      icon: <Shield className="h-10 w-10 text-primary" />,
      title: "Bảo mật thông tin",
      description: "Thông tin y tế của bạn được bảo mật tuyệt đối với hệ thống mã hóa tiên tiến.",
    },
  ]

  const services = [
    {
      title: "Khám bệnh tổng quát",
      description: "Kiểm tra sức khỏe toàn diện với các bác sĩ chuyên khoa hàng đầu.",
      image: "/services/general-checkup.svg",
    },
    {
      title: "Xét nghiệm chuyên sâu",
      description: "Hệ thống xét nghiệm hiện đại với kết quả chính xác và nhanh chóng.",
      image: "/services/lab-tests.svg",
    },
    {
      title: "Tư vấn dinh dưỡng",
      description: "Nhận tư vấn về chế độ dinh dưỡng phù hợp với tình trạng sức khỏe của bạn.",
      image: "/services/nutrition-advice.svg",
    },
  ]

  const testimonials = [
    {
      content: "Hệ thống đặt lịch trực tuyến giúp tôi tiết kiệm thời gian và dễ dàng theo dõi lịch khám.",
      author: "Nguyễn Văn A",
      role: "Bệnh nhân",
    },
    {
      content: "Tôi có thể truy cập hồ sơ y tế của mình bất cứ lúc nào, rất tiện lợi và an toàn.",
      author: "Trần Thị B",
      role: "Bệnh nhân",
    },
    {
      content: "Hệ thống giúp tôi quản lý bệnh nhân hiệu quả hơn và cải thiện chất lượng chăm sóc.",
      author: "BS. Lê Văn C",
      role: "Bác sĩ Nội khoa",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Hệ Thống Y Tế</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary">
              Tính năng
            </Link>
            <Link href="#services" className="text-sm font-medium hover:text-primary">
              Dịch vụ
            </Link>
            <Link href="#testimonials" className="text-sm font-medium hover:text-primary">
              Đánh giá
            </Link>
            <Link href="#contact" className="text-sm font-medium hover:text-primary">
              Liên hệ
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="outline">Đăng nhập</Button>
            </Link>
            <Link href="/register">
              <Button>Đăng ký</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container relative z-10">
          <div className="grid gap-8 md:grid-cols-2 md:gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col justify-center space-y-4"
            >
              <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                Chăm sóc sức khỏe thông minh
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Hệ thống y tế <span className="text-primary">thông minh</span> cho cuộc sống khỏe mạnh
              </h1>
              <p className="text-xl text-muted-foreground">
                Quản lý sức khỏe của bạn một cách hiệu quả với hệ thống y tế toàn diện, kết nối bệnh nhân với bác sĩ và
                dịch vụ y tế.
              </p>
              <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                <Link href="/register">
                  <Button size="lg" className="group">
                    Bắt đầu ngay
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="outline">
                    Khám phá hệ thống
                  </Button>
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex items-center justify-center"
            >
              <div className="relative h-[400px] w-[400px]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-64 w-64 rounded-full bg-primary/20 animate-pulse" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-48 w-48 rounded-full bg-primary/30 animate-pulse [animation-delay:750ms]" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Heart className="h-24 w-24 text-primary animate-pulse [animation-delay:1500ms]" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="absolute inset-x-0 top-0 -z-10 h-16 bg-gradient-to-b from-background to-transparent" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/50">
        <div className="container">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-8 md:grid-cols-4"
          >
            <motion.div variants={itemVariants} className="flex flex-col items-center">
              <span className="text-4xl font-bold text-primary">10+</span>
              <span className="text-sm text-muted-foreground">Năm kinh nghiệm</span>
            </motion.div>
            <motion.div variants={itemVariants} className="flex flex-col items-center">
              <span className="text-4xl font-bold text-primary">50+</span>
              <span className="text-sm text-muted-foreground">Bác sĩ chuyên khoa</span>
            </motion.div>
            <motion.div variants={itemVariants} className="flex flex-col items-center">
              <span className="text-4xl font-bold text-primary">10k+</span>
              <span className="text-sm text-muted-foreground">Bệnh nhân hài lòng</span>
            </motion.div>
            <motion.div variants={itemVariants} className="flex flex-col items-center">
              <span className="text-4xl font-bold text-primary">24/7</span>
              <span className="text-sm text-muted-foreground">Hỗ trợ trực tuyến</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Tính năng nổi bật</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Khám phá các tính năng giúp quản lý sức khỏe của bạn hiệu quả hơn
            </p>
          </motion.div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="flex flex-col items-center rounded-lg border bg-card p-6 text-center shadow-sm transition-all hover:shadow-md"
              >
                <div className="mb-4 rounded-full bg-primary/10 p-3">{feature.icon}</div>
                <h3 className="mb-2 text-xl font-medium">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-muted/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Dịch vụ y tế</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Chúng tôi cung cấp các dịch vụ y tế chất lượng cao với đội ngũ bác sĩ chuyên nghiệp
            </p>
          </motion.div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-3"
          >
            {services.map((service, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="group overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md"
              >
                <div className="overflow-hidden">
                  <img
                    src={service.image || "/placeholder.svg"}
                    alt={service.title}
                    className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <h3 className="mb-2 text-xl font-medium">{service.title}</h3>
                  <p className="mb-4 text-sm text-muted-foreground">{service.description}</p>
                  <Button variant="outline" size="sm" className="group">
                    Tìm hiểu thêm
                    <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Khách hàng nói gì về chúng tôi</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Những đánh giá từ bệnh nhân và bác sĩ sử dụng hệ thống của chúng tôi
            </p>
          </motion.div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-3"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="mb-4 text-lg italic text-muted-foreground">"{testimonial.content}"</div>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/10">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="flex flex-col items-center text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Sẵn sàng bắt đầu?</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
              Đăng ký ngay hôm nay để trải nghiệm hệ thống y tế thông minh và quản lý sức khỏe của bạn hiệu quả hơn.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="group">
                  Đăng ký miễn phí
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline">
                  Liên hệ với chúng tôi
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Liên hệ với chúng tôi</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Có câu hỏi? Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn
            </p>
          </motion.div>
          <div className="grid gap-8 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
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
                    className="h-5 w-5 text-primary"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Điện thoại</h3>
                  <p className="text-sm text-muted-foreground">+84 123 456 789</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
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
                    className="h-5 w-5 text-primary"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-sm text-muted-foreground">info@hethongyte.vn</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
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
                    className="h-5 w-5 text-primary"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Địa chỉ</h3>
                  <p className="text-sm text-muted-foreground">123 Đường ABC, Quận 1, TP.HCM</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="rounded-lg border bg-card p-6 shadow-sm"
            >
              <form className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Họ và tên
                    </label>
                    <input
                      id="name"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">
                    Tiêu đề
                  </label>
                  <input
                    id="subject"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Tiêu đề của bạn"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Nội dung
                  </label>
                  <textarea
                    id="message"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Nội dung tin nhắn của bạn"
                    rows={4}
                  ></textarea>
                </div>
                <Button className="w-full">Gửi tin nhắn</Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Heart className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">Hệ Thống Y Tế</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Hệ thống y tế thông minh giúp quản lý sức khỏe của bạn hiệu quả hơn.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-medium">Liên kết nhanh</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Trang chủ
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="text-muted-foreground hover:text-foreground">
                    Tính năng
                  </Link>
                </li>
                <li>
                  <Link href="#services" className="text-muted-foreground hover:text-foreground">
                    Dịch vụ
                  </Link>
                </li>
                <li>
                  <Link href="#testimonials" className="text-muted-foreground hover:text-foreground">
                    Đánh giá
                  </Link>
                </li>
                <li>
                  <Link href="#contact" className="text-muted-foreground hover:text-foreground">
                    Liên hệ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-medium">Dịch vụ</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Đặt lịch khám
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Tư vấn sức khỏe
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Xét nghiệm
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Khám chuyên khoa
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Cấp cứu
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-medium">Liên hệ</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
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
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <span className="text-muted-foreground">+84 971516103</span>
                </li>
                <li className="flex items-center gap-2">
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
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                  <span className="text-muted-foreground">thangdz1501@gmail.com</span>
                </li>
                <li className="flex items-center gap-2">
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
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span className="text-muted-foreground">Quận Hà Đông, TP.HN</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Hệ Thống Y Tế. Tất cả các quyền được bảo lưu.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
