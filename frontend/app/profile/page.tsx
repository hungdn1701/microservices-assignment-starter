"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/providers/auth-provider"
import UserService from "@/lib/api/user-service"
import { PageHeader } from "@/components/layout/page-header"

const profileSchema = z.object({
  first_name: z.string().min(2, {
    message: "Họ phải có ít nhất 2 ký tự.",
  }),
  last_name: z.string().min(2, {
    message: "Tên phải có ít nhất 2 ký tự.",
  }),
  email: z.string().email({
    message: "Vui lòng nhập địa chỉ email hợp lệ.",
  }),
})

const patientProfileSchema = z.object({
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  blood_type: z.string().optional(),
  height: z.coerce.number().optional(),
  weight: z.coerce.number().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  medical_history: z.string().optional(),
  allergies: z.string().optional(),
})

const addressSchema = z.object({
  address_line1: z.string().min(1, {
    message: "Địa chỉ không được để trống.",
  }),
  address_line2: z.string().optional(),
  city: z.string().min(1, {
    message: "Thành phố không được để trống.",
  }),
  state: z.string().min(1, {
    message: "Tỉnh/Thành phố không được để trống.",
  }),
  postal_code: z.string().min(1, {
    message: "Mã bưu điện không được để trống.",
  }),
  country: z.string().min(1, {
    message: "Quốc gia không được để trống.",
  }),
  is_primary: z.boolean().default(true),
})

const contactSchema = z.object({
  phone_number: z.string().min(1, {
    message: "Số điện thoại không được để trống.",
  }),
  alternative_email: z
    .string()
    .email({
      message: "Vui lòng nhập địa chỉ email hợp lệ.",
    })
    .optional(),
})

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [patientProfile, setPatientProfile] = useState<any>(null)
  const [addresses, setAddresses] = useState<any[]>([])
  const [contactInfo, setContactInfo] = useState<any>(null)

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
    },
  })

  const patientProfileForm = useForm<z.infer<typeof patientProfileSchema>>({
    resolver: zodResolver(patientProfileSchema),
    defaultValues: {
      date_of_birth: "",
      gender: "",
      blood_type: "",
      height: 0,
      weight: 0,
      emergency_contact_name: "",
      emergency_contact_phone: "",
      medical_history: "",
      allergies: "",
    },
  })

  const addressForm = useForm<z.infer<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "",
      is_primary: true,
    },
  })

  const contactForm = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      phone_number: "",
      alternative_email: "",
    },
  })

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true)
      try {
        // Lấy thông tin người dùng hiện tại
        const userData = await UserService.getCurrentUser()
        profileForm.reset({
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
        })

        // Nếu là bệnh nhân, lấy thông tin hồ sơ bệnh nhân
        if (userData.role === "PATIENT") {
          try {
            const patientData = await UserService.getPatientProfile()
            setPatientProfile(patientData)
            patientProfileForm.reset({
              date_of_birth: patientData.date_of_birth || "",
              gender: patientData.gender || "",
              blood_type: patientData.blood_type || "",
              height: patientData.height || 0,
              weight: patientData.weight || 0,
              emergency_contact_name: patientData.emergency_contact_name || "",
              emergency_contact_phone: patientData.emergency_contact_phone || "",
              medical_history: patientData.medical_history || "",
              allergies: patientData.allergies || "",
            })
          } catch (error) {
            console.error("Lỗi khi lấy thông tin hồ sơ bệnh nhân:", error)
          }
        }

        // Lấy danh sách địa chỉ
        try {
          const addressesData = await UserService.getAddresses()
          setAddresses(addressesData)
          if (addressesData.length > 0) {
            const primaryAddress = addressesData.find((addr) => addr.is_primary) || addressesData[0]
            addressForm.reset({
              address_line1: primaryAddress.address_line1 || "",
              address_line2: primaryAddress.address_line2 || "",
              city: primaryAddress.city || "",
              state: primaryAddress.state || "",
              postal_code: primaryAddress.postal_code || "",
              country: primaryAddress.country || "",
              is_primary: primaryAddress.is_primary || true,
            })
          }
        } catch (error) {
          console.error("Lỗi khi lấy danh sách địa chỉ:", error)
        }

        // Lấy thông tin liên hệ
        try {
          const contactData = await UserService.getContactInfo()
          setContactInfo(contactData)
          contactForm.reset({
            phone_number: contactData.phone_number || "",
            alternative_email: contactData.alternative_email || "",
          })
        } catch (error) {
          console.error("Lỗi khi lấy thông tin liên hệ:", error)
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error)
        toast({
          title: "Lỗi",
          description: "Không thể lấy thông tin người dùng. Vui lòng thử lại sau.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchUserData()
    }
  }, [user, profileForm, patientProfileForm, addressForm, contactForm, toast])

  async function onProfileSubmit(values: z.infer<typeof profileSchema>) {
    if (!user) return

    setIsLoading(true)
    try {
      await UserService.updateUser(user.id, values)
      toast({
        title: "Thành công",
        description: "Thông tin cá nhân đã được cập nhật.",
      })
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin cá nhân:", error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin cá nhân. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function onPatientProfileSubmit(values: z.infer<typeof patientProfileSchema>) {
    setIsLoading(true)
    try {
      if (patientProfile) {
        await UserService.updatePatientProfile(values)
      } else {
        await UserService.updatePatientProfile(values)
      }
      toast({
        title: "Thành công",
        description: "Hồ sơ bệnh nhân đã được cập nhật.",
      })
    } catch (error) {
      console.error("Lỗi khi cập nhật hồ sơ bệnh nhân:", error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật hồ sơ bệnh nhân. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function onAddressSubmit(values: z.infer<typeof addressSchema>) {
    setIsLoading(true)
    try {
      if (addresses.length > 0) {
        const primaryAddress = addresses.find((addr) => addr.is_primary) || addresses[0]
        await UserService.updateAddress(primaryAddress.id, values)
      } else {
        await UserService.createAddress(values)
      }
      toast({
        title: "Thành công",
        description: "Địa chỉ đã được cập nhật.",
      })
    } catch (error) {
      console.error("Lỗi khi cập nhật địa chỉ:", error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật địa chỉ. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function onContactSubmit(values: z.infer<typeof contactSchema>) {
    setIsLoading(true)
    try {
      await UserService.updateContactInfo(values)
      toast({
        title: "Thành công",
        description: "Thông tin liên hệ đã được cập nhật.",
      })
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin liên hệ:", error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin liên hệ. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Hồ sơ cá nhân" description="Quản lý thông tin cá nhân và hồ sơ y tế của bạn" />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
          {user?.role === "PATIENT" && <TabsTrigger value="medical">Thông tin y tế</TabsTrigger>}
          <TabsTrigger value="address">Địa chỉ</TabsTrigger>
          <TabsTrigger value="contact">Liên hệ</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={profileForm.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Họ</FormLabel>
                          <FormControl>
                            <Input placeholder="Nguyễn" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tên</FormLabel>
                          <FormControl>
                            <Input placeholder="Văn A" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your.email@example.com" {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Đang cập nhật..." : "Cập nhật thông tin"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Các tab khác tương tự */}
      </Tabs>
    </div>
  )
}
