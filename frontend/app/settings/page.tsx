"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/providers/auth-provider"
import { PageContainer } from "@/components/layout/page-container"

const passwordSchema = z
  .object({
    current_password: z.string().min(6, {
      message: "Mật khẩu hiện tại phải có ít nhất 6 ký tự.",
    }),
    new_password: z.string().min(6, {
      message: "Mật khẩu mới phải có ít nhất 6 ký tự.",
    }),
    confirm_password: z.string().min(6, {
      message: "Xác nhận mật khẩu phải có ít nhất 6 ký tự.",
    }),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirm_password"],
  })

const notificationSchema = z.object({
  email_notifications: z.boolean().default(true),
  appointment_reminders: z.boolean().default(true),
  prescription_notifications: z.boolean().default(true),
  lab_result_notifications: z.boolean().default(true),
  system_notifications: z.boolean().default(true),
})

const privacySchema = z.object({
  share_medical_data: z.boolean().default(false),
  allow_research_use: z.boolean().default(false),
  show_profile_to_doctors: z.boolean().default(true),
})

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  })

  const notificationForm = useForm<z.infer<typeof notificationSchema>>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      email_notifications: true,
      appointment_reminders: true,
      prescription_notifications: true,
      lab_result_notifications: true,
      system_notifications: true,
    },
  })

  const privacyForm = useForm<z.infer<typeof privacySchema>>({
    resolver: zodResolver(privacySchema),
    defaultValues: {
      share_medical_data: false,
      allow_research_use: false,
      show_profile_to_doctors: true,
    },
  })

  async function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
    setIsLoading(true)
    try {
      // Gọi API để thay đổi mật khẩu
      // await UserService.changePassword(values)

      // Giả lập API call thành công
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Thành công",
        description: "Mật khẩu đã được cập nhật.",
      })
      passwordForm.reset({
        current_password: "",
        new_password: "",
        confirm_password: "",
      })
    } catch (error) {
      console.error("Lỗi khi cập nhật mật khẩu:", error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật mật khẩu. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function onNotificationSubmit(values: z.infer<typeof notificationSchema>) {
    setIsLoading(true)
    try {
      // Gọi API để cập nhật cài đặt thông báo
      // await UserService.updateNotificationSettings(values)

      // Giả lập API call thành công
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Thành công",
        description: "Cài đặt thông báo đã được cập nhật.",
      })
    } catch (error) {
      console.error("Lỗi khi cập nhật cài đặt thông báo:", error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật cài đặt thông báo. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function onPrivacySubmit(values: z.infer<typeof privacySchema>) {
    setIsLoading(true)
    try {
      // Gọi API để cập nhật cài đặt quyền riêng tư
      // await UserService.updatePrivacySettings(values)

      // Giả lập API call thành công
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Thành công",
        description: "Cài đặt quyền riêng tư đã được cập nhật.",
      })
    } catch (error) {
      console.error("Lỗi khi cập nhật cài đặt quyền riêng tư:", error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật cài đặt quyền riêng tư. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageContainer>
      <h1 className="mb-6 text-2xl font-bold">Cài đặt</h1>

      <Tabs defaultValue="password" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="password">Mật khẩu</TabsTrigger>
          <TabsTrigger value="notifications">Thông báo</TabsTrigger>
          <TabsTrigger value="privacy">Quyền riêng tư</TabsTrigger>
        </TabsList>

        <TabsContent value="password" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Thay đổi mật khẩu</CardTitle>
              <CardDescription>Cập nhật mật khẩu của bạn để bảo mật tài khoản</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="current_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mật khẩu hiện tại</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="new_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mật khẩu mới</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirm_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt thông báo</CardTitle>
              <CardDescription>Quản lý cách bạn nhận thông báo từ hệ thống</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-4">
                  <FormField
                    control={notificationForm.control}
                    name="email_notifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Thông báo qua email</FormLabel>
                          <FormDescription>Nhận thông báo qua email về các hoạt động trong hệ thống</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="appointment_reminders"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Nhắc nhở cuộc hẹn</FormLabel>
                          <FormDescription>Nhận thông báo nhắc nhở về các cuộc hẹn sắp tới</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Đang cập nhật..." : "Lưu cài đặt"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt quyền riêng tư</CardTitle>
              <CardDescription>Quản lý cách dữ liệu của bạn được sử dụng và chia sẻ</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...privacyForm}>
                <form onSubmit={privacyForm.handleSubmit(onPrivacySubmit)} className="space-y-4">
                  <FormField
                    control={privacyForm.control}
                    name="share_medical_data"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Chia sẻ dữ liệu y tế</FormLabel>
                          <FormDescription>
                            Cho phép chia sẻ dữ liệu y tế của bạn với các bác sĩ khác trong hệ thống
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Đang cập nhật..." : "Lưu cài đặt"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
